const errors = require("./errors.js");
const busboy = require("connect-busboy");
const { catchErrors } = require("./errorHandlers.js");
const mongoose = require("mongoose");
const checker = require('../controllers/checker.js');

exports.dataExtractor = async function (req, res, next, modelName) {
    if (!req.busboy) return errors.manage(res, errors.empty_file, "not found any data");
    let fileData = "";
    let errorOccurred = false;
    req.busboy.on("file", (fieldName, file, filename) => {
        if (!errorOccurred) {
            //if there is some error the function is stopped
            if (fieldName != "file") {
                errorOccurred = true;
                return errors.manage(res, errors.fieldName_error, fieldName + " is not file");
            }
            file.on("data", (data) => {
                if (!errorOccurred) fileData += data.toString();
            });
        }
    });
    req.busboy.on("finish",async () => {
        if (fileData == "") return errors.manage(res, errors.empty_file, "file data not found");
        if (!errorOccurred) {
            let [body, err] = readFile(req, fileData, modelName);
            if (!body) return errors.manage(res, errors.wrong_header, err);
            if (modelName === "Group") {
                body = await  Promise.all(body.map(async function (e) {
                    if (e.users) e.users=await  checker.changeUsernameWithId(req, e.users);
                    return e;
                }))
            }
            req.body = body;
            let controllerName = modelName.toLowerCase();
            const controller = require('../controllers/' + controllerName + 'Controller');
            return controller.post(req, res);
        }
    });
};

const readFile = function (req, fileData, modelName) {
    fileData = fileData.replace(/\"|\r| /g, "");
    let data = fileData.split("\n");
    data = data.filter(function (el) {
        return el != "";
    });
    const model = mongoose.dbs[req.tenant.database].model(modelName);
    const schema = model.schema;
    let requiredFields = [];
    let optionalFields = [];
    for (let key in schema.paths) {
        //owner taken from request user id
        if (schema.paths[key].isRequired && key != "owner") requiredFields.push(key);
        else optionalFields.push(key);
    }
    if (schema.subpaths) {
        for (let key in schema.subpaths) {
            if (schema.subpaths[key].isRequired) requiredFields.push(key);
            else optionalFields.push(key);
        }
    }
    let header = data[0].split(",");
    data.shift();
    if (!requiredFields.every(ai => header.includes(ai))) {
        let missing = [];
        for (val of requiredFields) { if (!header.includes(val)) { missing.push(val); } }
        return [null, "Missing some required fields: needed " + missing + " in the header " + header];
    }
    if (!header.every(el => requiredFields.includes(el) || optionalFields.includes(el))) {
        let unrecognized = [];
        for (val of header) { if (!requiredFields.includes(val) && !optionalFields.includes(val)) { unrecognized.push(val); } }
        return [null, "Some optional element not recognized:  " + unrecognized + " .  Required elements are " + requiredFields + ", optional are " + optionalFields];
    }
    return [createRequestObject(req.user._id, header, data, schema, modelName), null];
}

const createRequestObject = function (owner, header, data, schema, modelName) {//items over more lines, each feature separate by ## in _id column
    let result = {};
    let results = [];
    let supportObj = {};
    for (let element of data) {
        arr = element.split(",");
        if (arr.length > header.length) arr = arr.slice(0, header.length);
        if (Object.keys(result).length > 0 && (header.indexOf("_id") == -1 || arr[header.indexOf("_id")])) {//ended the entity, save it
            results.push(saveResult(modelName, result, owner));
            result = {};
        }
        for (let key of header) {
            if (schema.paths[key]) {//path
                if (schema.paths[key].instance == 'Array') {
                    if (!result[key]) result[key] = [];//not found, create it   
                    if (!arr[header.indexOf(key)]) continue;//blank element
                    result[key].push(...cleanFunction(arr[header.indexOf(key)]));
                }
                else if (header.indexOf("_id") == -1 || arr[header.indexOf("_id")]) result[key] = arr[header.indexOf(key)];//not Array elements can't be splitted in more lines
            }
            else //subpath
            {
                if (arr[header.indexOf(key)]) {
                    if (arr[header.indexOf(key)].startsWith("[")) {//Array
                        let stringData = arr[header.indexOf(key)];
                        stringData = stringData.slice(1, -1);//remove []
                        stringData = stringData.split(";");//doesn't remove "" because the position is important
                        let subKey = key.split(".");
                        if (!result[subKey[0]]) result[subKey[0]] = [];//not found, create it
                        if (!supportObj[subKey[0]]) supportObj[subKey[0]] = [];//not found, create it                        
                        if (supportObj[subKey[0]].length == 0 && stringData.length > 0) {//first time
                            for (let i in stringData) { supportObj[subKey[0]].push({}); }
                        }
                        for (let k in stringData) { if (stringData[k]) supportObj[subKey[0]][k][subKey[1]] = stringData[k]; }
                    }
                    else {//the subpath is not an array
                        let subKey = key.split(".");
                        if (!result[subKey[0]]) result[subKey[0]] = [];//not found, create it                      
                        if (!supportObj[subKey[0]]) supportObj[subKey[0]] = {};//not found, create it    
                        supportObj[subKey[0]][subKey[1]] = arr[header.indexOf(key)];
                    }
                }
            }
        }
        if (Object.keys(supportObj).length > 0) {
            for (let k of Object.keys(supportObj)) {
                if (Array.isArray(supportObj[k])) { for (let j in supportObj[k]) { result[k].push(supportObj[k][j]); } }
                else result[k].push(supportObj[k]);
            }
            supportObj = {};
        }
    }
    //save at the end of for loop
    results.push(saveResult(modelName, result, owner));
    return results;
};

const cleanFunction = function (arr) {
    let array = arr.split(/[[\];, ]/);
    array = array.filter(function (el) {
        return el != "";
    });
    return array;
}

const saveResult = function (modelName, result, owner) {
    if (modelName === "Feature") {//accept items.unit=" "
        if (result.items) {
            result.items = result.items.map(function (el) {
                if (el.name) { if (!el.unit) { el.unit = " "; } }
                return el;
            })
        }
    }
    result["owner"] = owner;
    return result;
}