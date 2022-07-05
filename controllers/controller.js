
const mongoose = require('mongoose');
const persistence = require('../commons/persistence.js');
const errors = require('../commons/errors.js');
const { isArray, forEach, isObject } = require('underscore');
const bodyParser = require('body-parser');
const express = require('express');

exports.getResource = async function (req, res, field, model, select) {
    try {
        const item = await persistence.get(req.params.id, field, model, select);
        if (!item) return errors.manage(res, errors.resource_not_found, req.params.id);
        return res.status(200).json(item);
    }
    catch (err) {
        if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.get_request_error, err);
    }
};

exports.getResourceDataset = async function (req, res, sort, select, model) {
    try {
        const query = req.query;
        if (!query.sort) query.sort = sort;
        if (!query.filter) query.filter = '{}';//Create here filter + id
        let idFile = null;
        if (req.params.id !== undefined) {
            idFile = req.params.id;
        }

        filterDataset = prepareFilterDataset(idFile, query.filter);

        if (query.page == undefined & query.limit == undefined) {
            query.page = 1;
            query.limit = await model.countDocuments(filterDataset);
        }
        if (req.headers.accept == 'text/csv+') {//only with feature specified
            fil = JSON.stringify(filterDataset);//need to be a string not an object            
            if (fil.includes('{"feature":')) {
                restriction = {};
                let featureId = null;
                if (filterDataset.hasOwnProperty('feature')) {
                    featureId = filterDataset.feature;
                }
                else if (filterDataset.hasOwnProperty('$and')) {
                    featureId = filterDataset.$and[0].feature;
                }
                if (featureId != null) {
                    filterDataset = JSON.stringify(filterDataset);//need to be a string not an object
                    const Feature = mongoose.dbs[req.tenant.database].model('Feature');

                    const item = await persistence.get(featureId, null, Feature, select);
                    let list = await persistence.getList(filterDataset, query.sort, select, query.page, query.limit, restriction, model);

                    res.header('Content-Type', 'text/csv');

                    let columnsName = [];
                    item.items.forEach(elem => columnsName.push(elem.name));
                    let tocsvresult = '';
                    tocsvresult = jsonToCSVPlus(list, columnsName);
                    return res.status(200).send(tocsvresult);
                }
                else { req.headers.accept = 'text/csv' }
            }
            else { req.headers.accept = 'text/csv' }
        }
        if (req.headers.accept == 'text/csv') {
            restriction = {};
            filterDataset = JSON.stringify(filterDataset);//need to be a string not an object
            let list = await persistence.getList(filterDataset, query.sort, select, query.page, query.limit, restriction, model);

            res.header('Content-Type', 'text/csv');
            let csvresultlibrary = '';
            csvresultlibrary = jsonToCSV(list);
            return res.status(200).send(csvresultlibrary);
        }
        //else no accept headers parameters or else
        let list = await persistence.getDataset(filterDataset, query.sort, select, query.page, query.limit, model);
        return res.status(200).json(list);
    }
    catch (err) {
        if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.get_request_error, err);
    }
};


exports.getResourcePipe = function (req, res, sort, select, model, restriction) {
    try {
        const query = req.query;
        if (!query.sort) query.sort = sort;
        persistence.getPipe(req, res, query.filter, query.sort, select, restriction, model)
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
}

exports.getResourceList = async function (req, res, sort, select, model, restriction) {
    try {
        const query = req.query;
        if (!query.sort) query.sort = sort;
        let list = await persistence.getList(query.filter, query.sort, select, query.page, query.limit, restriction, model);
        if (req.headers.accept == 'text/csv') {
            res.header('Content-Type', 'text/csv');
            csvresultlibrary = jsonToCSV(list);

            return res.status(200).json(csvresultlibrary);
        }
        else return res.status(200).json(list);
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
}

const jsonToCSVPlus = function (jsonData, columnsname) {
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    if (!process.env.CSV_VECTOR_START) process.env.CSV_VECTOR_START = '';
    if (!process.env.CSV_VECTOR_END) process.env.CSV_VECTOR_END = '';
    if (!process.env.CSV_VECTOR_DELIMITER) process.env.CSV_VECTOR_DELIMITER = ';'
    jsonData = JSON.stringify(jsonData);
    //console.log(jsonData);
    const json =
        typeof jsonData !== "object" ? JSON.parse(jsonData) : jsonData;
    columnsname = columnsname.map(x => `"${x}"`).join(",");

    let str = process.env.CSV_VECTOR_START +
        `${Object.keys(json.docs[0])//parte per mettere l'intestazione del csv con i nomi delle colonne
            .map((value) => {
                if (value == "samples") {
                    return columnsname;
                }
                else return `"${value}"`
            })
            .join(process.env.CSV_DELIMITER)}` + process.env.CSV_DELIMITER + "\"deltatime\"" + "\n";
    currentRow = "\n";//stringa virtuale usata per i samples con piu value.
    json.docs.forEach(doc => {//compilazione campi riga per riga
        str +=//entriamo per un doc ossia un singolo samples del json
            `${Object.values(doc)//questo divide ogni singolo campo del samples, cicla per visility,tags ecc
                .map((value) => {
                    if (isArray(value))//nel caso in cui sia tags o samples entra qui
                    {
                        if (value.length == 0) {//se il tags o samples non contiene valori metto un array vuoto
                            currentRow += `"[]"` + process.env.CSV_DELIMITER;
                            return `"[]"`;
                        }
                        if (isObject(value[0])) {
                            return value.map((x) => {
                                delta = 0;//inizializzazione e nel caso nullo
                                if (x.delta != null) delta = x.delta;  //lo aggiungo come colonna                            
                                // se nei samples è un insieme di oggetti contenenti values entra qui dentro
                                return x.values.map(x => `"${x}"`).join(process.env.CSV_DELIMITER) + process.env.CSV_DELIMITER + "\"" + delta + "\"";//mappa i valori di values separandoli con una virgola. 
                            }
                            ).join(currentRow);
                        }
                        else {
                            currentRow += "[" + value + "]" + process.env.CSV_DELIMITER;
                            return "[" + value + "]";
                        }//se è il tags ritorna il valore e basta
                    }
                    else {
                        currentRow += `"${value}"` + process.env.CSV_DELIMITER;
                        return `"${value}"`
                    }
                }).join(process.env.CSV_DELIMITER)}` + "\n";
        currentRow = "\n";
    });//se non è un array aggiunge semplicemente il valore alla stringa
    str += process.env.CSV_VECTOR_END;
    return str;
}

const jsonToCSV = function (jsonData) {
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    jsonData = JSON.stringify(jsonData);
    const json =
        typeof jsonData !== "object" ? JSON.parse(jsonData) : jsonData;
    const { Parser, transforms: { unwind } } = require('json2csv');

    const fields = ["visibility", "tags", "_id", "startDate", "endDate", "thing", "feature", "device", { label: 'values', value: 'samples.values' }, { label: 'deltatime', value: 'samples.delta', default: 0 }];

    const transforms = [unwind({ paths: ['samples'] })];

    const json2csvParser = new Parser({ fields, transforms, delimiter: process.env.CSV_DELIMITER });
    const csv = json2csvParser.parse(json.docs);
    return csv;
}

exports.getResourceListSize = async function (req, res, model, restriction) {
    try {
        const query = req.query;
        const size = await persistence.getSize(query.filter, restriction, model);
        return res.status(200).json({ size: size });
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
}

exports.streamResource = async function (req, data, model) {
    try {
        data = JSON.parse(data);
        if (req.user._id) data.owner = req.user._id;
        return await persistence.post(data, model, req.tenant);
    }
    catch (err) { return err; }
}

exports.postResource = async function (req, res, model) {
    try {
        if (req.user._id) req.body.owner = req.user._id;
        if (!req.query.verbose) req.query.verbose = 'true';
        const results = await persistence.post(req.body, model, req.tenant);
        req.result = results;
        if (req.body.constructor != Array) return res.status(200).json(results);
        else {
            if (req.query.verbose == 'true') {
                if (results.errors.length === 0) { return res.status(200).json(results); }
                else { return res.status(202).json(results); }
            }
            else {
                const items = model.modelName.toLowerCase() + 's';
                if (results.errors.length === 0) { return res.status(200).json({ saved: results[items].length, errors: results.errors.length }); }
                else { return res.status(202).json({ saved: results[items].length, errors: results.errors.length, Indexes: results.errors }); }
            }
        }
    }
    catch (err) { return errors.manage(res, errors.post_request_error, err); }
}

exports.deleteResource = async function (req, res, model) {
    try {
        const result = await persistence.delete(req.params.id, model);
        if (!result) return errors.manage(res, errors.resource_not_found, req.params.id);
        else return res.status(200).json(result);
    }
    catch (err) {
        if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.delete_request_error, err);
    }
}

exports.deleteResourceList = async function (req, res, model, restriction) {
    try {
        const result = await persistence.deletemore(req.query.filter, restriction, model);
        if (result == 0) return errors.manage(res, errors.resource_not_found);
        else return res.status(200).json({ deleted: result });
    }
    catch (err) { return errors.manage(res, errors.delete_request_error, err); }
}

exports.updateResource = async function (req, res, fields, model) {
    try {
        const modified_resource = await persistence.update(req.body, fields, req.resource, model, req.tenant);        
        return res.status(200).json(modified_resource);
    }
    catch (err) { return errors.manage(res, errors.put_request_error, err); }
};

const prepareFilterDataset = function (idFile, filter) {
    if (filter.charAt(0) == '[') filter = '{ "$or":' + filter + '}'; //for or request 
    let object = JSON.parse(filter);
    if (idFile) {//not null
        if (object.$and) object.$and.push({ "tags": idFile });
        else object = { $and: [object, { "tags": idFile }] };
    }
    return object;
}