const errors = require("./errors.js");
const busboy = require("connect-busboy");
const mongoose = require("mongoose");
const checker = require('../controllers/checker.js');
const inspector = require("./inspector.js");
const conversion = require("./conversion.js");
const csvtranspose = require('csv-transpose');
const { sep } = require("path");
const { file } = require("../types/itemTypes.js");
const XLSX = require("xlsx");

exports.dataExtractor = async function (req, res, next, modelName) {
    if (!req.busboy) return errors.manage(res, errors.empty_file, "not found any data");
    let fileData = "";
    let errorOccurred = false;
    let namefile = null;
    const buffers = [];
    let workbook = null;
    req.busboy.on("file", (fieldName, file, filename) => {
        if (!errorOccurred) {
            if (!namefile) namefile = filename.filename;
            //if there is some error the function is stopped
            if (fieldName != "file") {
                errorOccurred = true;
                return errors.manage(res, errors.fieldName_error, fieldName + " is not file");
            }
            file.on("data", (data) => {
                if (!errorOccurred) { fileData += data.toString(); if (namefile.toLowerCase().endsWith('.xlsx')) { buffers.push(data) } }
            });
            file.on('end', () => {
                if (namefile.toLowerCase().endsWith('.xlsx')) {
                    let buffer = Buffer.concat(buffers)
                    workbook = XLSX.read(buffer, {
                        type: 'buffer',
                    })
                }
            })
        }
    });
    req.busboy.on("finish", async () => {
        if (fileData == "") return errors.manage(res, errors.empty_file, "file data not found");
        if (!errorOccurred) {
            if (namefile.toLowerCase().endsWith('.csv') || namefile.toLowerCase().endsWith('.xlsx')) {
                if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
                let sep=process.env.CSV_DELIMITER
                if(req.query&&req.query.sep)sep=req.query.sep;
                if (namefile.toLowerCase().endsWith('.xlsx')) {
                    try {
                        const csvExcelProducts = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]], {
                            raw: false,
                            header: 1,
                            dateNF: 'yyyy-mm-dd',
                            blankrows: false,
                            FS:sep
                        })
                        fileData = csvExcelProducts;
                    } catch (err) {
                        return errors.manage(res, errors.wrong_xlsx, err);
                    }
                }
                let error =null;
                if(req.query) [fileData,error] = replaceSeparator(fileData, req.query);//req query sep sepArray sepFloat
                if(error)return errors.manage(res, errors.separatorError, error);
                let transpose = false;
                if (req.method === 'PUT' && modelName === "Experiment") { transpose = true; }                
                let fileText = readFile(req, fileData, modelName, transpose);
                if (req.method === 'PUT' && modelName === "Experiment") { return addHistory(req, res, fileText, modelName) }                
                let result = inspector.checkHeader(fileText.schema, fileText.header,modelName);                
                if (result !== true) return errors.manage(res, errors.wrong_header, result);
                let body = conversion.csv2json(fileText.userId, fileText.header, fileText.data, fileText.schema, modelName);                
                if(modelName === "Timesample"){body.forEach(item => item.measurement = req.params.id)}
                if (modelName === "Group") {
                    body = await Promise.all(body.map(async function (e) {
                        if (e.users) e.users = await checker.changeUsernameWithId(req, e.users);
                        return e;
                    }))
                }

                req.body = body;
                let controllerName = modelName!="Timesample"? modelName.toLowerCase():"timeserie";
                
                const controller = require('../controllers/' + controllerName + 'Controller');
                return controller.post(req, res);
            }
            else {//.txt .JSON ecc
                try { req.body = JSON.parse(fileData); } catch (error) { return errors.manage(res, errors.post_request_error, "data not in JSON. " + error); }
                let controllerName = modelName.toLowerCase();
                const controller = require('../controllers/' + controllerName + 'Controller');
                return controller.post(req, res);
            }
        }
    });
};

const readFile = function (req, fileData, modelName, transpose) {
    let fileText = {};
    fileText.userId = req.user._id;
    if (transpose) { fileData = exports.transposeCsv(fileData); }
    fileData = fileData.replace(/\"|\r/g, "");
    let data = fileData.split("\n");
    data = data.filter(function (el) {
        return el != "";
    });
    const model = mongoose.dbs[req.tenant.database].model(modelName);
    fileText.schema = model.schema;
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    fileText.header=data[0];
    fileText.header=restoreHeader(fileText.header,req.query)
    fileText.header = fileText.header.split(process.env.CSV_DELIMITER).map(el => el.replace(/^\s+|\s+$/g, ""));
    fileText.header = fileText.header.map(element => {
        if(element.toLowerCase()=="step")return element.toLowerCase();
        return element;
      });
    data.shift();
    fileText.data = data;
    return fileText;
}

exports.transposeCsv = function (text) {
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    let separator = process.env.CSV_DELIMITER;
    return csvtranspose.transpose(text, separator);
}

const addHistory = function (req, res, fileText, modelName) {
    if (!fileText.header.includes("step") && !fileText.header.includes("Step")) return errors.manage(res, errors.wrong_header, "Needed step row in the csv");
    let body = {
        "history": { "add": [] }
    }
    let data = fileText.data;
    for (let element of data) {
        let obj = { "fields": [] };
        arr = element.split(process.env.CSV_DELIMITER).map(el => el.replace(/^\s+|\s+$/g, ""));
        if (arr[fileText.header.indexOf("step")].replace(/\s/g, '')) {
            for (let el in arr) {
                if (fileText.header[el].toLowerCase() === "step" || fileText.header[el].toLowerCase() === "timestamp") { obj[fileText.header[el].toLowerCase()] = arr[el] }
                else { if (arr[el]&&arr[el]!=="[]") { obj.fields.push({ "name": fileText.header[el], "value": arr[el] }) } }
            }
            body.history.add.push(obj);
        }
    }
    if(body.history.add.length==0)return errors.manage(res, errors.file_history_empty); 
    req.body = body;
    let controllerName = modelName.toLowerCase();
    const controller = require('../controllers/' + controllerName + 'Controller');
    return controller.put(req, res);
}

const replaceSeparator = function (fileData, query) {    
    if (!process.env.CSV_VECTOR_DELIMITER) process.env.CSV_VECTOR_DELIMITER = ';';
    if(query.sep==".")return [null, "Separator can't be a dot"];
    let sep = !query.sep ? process.env.CSV_DELIMITER : query.sep;
    let sepArray = !query.sepArray ? process.env.CSV_VECTOR_DELIMITER : query.sepArray;
    let sepFloat = !query.sepFloat ? "." : query.sepFloat;
    if (!query || (!query.sep && !query.sepArray && !query.sepFloat)) return [fileData,null];
    if (sep === sepArray) return [null, "Separator and Separator Array can't be the same " + sep];
    if (sep === sepFloat) return [null, "Separator and Separator Float can't be the same " + sep];
    if (sepArray === sepFloat) return [null, "Separator Array and Separator Float can't be the same " + sepArray];
    if (sep != process.env.CSV_DELIMITER) {
        let regex = new RegExp("\\"+sep, "g");
        fileData = fileData.replace(regex, "¤");
    }    
    if (sepArray != process.env.CSV_VECTOR_DELIMITER) {
        regex = new RegExp("\\"+sepArray, "g");        
        fileData = fileData.replace(regex, "¬");
    }    
    if (sepFloat != ".") {
        regex = new RegExp("\\"+sepFloat, "g");
        fileData = fileData.replace(regex, "§");
    }    
    fileData = fileData.replace(/¤/g, process.env.CSV_DELIMITER);
    fileData = fileData.replace(/¬/g, process.env.CSV_VECTOR_DELIMITER);
    fileData = fileData.replace(/§/g, ".");    
    return [fileData,null];
}

const restoreHeader = function (header,query) {//replaceSeparator may change info in destroy header e.g. place.name the dot can change    
    let sepArray = !query.sepArray ? process.env.CSV_VECTOR_DELIMITER : query.sepArray;
    if(sepArray=="."){let regex= new RegExp("\\"+process.env.CSV_VECTOR_DELIMITER, "g");header=header.replace(regex,".")}
    return header;
}