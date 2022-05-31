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
            req.body=body;
            //const Model = mongoose.dbs[req.tenant.database].model(modelName);
            return featureController.post(req,res);            
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
    let header = data[0].split(",");
    data.shift();
    const headerExpected = [
        'tags',
        'visibility',
        '_id',
        'items.name',
        'items.type',
        'items.dimension',
        'items.unit'
    ]
    let result = Array.isArray(headerExpected) &&
        Array.isArray(header) &&
        headerExpected.length === header.length &&
        headerExpected.every(ai => header.includes(ai));

    if (!result) {
        return [null, "expected this header: " + headerExpected + " , instead of " + header];
    }
    let bodyResults = createRequestObject(req, header, data);

    return [bodyResults, null];

}

const createRequestObject = function (req, header, data) {
    let results = [];
    let result = null;
    let item = [];
    let arr = null;
    for (let element of data) {
        arr = element.split(",");
        if (!arr[header.indexOf("_id")]) { continue; }
        let tagsArr = cleanFunction("tags", arr, header);
        let nameArr = cleanFunction("items.name", arr, header);
        let unitArr = cleanFunction("items.unit", arr, header);
        let typeArr = cleanFunction("items.type", arr, header);
        let dimensionArr = cleanFunction("items.dimension", arr, header);

        for (let itemElement in nameArr) {
            item.push({
                "name": nameArr[itemElement],
                "unit": unitArr[itemElement],
                "type": typeArr[itemElement],
                "dimension": dimensionArr[itemElement]
            })
        }

        result = {
            "_id": arr[header.indexOf("_id")],
            "tags": tagsArr,
            "visibility": arr[header.indexOf("visibility")],
            "owner": req.user._id,
            "items": item
        };
        results.push(result);
        result = null;
        item = []
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
