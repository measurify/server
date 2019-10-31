
const mongoose = require('mongoose');
const Tag = mongoose.model('Tag');
const errors = require('../commons/errors.js');

exports.getResource = async function(req, res, field, model) {
    try {
        let item = null;
        if(field) item = await model.findOne({ [field]: req.params.id });
        if(!item) item = await model.findById(req.params.id);
        if(!item) return errors.manage(res, errors.resource_not_found, req.params.id);
        return res.status(200).json(item);
    } 
    catch (err) { 
        if(err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.get_request_error, err); 
    }
};

exports.getResourceList = async function(req, res, sort, select, model) {
    try {
        const query = req.query;
        if (!query.page) query.page = '1';
        if (!query.limit) query.limit = '10';
        if (!query.filter) query.filter = '{}';
        if (!query.sort) query.sort = sort;
        if (!query.select) query.select = select;
        if (query.filter.startsWith("[")) { query.filter = "{ \"$or\": " + query.filter + " }" };
        const filter = JSON.parse(query.filter);
        const options = {
            select: JSON.parse(query.select),
            sort: JSON.parse(query.sort),
            page: parseInt(query.page),
            limit: parseInt(query.limit)
        }
        const list = await model.paginate(filter, options);
        return res.status(200).json(list);
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
}

exports.postResource = async function(req, res, model) {
    if (req.body.constructor == Array) return await this.postResourceList(req, res, model);
    try {
        req.body.owner = req.user._id;
        return res.status(200).json(await (new model(req.body)).save());
    }
    catch (err) { return errors.manage(res, errors.post_request_error, err); }
}

exports.postResourceList = async function(req, res, model) { 
    if(!req.query.verbose) req.query.verbose = 'true';
    const items = model.modelName.toLowerCase() + 's';
    const results = { [items]: [], errors: [] };
    for (let [i, element] of req.body.entries()) {
        try {
            element.owner = req.user._id;
            results[items].push(await (new model(element)).save());
        }
        catch (err) { results.errors.push('Index: ' + i +  ' (' + err.message + ')'); }
    }
    if (req.query.verbose == 'true') {
        if (results.errors.length === 0) { return res.status(200).json(results); }
        else { return res.status(202).json(results); }
    }
    else {
        if (results.errors.length === 0) { return res.status(200).json({ saved: results[items].length, errors: results.errors.length }); }
        else { return res.status(202).json({ saved: results[items].length, errors: results.errors.length, Indexes: results.errors }); }
    }
};

exports.deleteResource = async function(req, res, model) {
    try {
        const result = await model.findOneAndDelete({ _id: req.params.id });
        if (!result) return errors.manage(res, errors.resource_not_found, req.params.id);
        else return res.status(200).json(result);
    }
    catch (err) { 
        if(err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.delete_request_error, err); 
    }
}

exports.modifyTagList = async function(resource, tags) {
    if(tags.remove) {
        for (let value of tags.remove) { if (!await Tag.findById(value)) throw new Error('Tag to be removed not found: ' + value); };
        resource.tags = resource.tags.filter(value => !tags.remove.includes(value));
    }
    if(tags.add) {
        for (let value of tags.add) { if (!await Tag.findById(value))  throw new Error('Tag to be added not found: ' + value); };
        resource.tags.push(...tags.add);
    }
    resource.tags = [...new Set(resource.tags)];
    return true;
}