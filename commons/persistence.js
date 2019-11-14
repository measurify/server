const mongoose = require('mongoose');

exports.get = async function(id, field, model) {
    let item = null;
    if(field) item = await model.findOne({ [field]: id });
    if(!item) item = await model.findById(id);
    if(!item) return null;
    return item;
};

exports.getSize = async function(filter, restriction, model) {
    if (!filter) filter = '{}';
    filter = prepareFilter(filter, restriction);
    const size = await model.countDocuments(filter);
    return size;
}

exports.getList = async function(filter, sort, select, page, limit, restriction, model) {
    if (!page) page = '1';
    if (!limit) limit = '10';
    if (!filter) filter = '{}';
    if (!sort) sort = '{ "timestamp": "desc" }';
    if (!select) select = '{}';
    filter = prepareFilter(filter, restriction);
    const options = {
        select: JSON.parse(select),
        sort: JSON.parse(sort),
        page: parseInt(page),
        limit: parseInt(limit)
    }
    const list = await model.paginate(filter, options);
    return list;
}

exports.post = async function(body, model) {
    if (body.constructor == Array) return await postList(body, model);
    return await postOne(body, model);
}

exports.delete = async function(id, model) {  
    const result = await model.findOneAndDelete({ _id: id });
    if (!result) return null;
    return result;
}

exports.update = async function(body, fields, resource, model) {
    for (let field in body) if(!fields.includes(field)) throw 'Request field cannot be updated (' + field + ')';
    for (let field of fields) {
        if (typeof body[field] != 'object') { resource[field] = body[field]; continue; }
        if (typeof body[field] == 'object') {
            do {
                let result = null;

                // List of resources
                let field_model = null;
                const field_model_name = field[0].toUpperCase() + field.slice(1, -1);
                try { field_model = await mongoose.model(field_model_name) } catch(err) {};
                if (field_model) result = await modifyList(body[field], field_model, resource, field);
                if (result == true) break;
                else if (result) throw result;
            
                // List of categorical data
                let field_type = null;
                const field_type_name = field[0].toUpperCase() + field.slice(1) + "Types";
                try { field_type = require('../types/' + field_type_name + '.js'); } catch(err) {};
                if (field_type) result = await modifyCategoricalValueList(body[field], field_type, resource, field);
                if (result == true) break;
                else if (result) throw result;

                // Other lists? TBD
                throw 'Cannot manage the field (' + field + ')';
                break;
            } while(true);
            continue;
        }
    } 
    resource.lastmod = Date.now();
    const modified_resource = await model.findOneAndUpdate({_id: resource._id}, resource, { new: true });
    return modified_resource;
}

exports.deletemore = async function(filter, restriction, model) {  
    if (!filter) filter = '{}'; 
    filter = prepareFilter(filter, restriction);
    const result = await model.deleteMany(filter);
    return result.n;
}


// local functions 

const prepareFilter = function(filter, restriction) {
    if(filter.charAt( 0 ) == '[') filter = '{ "$or":' + filter + '}'; 
    let object = JSON.parse(filter);
    if(restriction) { 
        if(object.$and) object.$and.push(restriction);
        else object = { $and: [ object, restriction ] };
    }
    return object;
}

const postOne = async function(body, model) {
    return await (new model(body)).save();
}

const postList = async function(body, model) { 
    const items = model.modelName.toLowerCase() + 's';
    const results = { [items]: [], errors: [] };
    for (let [i, element] of body.entries()) {
        try {
            element.owner = body.owner;
            results[items].push(await (new model(element)).save());
        }
        catch (err) { results.errors.push('Index: ' + i +  ' (' + err.message + ')'); }
    }
    return results;     
};

const modifyList = async function(list, list_model, resource, field) {
    if(list.remove) {
        for (let value of list.remove) { if (!await list_model.findById(value)) throw 'Resource to be removed from list not found: ' + value; };
        resource[field] = resource[field].filter(value => !list.remove.includes(value));
    }
    if(list.add) {
        for (let value of list.add) { if (!await list_model.findById(value))  throw 'Resource to be added to the list not found: ' + value; };
        resource[field].push(...list.add);
    }
    resource[field] = [...new Set(resource[field])];
    return true;
}

const modifyCategoricalValueList = async function(list, list_type, resource, field) {
    if(list.remove) {
        for (let value of list.remove) { if (!Object.values(list_type).includes(value)) throw 'Type to be removed from list not found: ' + value; };
        resource[field] = resource[field].filter(value => !list.remove.includes(value));
    }
    if(list.add) {
        for (let value of list.add) { if (!Object.values(list_type).includes(value))  throw 'Type to be added to the list not found: ' + value; };
        resource[field].push(...list.add);
    }
    resource[field] = [...new Set(resource[field])];
    return true;
}