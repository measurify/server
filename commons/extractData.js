const errors = require("./errors.js");
const busboy = require("connect-busboy");
const { file } = require("../types/itemTypes.js");
const { catchErrors } = require("./errorHandlers.js");
const mongoose = require("mongoose");
const persistence = require("./persistence.js");




//extract data when receive a form-data post
exports.dataExtractor = async function (req, res, next, modelName) {
    if (!req.busboy) { return errors.manage(res, errors.empty_file, "not found any data"); }
    let fileData = null;
    let errorOccurred = false;
    req.busboy.on("file", (fieldName, file, filename) => {
        //fieldname is the key of the file

        if (!errorOccurred) {
            //if there is some error the lambda function is stopped
            if (fieldName != "file") {
                errorOccurred = true;
                return errors.manage(res, errors.fieldName_error, fieldName + " is not file");
            }
            file.on("data", (data) => {
                if (!errorOccurred) {
                    //if there is some error the lambda function is stopped
                    if (fieldName == "file") {
                        if (fileData === null) {
                            fileData = data.toString();
                        } else {
                            fileData += data.toString();
                            //return errors.manage(res, errors.max_one_file, "max one file for each post");
                        }
                    }
                }
            });
        }
    });
    req.busboy.on("finish", () => {
        if (!fileData) {
            return errors.manage(res, errors.empty_file, "file data not found");
        }
        if (!errorOccurred) {

            let [body, err] = readFile(req, fileData, modelName);
            if (!body) { return errors.manage(res, errors.wrong_header, err) }
            //console.log(body);
            req.body = body;

            let controllerName = modelName.toLowerCase();
            const controller = require('../controllers/' + controllerName + 'Controller');
            return controller.post(req, res);
        }
    }
    );
};


const readFile = function (req, fileData, modelName) {
    fileData = fileData.replace("\"", "");
    let data = fileData.split("\r\n");
    data = data.filter(function (el) {
        return el != "";
    });
    const model = mongoose.dbs[req.tenant.database].model(modelName);
    const schema = model.schema;
    let requiredFields = [];
    let optionalFields = [];
    for (let key in schema.paths) {
        if (schema.paths[key].isRequired && key != "owner") {//owner taken from request user id
            requiredFields.push(key);
        }
        else {
            optionalFields.push(key);
        }
    }
    if (schema.subpaths) {
        for (let key in schema.subpaths) {
            if (schema.subpaths[key].isRequired) {
                requiredFields.push(key);
            }
            else {
                optionalFields.push(key);
            }

        }
    }
    //console.log(data);
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

    let bodyResults = null;

    bodyResults = createRequestObject(req.user._id, header, data, schema);

    return [bodyResults, null];
}

const createRequestObject = function (owner, header, data, schema) {//items over more lines, each feature separate by ## in _id column
    let result = {};
    let results = [];
    let supportObj = {};

    for (let element of data) {//da fare check quando esce e salvare

        arr = element.split(",");

        if (Object.keys(result).length > 0 && header.indexOf("_id") == -1) {//not found id
            result["owner"] = owner;
            results.push(result);
            result = {};
        }
        else {
            if (Object.keys(result).length > 0 && (arr[header.indexOf("_id")] != "" && arr[header.indexOf("_id")] != " " && arr[header.indexOf("_id")] != null)) {//new line
                result["owner"] = owner;
                results.push(result);
                result = {};
            }
        }
        for (let key of header) {


            if (schema.paths[key]) {//path
                if (schema.paths[key].instance == 'Array') {
                    if (!result[key]) {//not found, create it
                        result[key] = [];
                    }
                    let value = cleanFunction(arr[header.indexOf(key)]);
                    for (let v of value) { result[key].push(v); }
                }
                else {
                    if (header.indexOf("_id") == -1) {
                        result[key] = arr[header.indexOf(key)];
                    }
                    else {
                        if (arr[header.indexOf("_id")] != "" && arr[header.indexOf("_id")] != " " && arr[header.indexOf("_id")] != null) {//an element that is not an Array can't have more than 1 line for its fields
                            result[key] = arr[header.indexOf(key)];
                        }
                    }
                }
            }
            else //subpath
            {
                if (arr[header.indexOf(key)] != "" && arr[header.indexOf(key)] != " " && arr[header.indexOf(key)] != null) {
                    if (arr[header.indexOf(key)].startsWith("[")) {
                        let stringData = arr[header.indexOf(key)];
                        stringData = stringData.slice(1, -1);//remove []
                        stringData = stringData.split(";");//doesn't remove "" because the position is important

                        let subKey = key.split(".");

                        if (!result[subKey[0]]) {//not found, create it
                            result[subKey[0]] = [];
                        }
                        if (!supportObj[subKey[0]]) {//not found, create it                    
                            supportObj[subKey[0]] = [];
                        }
                        if (supportObj[subKey[0]].length == 0 && stringData.length > 0) {//first time
                            for (let i in stringData) {
                                supportObj[subKey[0]].push({});
                            }
                        }
                        for (let k in stringData) {
                            if (stringData[k] != "" && stringData[k] != " " && stringData[k] != null) {
                                supportObj[subKey[0]][k][subKey[1]] = stringData[k];
                            }
                        }
                    }
                    else {//the subpath is not an array
                        let subKey = key.split(".");
                        if (!result[subKey[0]]) {//not found, create it
                            result[subKey[0]] = [];
                        }
                        if (!supportObj[subKey[0]]) {//not found, create it                    
                            supportObj[subKey[0]] = {};
                        }
                        supportObj[subKey[0]][subKey[1]] = arr[header.indexOf(key)];
                    }
                }
            }
        }
        if (Object.keys(supportObj).length > 0) {
            for (let k of Object.keys(supportObj)) {
                if (Array.isArray(supportObj[k])) {
                    for (let j in supportObj[k]) {
                        result[k].push(supportObj[k][j]);
                    }
                }
                else {
                    result[k].push(supportObj[k]);
                }
            }
            supportObj = {};
        }

    }
    //save at the end of for loop
    result["owner"] = owner;
    results.push(result);
    return results;
};

const cleanFunction = function (arr) {
    let array = arr.split(/[[\];, ]/);
    array = array.filter(function (el) {
        return el != "";
    });
    return array;
}
