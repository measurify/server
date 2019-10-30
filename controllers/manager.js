
const mongoose = require('mongoose');
const Tag = mongoose.model('Tag');
const errors = require('../commons/errors.js');

exports.getResourceList = async function(res, req, sort, select, resource) {
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
        const list = await resource.paginate(filter, options);
        return res.status(200).json(list);
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
}

exports.postResource = async function(req, res, resource) {
    try {
        req.body.owner = req.user._id;
        return res.status(200).json(await (new resource(req.body)).save());
    }
    catch (err) { return errors.manage(res, errors.post_request_error, err); }
}

exports.postResourceList = async function(req, res, resource) { 
    if(!req.query.verbose) req.query.verbose = 'true';
    const items = resource.modelName.toLowerCase() + 's';
    const results = { [items]: [], errors: [] };
    for (let [i, element] of req.body.entries()) {
        try {
            element.owner = req.user._id;
            results[items].push(await (new resource(element)).save());
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