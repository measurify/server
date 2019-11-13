
const mongoose = require('mongoose');
const persistence = require('../commons/persistence.js');
const errors = require('../commons/errors.js');

exports.getResource = async function(req, res, field, model) {
    try {
        const item = await persistence.get(req.params.id, field, model);
        if(!item) return errors.manage(res, errors.resource_not_found, req.params.id);
        return res.status(200).json(item);
    } 
    catch (err) { 
        if(err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.get_request_error, err); 
    }
};

exports.getResourceList = async function(req, res, sort, select, model, restriction) {
    try {
        const query = req.query;
        if (!query.sort) query.sort = sort;
        if (!query.select) query.select = select;
        const list = await persistence.getList(query.filter, query.sort, query.select, query.page, query.limit, restriction, model);
        return res.status(200).json(list);
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
}

exports.postResource = async function(req, res, model) {
    try { 
        req.body.owner = req.user._id;
        if(!req.query.verbose) req.query.verbose = 'true';
        if (req.body.constructor != Array) return res.status(200).json(await persistence.post(req.body, model));
        else {
            const results = await persistence.post(req.body, model);
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

exports.deleteResource = async function(req, res, model) {  
    try {
        const result = await persistence.delete(req.params.id, model);
        if (!result) return errors.manage(res, errors.resource_not_found, req.params.id);
        else return res.status(200).json(result);
    }
    catch (err) { 
        if(err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.delete_request_error, err); 
    }
}

exports.updateResource = async function(req, res, fields, model) {
    try {
        const modified_resource = await persistence.update(req.body, fields, req.resource, model);
        return res.status(200).json(modified_resource);
    }
    catch (err) { return errors.manage(res, errors.put_request_error, err); }
};
