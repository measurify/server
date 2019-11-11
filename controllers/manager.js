
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

exports.getResourceList = async function(req, res, sort, select, model, restriction) {
    try {
        const query = req.query;
        if (!query.page) query.page = '1';
        if (!query.limit) query.limit = '10';
        if (!query.filter) query.filter = '{}';
        if (!query.sort) query.sort = sort;
        if (!query.select) query.select = select;
        if (query.filter.startsWith("[")) { query.filter = "{ \"$or\": " + query.filter + " }" };
        const filter = JSON.parse(query.filter);
        if(restriction) {
            if(!filter["$or"]) filter["$or"]=restriction["$or"];
            else filter["$or"].concat(restriction["$or"]);
        } 
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

exports.modifyResourceList = async function(list, list_model, resource, field) {
    if(list.remove) {
        for (let value of list.remove) { if (!await list_model.findById(value)) return 'Resource to be removed from list not found: ' + value; };
        resource[field] = resource[field].filter(value => !list.remove.includes(value));
    }
    if(list.add) {
        for (let value of list.add) { if (!await list_model.findById(value))  return 'Resource to be added to the list not found: ' + value; };
        resource[field].push(...list.add);
    }
    resource[field] = [...new Set(resource[field])];
    return true;
}

exports.modifyCategoricalValueList = async function(list, list_type, resource, field) {
    if(list.remove) {
        for (let value of list.remove) { if (!Object.values(list_type).includes(value)) return 'Type to be removed from list not found: ' + value; };
        resource[field] = resource[field].filter(value => !list.remove.includes(value));
    }
    if(list.add) {
        for (let value of list.add) { if (!Object.values(list_type).includes(value))  return 'Type to be added to the list not found: ' + value; };
        resource[field].push(...list.add);
    }
    resource[field] = [...new Set(resource[field])];
    return true;
}

exports.updateResource = async function(req, res, fields, model) {
    try {

        for (let field in req.body) if(!fields.includes(field)) return errors.manage(res, errors.put_request_error, "Request field cannot be updated (" + field + ')');

        for (let field of fields) {

            if (typeof req.body[field] != 'object') { req.resource[field] = req.body[field]; continue; }

            if (typeof req.body[field] == 'object') {
                do {
                    let result = null;

                    // List of resources
                    let field_model = null;
                    const field_model_name = field[0].toUpperCase() + field.slice(1, -1);
                    try { field_model = await mongoose.model(field_model_name) } catch(err) {};
                    if (field_model) result = await this.modifyResourceList(req.body[field], field_model, req.resource, field);
                    if (result == true) break;
                    else if (result) return errors.manage(res, errors.put_request_error, result);
                
                    // List of categorical data
                    let field_type = null;
                    const field_type_name = field[0].toUpperCase() + field.slice(1) + "Types";
                    try { field_type = require('../types/' + field_type_name + '.js'); } catch(err) {};
                    if (field_type) result = await this.modifyCategoricalValueList(req.body[field], field_type, req.resource, field);
                    if (result == true) break;
                    else if (result) return errors.manage(res, errors.put_request_error, result);

                    // Other lists? TBD
                    return errors.manage(res, errors.put_request_error, 'Cannot manage the field (' + field + ')');
                    break;
                } while(true);
                continue;
            }

        } 
    }
    catch (err) { return errors.manage(res, errors.put_request_error, err); }

    req.resource.lastmod = Date.now();
    const modified_resource = await model.findOneAndUpdate({_id: req.resource._id}, req.resource, { new: true });
    return res.status(200).json(modified_resource);
}
