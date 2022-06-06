const errors = require("./errors.js");
const busboy = require("connect-busboy");
const { file } = require("../types/itemTypes.js");
const { catchErrors } = require("./errorHandlers.js");
const mongoose = require("mongoose");
const persistence = require("./persistence.js");
const featureController = require('../controllers/featureController');



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
            //const Model = mongoose.dbs[req.tenant.database].model(modelName);
            return featureController.post(req, res);
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
    //console.log(data);
    let header = data[0].split(",");
    data.shift();
    const headerExpected = [//tags optional
        'visibility',
        '_id',
        'items.name',
        'items.type',
        'items.dimension',
        'items.unit'
    ]
    let result = Array.isArray(headerExpected) &&
        Array.isArray(header) &&
        headerExpected.length <= header.length &&
        headerExpected.every(ai => header.includes(ai));

    if (!result) {
        return [null, "expected this header: " + headerExpected + " , instead of " + header];
    }

    let bodyResults = null;
    if (req.headers.accept == 'text/csvCustom') {
        bodyResults = createRequestObjectCustom(req.user._id, header, data);
    }
    else {
        bodyResults = createRequestObject(req.user._id, header, data);
    }
    return [bodyResults, null];

}

const createRequestObject = function (owner, header, data) {
    let results = [];
    let result = null;
    let items = [];
    let arr = null;
    let tagsArr = [];
    for (let element of data) {
        arr = element.split(",");
        if (!arr[header.indexOf("_id")]) { continue; }//no id continue
        if (header.indexOf("tags") != -1) { tagsArr = cleanFunction("tags", arr, header); }//tags optional
        let nameArr = cleanFunction("items.name", arr, header);
        let unitArr = cleanFunction("items.unit", arr, header);
        let typeArr = cleanFunction("items.type", arr, header);
        let dimensionArr = cleanFunction("items.dimension", arr, header);

        for (let itemElement in nameArr) {
            let item = {};
            item["name"] = nameArr[itemElement];
            item["unit"] = unitArr[itemElement];
            if (typeArr[itemElement] != null && typeArr[itemElement] != "") {//if null or "" use default value
                item["type"] = typeArr[itemElement];
            }
            if (dimensionArr[itemElement] != null && dimensionArr[itemElement] != "") {//if null or "" use default value
                item["dimension"] = dimensionArr[itemElement];
            }            
            items.push(item);
        }

        result = {
            "_id": arr[header.indexOf("_id")],
            "tags": tagsArr,
            "visibility": arr[header.indexOf("visibility")],
            "owner": owner,
            "items": items
        };
        results.push(result);
        result = null;
        items = []
    }
    return results;
};

const cleanFunction = function (name, arr, header) {
    let array = arr[header.indexOf(name)].split(/[[\];, ]/);
    array = array.filter(function (el) {
        return el != "";
    });
    return array;
}

const createRequestObjectCustom = function (owner, header, data) {//items over more lines, each feature separate by ## in _id column
    let results = [];
    let result = null;


    let arr = null;
    let id = null;
    let visibility = null;
    let items = [];
    let tags = [];

    for (let element of data) {
        arr = element.split(",");
        if (arr[header.indexOf("_id")] == "##") { //save and reset
            result = {
                "_id": id,
                "tags": tags,
                "visibility": visibility,
                "owner": owner,
                "items": items
            };
            results.push(result);
            result = null;
            id = null;
            visibility = null;
            items = [];
            tags = [];
            continue;
        }
        if (id == null) {//first row
            id = arr[header.indexOf("_id")];
            visibility = arr[header.indexOf("visibility")];
        }
        if (arr[header.indexOf("items.name")] != "" && arr[header.indexOf("items.name")] != null) {
            let item = {}
            item["name"] = arr[header.indexOf("items.name")];
            item["unit"] = arr[header.indexOf("items.unit")];
            if (arr[header.indexOf("items.type")] != null && arr[header.indexOf("items.type")] != "") {//optional
                item["type"] = arr[header.indexOf("items.type")];
            }
            if (arr[header.indexOf("items.dimension")] != null && arr[header.indexOf("items.dimension")] != "") {//optional
                item["dimension"] = arr[header.indexOf("items.dimension")];
            }
            items.push(item);
        }
        if (header.indexOf("tags") != -1) {
            if (arr[header.indexOf("tags")] != "" && arr[header.indexOf("tags")] != null) {
                tags.push(arr[header.indexOf("tags")]);
            }
        }
    }
    if (id != null) {//save
        result = {
            "_id": id,
            "tags": tags,
            "visibility": visibility,
            "owner": owner,
            "items": items
        };
        results.push(result);
    }
    return results;
};