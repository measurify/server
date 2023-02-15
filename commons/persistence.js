const mongoose = require('mongoose');
const broker = require('../commons/broker.js');
const tenancy = require('../commons/tenancy.js');
const factory = require('../commons/factory.js');
const bcrypt = require('bcryptjs');
const { passwordStrength } = require('check-password-strength');
const authentication = require('../security/authentication.js');

exports.get = async function (id, field, model, select) {
    try {
        let item = null;
        if (!select) select = {};
        if (field) item = await model.findOne({ [field]: id }).select(select);
        if (!item) item = await model.findById(id).select(select);
        if (!item) return null;
        return item;
    }
    catch (err) { return null; }
};

exports.getPipe = function (req, res, filter, sort, select, restriction, model) {
    if (!filter) filter = '{}';
    if (!sort) sort = '{ "timestamp": "desc" }';
    if (!select) select = {};
    filter = prepareFilter(filter, restriction);
    if (req.headers.accept == 'text/csv') model.find(filter).cursor({ transform: doc => doc.toCSV() }).pipe(res.type('text/csv'));
    else model.find(filter).cursor({ transform: JSON.stringify }).pipe(res.type('json'));
}

exports.getSize = async function (filter, restriction, model) {
    if (!filter) filter = '{}';
    filter = prepareFilter(filter, restriction);
    const size = await model.countDocuments(filter);
    return size;
}

exports.getList = async function (filter, sort, select, page, limit, restriction, model) {
    if (!page) page = '1';
    if (!limit) limit = '10';
    if (!filter) filter = '{}';
    if (!sort) sort = '{ "timestamp": "desc" }';
    if (!select) select = {};
    filter = prepareFilter(filter, restriction);
    const options = {
        select: select,
        sort: JSON.parse(sort),
        page: parseInt(page),
        limit: parseInt(limit)
    }
    const list = await model.paginate(filter, options);
    return list;
}

const postOne = async function (body, model, tenant) {
    if (body.password) body.password = checkPassword(body.password,tenant.passwordhash);
    if(model.modelName == "Device") {token = authentication.encodeDevice(body,tenant); body.token = await factory.HashDeviceToken(tenant, token)}//hash token 
    const resource = await (new model(body)).save();
    if (model.modelName == 'Measurement') {
        broker.publish('device-' + body.device, body.device, body);
        broker.publish('thing-' + body.thing, body.thing, body);
        broker.notify(body, tenant);
    }
    if (model.modelName == 'Tenant') { await tenancy.init(resource, body.admin_username, body.admin_password); }
    if (model.modelName == "Device") resource.token = token;//reveal token one time only
    return resource;
}

const postList = async function (body, model, tenant) {
    const items = model.modelName.toLowerCase() + 's';
    const results = { [items]: [], errors: [] };
    for (let [i, element] of body.entries()) {
        try {
            element.owner = body.owner;
            if (element.password) element.password = checkPassword(element.password,tenant.passwordhash);
            if(model.modelName == "Device") {token = authentication.encodeDevice(element,tenant); element.token =await factory.HashDeviceToken(tenant, token)}//hash token 
            const resource = await (new model(element)).save()
            if (model.modelName == "Measurement") {
                broker.publish('device-' + resource.device, resource);
                broker.publish('thing-' + resource.thing, resource);
                broker.notify(body, tenant);
            }
            if (model.modelName == 'Tenant') await tenancy.init(resource, body.admin_username, body.admin_password);
            if (model.modelName == "Device") resource.token = token;//reveal token one time only
            results[items].push(resource);
        }
        catch (err) { results.errors.push('Index: ' + i + ' (' + err.message + ')'); }
    }
    return results;
};

exports.post = async function (body, model, tenant) {
    if (body.constructor == Array) return await postList(body, model, tenant);
    return await postOne(body, model, tenant);
}

exports.delete = async function (id, model) {
    const result = await model.findOneAndDelete({ _id: id });
    if (!result) return null;
    return result;
}

exports.update = async function (body, fields, resource, model, tenant, query, res) {

    for (let field in body) if (!fields.includes(field)) throw 'Request field cannot be updated (' + field + ')';

    let old_id = null;
    let report = null;
    if (body._id) old_id = resource._id;

    for (let field of fields) {
        if (typeof body[field] != 'object' && body[field]) {
            if (field == 'password') body[field] = checkPassword(body[field],tenant.passwordhash);
            resource[field] = body[field]; continue;
        }
        if (typeof body[field] == 'object' && body[field]) {
            do {
                let result = null;

                // Array of resources
                let field_model = null;
                const field_model_name = field[0].toUpperCase() + field.slice(1, -1);
                try { if (tenant) field_model = await mongoose.dbs[tenant.database].model(field_model_name) } catch (err) { };
                if (field_model) result = await modifyResourceList(body[field], field_model, resource, field);
                if (result == true) break;
                else if (result) throw result;

                // List of fields of a resource
                let fieldlist_model = null;
                const fieldlist_model_name = (field.charAt(0).toUpperCase() + field.slice(1)).replace('_fields', '');
                try { if (tenant) fieldlist_model = await mongoose.dbs[tenant.database].model(fieldlist_model_name) } catch (err) { };
                if (fieldlist_model) result = await modifyFieldResourceList(body[field], fieldlist_model, resource, field);
                if (result == true) break;
                else if (result) throw result;

                // Array of embedded resources
                identifier = 'name';
                if (model.modelName == 'Experiment' && field == 'history') identifier = 'step'
                if (model.modelName == 'Role' && field == 'actions') identifier = 'entity'
                if ((body[field].add && body[field].add.length > 0 && typeof body[field].add[0] == 'object') ||
                    (body[field].remove && body[field].remove.length > 0) ||
                    (body[field].update && body[field].update.length > 0 && typeof body[field].update[0] == 'object')) {
                    [result, report] = await modifyEmbeddedResourceList(body[field], resource, field, identifier, model, query);

                }
                if (result == true) break;
                else if (result) throw result;

                // Array of categorical data
                let field_type = null;
                const field_type_name = field[0].toUpperCase() + field.slice(1) + "Types";
                try { field_type = require('../types/' + field_type_name + '.js'); } catch (err) { };
                if (field_type) result = await modifyCategoricalValueList(body[field], field_type, resource, field);
                if (result == true) break;
                else if (result) throw result;

                // Object passed directly
                if (field == "default" && typeof resource[field] == 'object') {                    
                    if (factory.areEqual(resource[field]._doc, body[field])) {
                        throw 'Same default field'
                    }
                    else { resource[field] = body[field]; break; }
                }

                // Other lists? TBD
                throw 'Cannot manage the field (' + field + ')';
                break;
            } while (true);
            continue;
        }
    }
    resource.lastmod = Date.now();

    if (old_id) resource.isNew = true;
    resource = await resource.save({ update: true });
    if (old_id) await model.findOneAndDelete({ _id: old_id });
    if (report) resource._doc.report = report;
    return resource;
}

exports.deletemore = async function (filter, restriction, model) {
    if (!filter) filter = '{}';
    filter = prepareFilter(filter, restriction);
    const result = await model.deleteMany(filter);
    return result.deletedCount;
}

// local functions 

const prepareFilter = function (filter, restriction) {
    if (filter.charAt(0) == '[') filter = '{ "$or":' + filter + '}';
    let object = JSON.parse(filter);
    if (restriction) {
        if (object.$and) object.$and.push(restriction);
        else object = { $and: [object, restriction] };
    }
    return object;
}

const modifyFieldResourceList = async function (list, model, resource, field) {
    if (list.remove) {
        for (let value of list.remove) { if (Object.keys(model.schema.paths).indexOf(value) == -1) throw 'Field to be removed from list not found: ' + value; };
        resource[field] = resource[field].filter(value => !list.remove.includes(value));
    }
    if (list.add) {
        for (let value of list.add) { if (Object.keys(model.schema.paths).indexOf(value) == -1) throw 'Field to be added to the list not found: ' + value; };
        resource[field].push(...list.add);
    }
    resource[field] = [...new Set(resource[field])];
    return true;
}

const modifyResourceList = async function (list, model, resource, field) {
    if (list.remove) {
        for (let value of list.remove) { if (!await model.findById(value)) throw 'Resource to be removed from list not found: ' + value; };
        resource[field] = resource[field].filter(value => !list.remove.includes(value));
    }
    if (list.add) {
        for (let value of list.add) { if (!await model.findById(value)) throw 'Resource to be added to the list not found: ' + value; };
        resource[field].push(...list.add);
    }
    resource[field] = [...new Set(resource[field])];
    return true;
}

const modifyCategoricalValueList = async function (list, type, resource, field) {
    if (list.remove) {
        for (let value of list.remove) { if (!Object.values(type).includes(value)) throw 'Type to be removed from list not found: ' + value; };
        resource[field] = resource[field].filter(value => !list.remove.includes(value));
    }
    if (list.add) {
        for (let value of list.add) { if (!Object.values(type).includes(value)) throw 'Type to be added to the list not found: ' + value; };
        resource[field].push(...list.add);
    }
    resource[field] = [...new Set(resource[field])];
    return true;
}

const modifyEmbeddedResourceList = async function (list, resource, field, identifier, model, query) {
    if (!identifier) identifier = 'name'
    let report = null;
    if (model.modelName == 'Experiment') { report = { success: [], ignored: [], overridden: [] } }
    if (list.remove) {
        for (let value of list.remove) { if (!resource[field].some(element => element[identifier] === value)) throw 'Embedded resource to be removed from list not found: ' + value; };
        resource[field] = resource[field].filter(value => !list.remove.includes(value[identifier]));
    }
    if (list.add) {
        for (let value of list.add) {
            if (!resource[field].some(element => element[identifier] == value[identifier])) { resource[field].push(value); if (report && field == 'history') report.success.push(value[identifier]); }
            else {
                if (model.modelName == 'Experiment' && field == 'history') {
                    if (query.override === "true") {
                        resource[field] = resource[field].filter(el => el[identifier] != value[identifier]);
                        resource[field].push(value);
                        report.overridden.push(value[identifier]);
                    }
                    else report.ignored.push(value[identifier]);
                }
            }
        }
    }
    if (list.update) {
        for (let value of list.update) { if (!resource[field].some(element => element[identifier] === value[identifier])) throw 'Embedded resource to be updates from list not found: ' + value[identifier]; };
        resource[field] = resource[field].map(value => {
            if (new_value = list.update.find(element => element[identifier] == value[identifier]))
                return new_value.new
            return value;
        });
    }
    resource[field] = [...new Set(resource[field])];
    return [true, report];
}

const checkPassword = function (password,passwordhash) {
    const details = passwordStrength(password);
    if (details.id < process.env.MIN_PASSWORD_STRENGTH) throw new Error('The password strength is ' + details.value + ', please choose a stronger password');//MIN_PASSWORD_STRENGTH:0=TOO WEAK; 1=WEAK; 2=MEDIUM; 3=STRONG
    if (passwordhash === false || passwordhash === 'false') return password;
    return bcrypt.hashSync(password, 8);
}