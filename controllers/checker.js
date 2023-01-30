const mongoose = require('mongoose');
const errors = require('../commons/errors.js');
const authorizator = require('../security/authorization.js');
const inspector = require('../commons/inspector.js');

exports.isTenantAvailable = async function(req, res) {
    try {
        const Tenant = mongoose.dbs['catalog'].model('Tenant');
        const item = await authorizator.isAvailable(req.tenat, null, Tenant);
        if(!item) return errors.manage(res, errors.resource_not_found, req.tenat); 
        req.tenant._id = item;
        return true;
    }
    catch (err) { 
        if(err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.generic_request_error, err); 
    }
}

exports.isRelated = async function(req, res, id, field, model) {
    try {
        const item = await authorizator.isAvailable(id, null, model, req);
        if(item[field] != req.resource._id) return errors.manage(res, errors.resource_not_found, id);
        return true;
    }
    catch (err) { 
        if(err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.generic_request_error, err); 
    }
}

exports.isAvailable = async function(req, res, model) {
    try {
        const item = await authorizator.isAvailable(req.params.id, null, model,req);
        if(!item) return errors.manage(res, errors.resource_not_found, req.params.id); 
        req.resource = item;
        return true;
    }
    catch (err) { 
        if(err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.generic_request_error, err); 
    }
}

exports.isFilled = async function(req, res, values) {
    const body = req.body;
    if(!body) return errors.manage(res, errors.missing_info);
    if(Object.keys(body).length === 0) return errors.manage(res, errors.missing_info);
    if(!values.some(function (element) { 
        if(body[element] == null) return false;
        else if(Array.isArray(body[element])) if(body[element].length == 0) return false;
        return true;
    })) return errors.manage(res, errors.incorrect_info);
    return true;
}

exports.isComputable = async function(req, res, model) {
    const result = await inspector.isComputable(req.body.feature, req.body.items, req.body.code, model);
    if(result != true) return errors.manage(res, errors.post_request_error, result);
    return true;
}

exports.isNotUsed = async function(req, res, model, field) {
    const result = await authorizator.isNotUsed(req.resource, model, field);
    if(result != true) return errors.manage(res, errors.already_used, result);
    return true;
} 

exports.isAdminitrator = async function(req, res) {
    if(!authorizator.isAdministrator(req.user)) {  
        if (req.resource) return errors.manage(res, errors.admin_restricted_access, req.resource._id);
        else return errors.manage(res, errors.admin_restricted_access);
    }
    return true;
}

exports.isHim = async function(req, res) {
    if (!authorizator.isHim(req.resource, req.user)) return errors.manage(res, errors.not_you, req.resource._id);
    return true;
}

exports.isOwned = async function(req, res) {
    if (!authorizator.isOwner(req.resource, req.user)) return errors.manage(res, errors.not_yours, req.resource._id);
    return true;
}

exports.canOperate = async function(req, res, entity,method) {
    const Role = mongoose.dbs[req.tenant.database].model('Role');
    const role = await Role.findById(req.user.type);
    if(!method)method=req.method;
    if(!authorizator.canOperate(req.user,role,req.method,entity,req.resource)) return errors.manage(res, errors.restricted_access_operation, "You cannot do "+req.method.toLowerCase()+" operation on the resource "+entity);
    return true;
}

exports.whatCanOperate = async function(req, res, entity) {
    const Role = mongoose.dbs[req.tenant.database].model('Role');
    const role = await Role.findById(req.user.type);
    return authorizator.whatCanOperate(req.user,role,req.method,entity);
}

exports.canDeleteMeasurementList = async function(req, res, entity) {
    const Role = mongoose.dbs[req.tenant.database].model('Role');
    const role = await Role.findById(req.user.type);
    if(!authorizator.canDeleteMeasurementList(req.user,role,req.method,entity)) return errors.manage(res, errors.restricted_access_delete);
    return true;
} 

exports.isValid = async function(req, res, type, field) {
    const value = req.body[field];
    if(!value) return true;
    if(!Object.values(type).includes(value)) return errors.manage(res, errors.unknown_value, value);
    return true;
}

exports.whatCanSee = async function(req, res, model) {
    const Fieldmask = mongoose.dbs[req.tenant.database].model('Fieldmask');
    let select_base  = {owner: false, timestamp: false, lastmod: false, __v:false, password:false};
    if(!req.user.fieldmask) return select_base;
    const fieldmask = await Fieldmask.findById(req.user.fieldmask);
    const mask = fieldmask[model.modelName.toLowerCase() + '_fields'];
    if(!mask || mask.length == 0) return select_base;
    let select = {};
    for (let value of mask) {select[value] = true }
    return select;
}

exports.whichRights = async function(req, res, model) {
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const groups = await Group.find({users: req.user._id});
    if(model.modelName == "Measurement") {
        const rights = await Right.find({$or:[{user: req.user._id},{group: { $in: groups }}]});
        return authorizator.whichRights(req.user, rights, 'type');
    }
    else {
        let type = model.modelName;
        const rights = await Right.find({$or:[{user: req.user._id},{group:{ $in:groups}}], type: type});
        return authorizator.whichRights(req.user, rights, 'inside');
    }
} 

exports.ofResource = async function(req, res, field) {
  if(!req.query.filter) req.query.filter = '{ "' + field + '" : "' + req.resource._id + '" }';
  else req.query.filter = '{ "$and": [{ "' + field + '" : "' + req.resource._id + '" },' + req.query.filter + ']}';
}

exports.hasRights = async function(req, res, model) {
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const item = await authorizator.isAvailable(req.params.id, null, model);
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const groups = await Group.find({users: req.user._id});
    if(model.modelName == "Measurement") {
        const rights = await Right.find({$or:[{user: req.user._id},{group: { $in: groups }}]});
        if(!authorizator.hasRights(req.user, rights, item, 'type')) return errors.manage(res, errors.restricted_access, item._id);
        return true;
    }
    else {
        let type = model.modelName;
        const rights = await Right.find({$or:[{user: req.user._id},{group:{ $in:groups}}], type: type});
        if(!authorizator.hasRights(req.user, rights, item, 'inside')) return errors.manage(res, errors.restricted_access, item._id);
        return true;
    }
} 

exports.hasRightsToCreate = async function(req, res, fields) {
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const groups = await Group.find({users: req.user._id});
    const rights = await Right.find({$or:[{user: req.user._id},{group: { $in: groups }}]});
    if(!authorizator.hasRightsToCreate(req.user, rights, req.body, fields)) return errors.manage(res, errors.restricted_access, 'You miss rights on some resources');
    return true;
} 

exports.readJustOwned = async function(req, res) {
    return authorizator.readJustOwned(req.user);
} 

exports.changeUsernameWithId = async function(req,list) {
    const User = mongoose.dbs[req.tenant.database].model('User');
    return await Promise.all(list.map(async function (e) {
        if (!mongoose.Types.ObjectId.isValid(e)) {
            const user = await User.findOne({ username: e });
            if (user) return user._id.toString();
        }
        return e;
    }))
}