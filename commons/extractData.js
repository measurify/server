const errors = require("./errors.js");
const busboy = require("connect-busboy");
const mongoose = require("mongoose");
const checker = require('../controllers/checker.js');
const inspector = require("./inspector.js");
const conversion = require("./conversion.js");
const csvtranspose = require('csv-transpose');
const { sep } = require("path");
const { file } = require("../types/itemTypes.js");

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
    req.busboy.on("finish", async () => {
        if (fileData == "") return errors.manage(res, errors.empty_file, "file data not found");
        if (!errorOccurred) {
            let transpose = false;
            if (req.method === 'PUT' && modelName === "Experiment") { transpose = true; }
            let fileText = readFile(req, fileData, modelName, transpose);
            if (req.method === 'PUT' && modelName === "Experiment") { return addHistory(req, res, fileText, modelName) }
            let result = inspector.checkHeader(fileText.schema, fileText.header);
            if (result !== true) return errors.manage(res, errors.wrong_header, result);
            let body = conversion.csv2json(fileText.userId, fileText.header, fileText.data, fileText.schema, modelName);

            if (modelName === "Group") {
                body = await Promise.all(body.map(async function (e) {
                    if (e.users) e.users = await checker.changeUsernameWithId(req, e.users);
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

const readFile = function (req, fileData, modelName, transpose) {
    let fileText = {};
    fileText.userId = req.user._id;
    if (transpose) { fileData = transposeCsv(fileData); }
    fileData = fileData.replace(/\"|\r| /g, "");
    let data = fileData.split("\n");
    data = data.filter(function (el) {
        return el != "";
    });
    const model = mongoose.dbs[req.tenant.database].model(modelName);
    fileText.schema = model.schema;
    fileText.header = data[0].split(",");
    data.shift();
    fileText.data = data;
    return fileText;
}

const transposeCsv = function (text) {
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    let separator = process.env.CSV_DELIMITER;
    return csvtranspose.transpose(text, separator);
}

const addHistory = function (req, res, fileText, modelName) {
    if (!fileText.header.includes("step")&&!fileText.header.includes("Step")) return errors.manage(res, errors.wrong_header, "Needed step row in the csv");
    let body = {
        "history": { "add": [] }
    }
    let data = fileText.data;
    for (let element of data) {
        let obj = { "fields": [] };
        arr = element.split(",");
        for (let el in arr) {
            if (fileText.header[el] === "step"|| fileText.header[el] === "Step" || fileText.header[el] === "timestamp") { obj[fileText.header[el].toLowerCase()] = arr[el] }
            else { if (arr[el]) { obj.fields.push({ "name": fileText.header[el], "value": arr[el] }) } }
        }
        body.history.add.push(obj);
    }
    req.body = body;
    let controllerName = modelName.toLowerCase();
    const controller = require('../controllers/' + controllerName + 'Controller');
    return controller.put(req, res);
}