const { isArray, forEach, isObject } = require('underscore');

exports.csv2json = function (owner, header, data, schema, modelName) {//items over more lines
    let result = {};
    let results = [];
    let supportObj = {};
    for (let element of data) {
        arr = element.split(process.env.CSV_DELIMITER).map(el=>el.replace(/^\s+|\s+$/g, ""));
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

exports.jsonToCSVPlus =function (jsonData, columnsname) {
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    if (!process.env.CSV_VECTOR_START) process.env.CSV_VECTOR_START = '';
    if (!process.env.CSV_VECTOR_END) process.env.CSV_VECTOR_END = '';
    if (!process.env.CSV_VECTOR_DELIMITER) process.env.CSV_VECTOR_DELIMITER = ';'
    jsonData = JSON.stringify(jsonData);
    const json =
        typeof jsonData !== "object" ? JSON.parse(jsonData) : jsonData;
    columnsname = columnsname.map(x => `"${x}"`).join(",");

    let str = process.env.CSV_VECTOR_START +
        `${Object.keys(json.docs[0])//csv header
            .map((value) => {
                if (value == "samples") {
                    return columnsname;
                }
                else return `"${value}"`
            })
            .join(process.env.CSV_DELIMITER)}` + process.env.CSV_DELIMITER + "\"deltatime\"" + "\n";            
    currentRow = "\n";//string for samples with more values
    json.docs.forEach(doc => {//loop for each sample
        str +=//single sample
            `${Object.values(doc)//for each field of sample, e.g. visibility,tags ecc
                .map((value) => {
                    if (isArray(value))//for array values e.g. tags 
                    {
                        if (value.length == 0) {//default empty
                            currentRow += `"[]"` + process.env.CSV_DELIMITER;
                            return `"[]"`;
                        }
                        if (isObject(value[0])) {
                            return value.map((x) => {
                                delta = 0;//inizialization and default = 0
                                if (x.delta != null) delta = x.delta;  //add as a column                            
                                // if it's an object containing values:
                                return x.values.map(x => `"${x}"`).join(process.env.CSV_DELIMITER) + process.env.CSV_DELIMITER + "\"" + delta + "\"";//mappa i valori di values separandoli con una virgola. 
                            }
                            ).join(currentRow);
                        }
                        else {
                            currentRow += "[" + value + "]" + process.env.CSV_DELIMITER;
                            return "[" + value + "]";
                        }//for tags
                    }
                    else {
                        currentRow += `"${value}"` + process.env.CSV_DELIMITER;
                        return `"${value}"`
                    }
                }).join(process.env.CSV_DELIMITER)}` + "\n";
        currentRow = "\n";
    });//if it is a single string field it only add the string to the row
    str += process.env.CSV_VECTOR_END;
    return str;
}

exports.jsonToCSV = function (jsonData) {
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    jsonData = JSON.stringify(jsonData);
    const json = typeof jsonData !== "object" ? JSON.parse(jsonData) : jsonData;
    const { Parser, transforms: { unwind } } = require('json2csv');
    const fields = ["visibility", "tags", "_id", "startDate", "endDate", "thing", "feature", "device", { label: 'values', value: 'samples.values' }, { label: 'deltatime', value: 'samples.delta', default: 0 }];
    const transforms = [unwind({ paths: ['samples'] })];
    const json2csvParser = new Parser({ fields, transforms, delimiter: process.env.CSV_DELIMITER });
    const csv = json2csvParser.parse(json.docs);
    return csv;
}