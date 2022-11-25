const mongoose = require('mongoose');
const persistence = require('../commons/persistence.js');
const errors = require('../commons/errors.js');
const conversion = require('../commons/conversion.js');
const dataset=require('../commons/dataset.js');

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

exports.getResourceDataset = async function (req, res, sort, select, model,restrictions) {
    try {
        const query = req.query;
        if (!query.sort) query.sort = sort;
        filterDataset = await dataset.prepareFilterDataset(req.params.id, query.filter);
        if (!query.page)query.page = 1;
        if (!query.limit) query.limit = await model.countDocuments(filterDataset);
        let featureId=null;
        if(req.headers.accept==='text/csv+'||req.headers.accept==='text/dataframe'){if(!filterDataset.feature)req.headers.accept = 'text/csv'; else featureId=filterDataset.feature};
        let itemsList = await persistence.getList(JSON.stringify(filterDataset), query.sort, select, query.page, query.limit, restrictions, model);
        switch (req.headers.accept) {
            case 'text/csv+'://only with feature specified
                const Feature = mongoose.dbs[req.tenant.database].model('Feature');
                const item = await persistence.get(featureId, null, Feature, select);                
                res.header('Content-Type', 'text/csv+');
                let columnsName = [];
                    item.items.forEach(elem => columnsName.push(elem.name));
                    let tocsvresult = '';
                    tocsvresult = conversion.jsonToCSVPlus(itemsList, columnsName);
                    return res.status(200).send(tocsvresult);
            
            case 'text/csv':
                res.header('Content-Type', 'text/csv');
                let csvresultlibrary = '';
                csvresultlibrary = conversion.jsonToCSV(itemsList);
                return res.status(200).send(csvresultlibrary);
            
            case 'text/dataframe':
                let list = await conversion.getInPdDataframe(filterDataset, query.sort, select, query.page, query.limit, model,restrictions);
                return res.status(200).json(list);

            case 'application/json':
                return res.status(200).json(itemsList);

            default:
                return res.status(200).json(itemsList);
        }          
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
            csvresultlibrary = conversion.jsonToCSV(list);
            [csvresultlibrary, result] = conversion.replaceSeparatorsGet(csvresultlibrary, req.query); if (result != null) return result;
            return res.status(200).send(csvresultlibrary);
        }
        else return res.status(200).json(list);
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
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
        const modified_resource = await persistence.update(req.body, fields, req.resource, model, req.tenant,req.query,res);        
        return res.status(200).json(modified_resource);
    }
    catch (err) { return errors.manage(res, errors.put_request_error, err); }
};
