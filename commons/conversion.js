const { isArray, forEach, isObject } = require('underscore');
const extractData = require("./extractData.js");
const errors = require("./errors.js");
const mongoose = require('mongoose');

exports.csv2json = function (owner, header, data, schema, modelName) {//items over more lines
    let result = {};
    let results = [];
    let supportObj = {};
    let subKey = [];
    let keyMemory = {};
    for (let element of data) {
        arr = element.split(process.env.CSV_DELIMITER).map(el => el.replace(/^\s+|\s+$/g, ""));
        if (arr.length > header.length) arr = arr.slice(0, header.length);
        if (Object.keys(result).length > 0 && (header.indexOf("_id") == -1 || arr[header.indexOf("_id")])) {//ended the entity, save it
            results.push(saveResult(modelName, result, owner));
            result = {};
        }
        for (let key of header) {
            if (schema.paths[key]) {//path
                if (!keyMemory) keyMemory.key = 1;
                if (schema.paths[key].instance == 'Array') {
                    if (!result[key]) result[key] = [];//not found, create it   
                    if (!arr[header.indexOf(key)]) continue;//blank element
                    try {
                        result[key].push(...cleanFunction(arr[header.indexOf(key)], modelName));
                    } catch (error) {
                        throw new Error('Error in CSV format')
                    }
                }
                else if (header.indexOf("_id") == -1 || arr[header.indexOf("_id")]) result[key] = arr[header.indexOf(key)];//not Array elements can't be splitted in more lines
            }
            else //subpath
            {
                if (arr[header.indexOf(key)]) {
                    subKey = key.split(".");
                    if (!keyMemory[subKey[0]]) keyMemory[subKey[0]] = subKey.length;
                    else { if (keyMemory[subKey[0]] < subKey.length) { keyMemory[subKey[0]] = subKey.length } }
                    if (subKey.length == 2) {
                        if (arr[header.indexOf(key)].startsWith("[")) {//Array
                            let stringData = arr[header.indexOf(key)];
                            stringData = stringData.slice(1, -1);//remove []
                            if (!(modelName === "Experiment" && subKey[0] === "metadata")) stringData = stringData.split(";");//doesn't remove "" because the position is important
                            else stringData = [stringData.split(";")];

                            if (!result[subKey[0]]) result[subKey[0]] = [];//not found, create it
                            if (!supportObj[subKey[0]]) supportObj[subKey[0]] = [];//not found, create it                        
                            if (supportObj[subKey[0]].length == 0 && stringData.length > 0) {//first time
                                for (let i in stringData) { supportObj[subKey[0]].push({}); }
                            }
                            for (let k in stringData) { if (stringData[k] !== undefined && stringData[k] !== "") { if (!(modelName === "Experiment" && subKey[0] === "metadata")) { supportObj[subKey[0]][k][subKey[1]] = stringData[k] } else { if (k == 0) { supportObj[subKey[0]][subKey[1]] = stringData[0]; } } } }

                        }
                        else {//the subpath is not an array                        
                            if (!result[subKey[0]]) result[subKey[0]] = [];//not found, create it                      
                            if (!supportObj[subKey[0]]) supportObj[subKey[0]] = {};//not found, create it    
                            supportObj[subKey[0]][subKey[1]] = arr[header.indexOf(key)];
                        }
                    }
                    else {//long 3 key1.key2.key3
                        if (arr[header.indexOf(key)].startsWith("[")) {//Array
                            let stringData = arr[header.indexOf(key)];
                            stringData = stringData.slice(1, -1);//remove []
                            stringData = stringData.split(";");//doesn't remove "" because the position is important

                            if (!result[subKey[0]]) result[subKey[0]] = [];//not found, create it
                            if (!result[subKey[0]][subKey[1]]) result[subKey[0]][subKey[1]] = [];//not found, create it
                            if (!supportObj[subKey[0]]) supportObj[subKey[0]] = [];//not found, create it 
                            if (!supportObj[subKey[0]][subKey[1]]) supportObj[subKey[0]][subKey[1]] = [];//not found, create it                        
                            if (supportObj[subKey[0]][subKey[1]].length == 0 && stringData.length > 0) {//first time
                                for (let i in stringData) { supportObj[subKey[0]][subKey[1]].push({}); }
                            }
                            for (let k in stringData) { if (stringData[k]) supportObj[subKey[0]][subKey[1]][k][subKey[2]] = stringData[k]; }
                        }
                        else {//the subpath is not an array                        
                            if (!result[subKey[0]]) result[subKey[0]] = [];//not found, create it   
                            //if (!result[subKey[0]][subKey[1]]) result[subKey[0]][subKey[1]] = [];//not found, create it     
                            if (!supportObj[subKey[0]]) supportObj[subKey[0]] = [];//not found, create it              
                            if (!supportObj[subKey[0]][subKey[1]]) supportObj[subKey[0]][subKey[1]] = [{}];//not found, create it    
                            supportObj[subKey[0]][subKey[1]][0][subKey[2]] = arr[header.indexOf(key)];
                        }
                    }
                }
            }
        }
        if (Object.keys(supportObj).length > 0) {
            for (let k of Object.keys(supportObj)) {
                if (Array.isArray(supportObj[k])) {
                    if (keyMemory[k] <= 2 || supportObj[k].name || supportObj[k]._id) {//exist .name, otherwise it's a part of the previous line
                        for (let j in supportObj[k]) { result[k].push(supportObj[k][j]); }
                    }
                    else {
                        for (let j in supportObj[k]) { result[k][result[k].length - 1][j].push(...supportObj[k][j]); }
                    }
                }
                else result[k].push(supportObj[k]);
            }
            supportObj = {};
        }
    }
    //save at the end of for loop
    results.push(saveResult(modelName, result, owner));
    return results;
};

const cleanFunction = function (arr, modelName) {
    let array = null;
    try {
        if (modelName == "Timesample") {
            if (!/[a-zA-Z]/g.test(arr)) {
                if (arr.startsWith("[") && arr.endsWith("]")) return JSON.parse(arr.replace(/;/g, ','));
                else { arr = "[" + arr + "]"; return JSON.parse(arr.replace(/;/g, ',')); }
            }
            else {
                let arrNew = null;
                arr = arr.replace(/;/g, ',');
                if (arr.startsWith("[") && arr.endsWith("]")) arrNew = arr.slice(1, -1).split(/[[\];, ]/);
                arrNew = arrNew.filter(function (el) { return el !== ""; });
                arrNew.forEach(function (el2) { if (/[a-zA-Z]/g.test(el2)) arr = arr.replace(el2, '"' + el2 + '"') });
                arr = JSON.parse(arr);
                //console.log(arr)
                return arr;
            }
        }
        else {
            if (arr.startsWith("[") && arr.endsWith("]")) arr.slice(1, -1);
            array = arr.split(/[[\];, ]/);
            array = array.filter(function (el) {
                return el != "";
            });
        }
        return array;
    }
    catch (error) { console.log(error); return null; }
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

exports.jsonToCSVPlus = function (jsonData, columnsname, query) {
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    if (!process.env.CSV_VECTOR_START) process.env.CSV_VECTOR_START = '';
    if (!process.env.CSV_VECTOR_END) process.env.CSV_VECTOR_END = '';
    if (!process.env.CSV_VECTOR_DELIMITER) process.env.CSV_VECTOR_DELIMITER = ';';
    if (!jsonData.docs.length) throw new Error('Not found any element')
    jsonData = JSON.stringify(jsonData);
    const json = typeof jsonData !== "object" ? JSON.parse(jsonData) : jsonData;

    columnsname = columnsname.join(process.env.CSV_DELIMITER);

    let str = process.env.CSV_VECTOR_START +
        `${Object.keys(json.docs[0])//csv header
            .map((value) => {
                if (value == "samples") {
                    return columnsname;
                }
                else return `${value}`
            })
            .join(process.env.CSV_DELIMITER)}` + "\n";//removed + process.env.CSV_DELIMITER + deltatime

    //Rename the fields of the headers with query.rename
    if (query && query.rename) {
        let rename = JSON.parse(query.rename);
        if (rename && Object.keys(rename).length > 0) {
            for (let key of Object.keys(rename)) {
                str = str.replace(key, rename[key]);
            }
        }
    }
    currentRow = "\n";//string for samples with more values
    json.docs.forEach(doc => {//loop for each sample
        str +=//single sample
            `${Object.values(doc)//for each field of sample, e.g. visibility,tags ecc
                .map((value) => {
                    if (isArray(value))//for array values e.g. tags 
                    {
                        if (value.length == 0) {//default empty
                            currentRow += `[]` + process.env.CSV_DELIMITER;
                            return `[]`;
                        }
                        if (isObject(value[0])) {
                            return value.map((x) => {
                                delta = 0;//inizialization and default = 0
                                if (x.delta != null) delta = x.delta;  //add as a column                            
                                // if it's an object containing values:
                                return x.values.map(x => { if (isArray(x)) { return "[" + x.join(process.env.CSV_VECTOR_DELIMITER) + "]" } else { return x !== null ? x.toString() : "" } }).join(process.env.CSV_DELIMITER);//map values of values and separe it with a comma.  removed + process.env.CSV_DELIMITER + delta
                            }
                            ).join(currentRow);
                        }
                        else {
                            currentRow += "[" + value + "]" + process.env.CSV_DELIMITER;
                            return "[" + value + "]";
                        }//for tags
                    }
                    else {
                        currentRow += `${value}` + process.env.CSV_DELIMITER;
                        return `${value}`
                    }
                }).join(process.env.CSV_DELIMITER)}` + "\n";
        currentRow = "\n";
    });//if it is a single string field it only add the string to the row
    str += process.env.CSV_VECTOR_END;
    return str;
}

exports.jsonToCSV = function (jsonData, model) {
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    if (!process.env.CSV_VECTOR_DELIMITER) process.env.CSV_VECTOR_DELIMITER = ';';
    jsonData = JSON.stringify(jsonData.docs);
    jsonData = typeof jsonData !== "object" ? JSON.parse(jsonData) : jsonData;
    if (!jsonData.length) throw new Error('Not found any element')
    let keys = Object.keys(jsonData[0]);
    if (model && model.modelName == "Timesample") { keys = keys.filter(function (key) { return key !== "_id"; }); }
    let csv = keys.join(process.env.CSV_DELIMITER) + "\n";//header
    jsonData.forEach(doc => {
        let arr = [];
        keys.forEach(key =>
            arr.push(key == "samples" ?
                (!doc[key].length ? "[]" : sampleValues(doc[key][0]))
                : (isArray(doc[key])
                    && !doc[key].length || key == "location" ? "[]" : JSON.stringify(doc[key]).replace(/,/g, process.env.CSV_VECTOR_DELIMITER))));
        csv += arr.join(process.env.CSV_DELIMITER) + "\n";
    })
    return csv;
}

const sampleValues = function (sample) {
    let sampleText = "[";
    sampleText += sample.values !== null ? sample.values.toString() : "";
    sampleText += "]";
    return sampleText;
}

exports.json2CSVHistory = function (jsonHistory, protocol) {
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    if (!process.env.CSV_VECTOR_DELIMITER) process.env.CSV_VECTOR_DELIMITER = ';';
    let header = ["step"];
    jsonHistory = JSON.stringify(jsonHistory);
    jsonHistory = typeof jsonHistory !== "object" ? JSON.parse(jsonHistory) : jsonHistory;
    protocol = JSON.stringify(protocol.topics);
    protocol = typeof protocol !== "object" ? JSON.parse(protocol) : protocol;
    let topics = {}
    for (value of protocol) { for (el of value.fields) { header.push(el.name); topics[el.name] = el.type } };
    let csv = header.join(process.env.CSV_DELIMITER) + "\n";
    for (value2 of jsonHistory) {
        let line = [value2.step];
        for (el2 of header) {
            if (el2 != "step") {
                let topic = value2.fields.find(element => element.name == el2);
                if (!topic) { line.push(null); }
                else { if (topics[topic.name] == "vector") line.push("[" + topic.value.toString().replace(/,/g, process.env.CSV_VECTOR_DELIMITER) + "]"); else line.push(topic.value); }
            }
        }
        csv += line.join(process.env.CSV_DELIMITER) + "\n";
    }
    csv = extractData.transposeCsv(csv);
    csv = csv.replace(/\r|\"/g, "");
    return csv;
}

exports.getInPdDataframe = async function (filter, sort, select, page, limit, model, restrictions) {
    if (!page) page = '1';
    if (!limit) limit = '10';
    if (!filter) filter = '{}';
    if (!sort) sort = '{ "timestamp": "desc" }';
    if (!select) select = {};
    filter = prepareFilter(filter, restrictions);
    const options = {
        select: select,
        sort: JSON.parse(sort),
        page: parseInt(page),
        limit: parseInt(limit)
    }
    const list = await model.aggregate(
        [
            { $match: filter },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
            { $unwind: "$samples" },
            {
                $group: {
                    _id: "$feature", "visibility": { $push: "$visibility" }, "tags": { $push: "$tags" }, "id": { $push: "$_id" }, "startDate": { $push: "$startDate" },
                    "endDate": { $push: "$endDate" }, "thing": { $push: "$thing" }, "device": { $push: "$device" }, "samples": { $push: "$samples.values" }
                }
            }
        ]
    ).option(options);
    //list.push({"page":page,"limit":limit}); //for the pagination    
    return list;
}

exports.getTimeseriesDataframe = async function (query, sort, select, page, limit, model, restrictions) {
    if (!query.sort) query.sort = sort;
    if (query.select) select = prepareSelect(select, query.select);
    if (!page) page = '1';
    if (!limit) limit = '10';
    let filter = '{}';
    if (!sort) sort = '{ "timestamp": "desc" }';
    if (!select) select = {};
    filter = prepareFilter(filter, restrictions);
    const options = {
        select: select,
        sort: JSON.parse(sort),
        page: parseInt(page),
        limit: parseInt(limit)
    }
    let list = await model.aggregate(
        [
            //{ $match: filter },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
            {
                $group: {
                    _id: null, "values": { $push: "$values" }, "timestamp": { $push: "$timestamp" }
                }
            }
        ]
    ).option(options);
    //list.push({"page":page,"limit":limit}); //for the pagination  
    list = list[0];
    delete list._id;
    return list;
}

const prepareFilter = function (filter, restriction) {
    if (restriction) {
        if (filter.$and) filter.$and.push(restriction);
        else filter = { $and: [filter, restriction] };
    }
    return filter;
}

exports.replaceSeparatorsGet = function (data, query, res) {
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    if (!process.env.CSV_VECTOR_DELIMITER) process.env.CSV_VECTOR_DELIMITER = ';';
    if (query.sep == ".") return [null, errors.manage(res, errors.get_request_error, "Separator can't be a dot")];
    let sep = !query.sep ? process.env.CSV_DELIMITER : query.sep;
    let sepArray = !query.sepArray ? process.env.CSV_VECTOR_DELIMITER : query.sepArray;
    let sepFloat = !query.sepFloat ? "." : query.sepFloat;
    if (!query || (!query.sep && !query.sepArray && !query.sepFloat)) return [data, null];
    if (sep === sepArray) return [null, errors.manage(res, errors.get_request_error, "Separator and Separator Array can't be the same " + sep)];
    if (sep === sepFloat) return [null, errors.manage(res, errors.get_request_error, "Separator and Separator Float can't be the same " + sep)];
    if (sepArray === sepFloat) return [null, errors.manage(res, errors.get_request_error, "Separator Array and Separator Float can't be the same " + sepArray)];
    if (sep != process.env.CSV_DELIMITER) {
        let regex = new RegExp("\\" + process.env.CSV_DELIMITER, "g");
        data = data.replace(regex, "¤");
    }
    if (sepArray != process.env.CSV_VECTOR_DELIMITER) {
        regex = new RegExp("\\" + process.env.CSV_VECTOR_DELIMITER, "g");
        data = data.replace(regex, "¬");
    }
    if (sepFloat != ".") {
        regex = new RegExp("\\.", "g");
        data = data.replace(regex, "§");
    }
    data = data.replace(/¤/g, sep);
    data = data.replace(/¬/g, sepArray);
    data = data.replace(/§/g, sepFloat);
    return [data, null];
}

//Get groups of topics (all or selected by query) and also the description, unit and values for each step 
exports.getGroups = function (experiment, protocol, query) {
    let groupFilter = undefined;
    if (query.groups !== undefined && query.groups.length !== 0) {// ?groups=["topic1","topic2"]
        groupFilter = JSON.parse(query.groups);//filter
    }
    const body = {
        "_id": experiment._id,
        "history": experiment.history.map(step => ({
            "step": step.step,//for each step
            "groups": {//groupName from protocol:{ field1:value, field2:value...}
                ...protocol.topics.reduce((acc, topic) => {
                    if (groupFilter === undefined || groupFilter.includes(topic.name)) {
                        acc[topic.name] = { unit: topic.unit, description: topic.description };
                        acc[topic.name].values = topic.fields.reduce((fieldsAcc, field) => {
                            let fieldValue = undefined;
                            try { fieldValue = step.fields.find(stepField => stepField.name === field.name).value } catch (error) { };
                            fieldsAcc[field.name] = fieldValue;
                            return fieldsAcc;
                        }, {})
                    }
                    return acc;
                }, {})
            }
        }))
    };

    return [body, null];
}

exports.convertMeasurements = async function (req, res, list, query, model, select, restriction) {
    if (req.headers.accept === 'text/csv+' || req.headers.accept === 'text/dataframe') {
        if (query.filter) query.filter = JSON.parse(query.filter);
        if (!query.filter || !query.filter.feature) return errors.manage(res, errors.get_request_error, "csv+ and dataframe formats need the feature declared, ex. url?filter={\"feature\":\"name\"}");
        else featureId = query.filter.feature;
    };
    try {
        switch (req.headers.accept) {
            case 'text/csv+'://only with feature specified
                list = JSON.stringify(list);
                list = typeof list !== "object" ? JSON.parse(list) : list;
                if (req.query && req.query.select && !req.query.select.includes("_id")) list.docs.forEach(e => delete e._id);
                const Feature = mongoose.dbs[req.tenant.database].model('Feature');
                const item = await Feature.findById(featureId).select("items");
                res.header('Content-Type', 'text/csv+');
                let columnsName = [];
                item.items.forEach(elem => columnsName.push(elem.name));
                let tocsvresult = '';
                tocsvresult = this.jsonToCSVPlus(list, columnsName, req.query);
                [tocsvresult, result] = this.replaceSeparatorsGet(tocsvresult, query); if (result != null) return result;
                return res.status(200).send(tocsvresult);

            case 'text/csv':
                res.header('Content-Type', 'text/csv');
                let csvresultlibrary = '';
                csvresultlibrary = this.jsonToCSV(list);
                [csvresultlibrary, result] = this.replaceSeparatorsGet(csvresultlibrary, query); if (result != null) return result;
                return res.status(200).send(csvresultlibrary);

            case 'text/dataframe':
                let datalist = await this.getInPdDataframe(query.filter, query.sort, select, query.page, query.limit, model, restriction);
                return res.status(200).json(datalist);

            case 'application/json':
                return res.status(200).json(list);

            default:
                return res.status(200).json(list);
        }
    }
    catch (err) {
        if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.get_request_error, err);
    }
}

exports.aggregateHistories = async function (jsonData) {
    let data = JSON.parse(jsonData);
    data = data["docs"]
    const ids = data.map(entry => entry._id);
    const aggregatedHistories = {};

    data.forEach(entry => {
        entry.history.forEach(hist => {
            if (hist.fields && hist.fields.length > 0) {
                hist.fields.forEach(field => {
                    if (!aggregatedHistories[field.name]) {
                        aggregatedHistories[field.name] = field.value;
                    } else {
                        if (typeof field.value === 'number') {
                            aggregatedHistories[field.name] += field.value;
                        } else if (typeof field.value === 'string') {
                            if (!Array.isArray(aggregatedHistories[field.name])) {
                                aggregatedHistories[field.name] = [aggregatedHistories[field.name]];
                            }
                            aggregatedHistories[field.name].push(field.value);
                        } else if (Array.isArray(field.value)) {
                            if (!Array.isArray(aggregatedHistories[field.name])) {
                                aggregatedHistories[field.name] = Array(field.value.length).fill(0);
                            }
                            // Adjust the lengths of arrays before addition
                            const maxLength = Math.max(aggregatedHistories[field.name].length, field.value.length);
                            const aggregatedArr = aggregatedHistories[field.name].concat(Array(maxLength - aggregatedHistories[field.name].length).fill(0));
                            const fieldValueArr = field.value.concat(Array(maxLength - field.value.length).fill(0));

                            aggregatedHistories[field.name] = aggregatedArr.map((val, idx) => val + fieldValueArr[idx]);
                        }
                    }
                });
            }
        });
    });
    return { _ids: ids, aggregated_histories: aggregatedHistories };
}


exports.toGroups = async function (req, result, protocolName) {
    const Protocol = mongoose.dbs[req.tenant.database].model('Protocol');
    let ids=result._ids;
    let aggregatedHistories=result.aggregated_histories;
    let protocol = await Protocol.findById(protocolName).select("topics").lean();
    let topics = protocol.topics;
    let extractedData = topics.reduce((acc, topic) => {
        acc[topic.name] = topic.fields.reduce((fieldAcc, field) => {
            fieldAcc[field.name] = aggregatedHistories[field.name];
            return fieldAcc;
        }, {});
        return acc;
    }, {});   
    return { _ids: ids, aggregated_histories: extractedData };
}
