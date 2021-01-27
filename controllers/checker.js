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

exports.isAvailable = async function(req, res, model) {
    try {
        const item = await authorizator.isAvailable(req.params.id, null, model);
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
    if(!values.some(function (element) { 
        if(body[element] == null) return false;
        else if(Array.isArray(body[element])) if(body[element].length == 0) return false
        return true;
    })) return errors.manage(res, errors.missing_info);
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

exports.canCreate = async function(req, res) {
    if(!authorizator.canCreate(req.user)) return errors.manage(res, errors.restricted_access_create, "You cannot create new resources");
    return true;
}

exports.canRead = async function(req, res) {
    if(!authorizator.canRead(req.resource, req.user)) return errors.manage(res, errors.restricted_access_read, req.resource._id);
    return true;
} 

exports.canModify = async function(req, res) {
    if(!authorizator.canModify(req.resource, req.user)) return errors.manage(res, errors.restricted_access_modify, req.resource._id);
    return true;
} 

exports.canDelete = async function(req, res) {
    if(!authorizator.canDelete(req.resource, req.user)) return errors.manage(res, errors.restricted_access_delete, req.resource._id);
    return true;
}

exports.canDeleteList = async function(req, res) {
    if(!authorizator.canDeleteList(req.user)) return errors.manage(res, errors.restricted_access_delete);
    return true;
} 

exports.whatCanRead = async function(req, res) {
    return authorizator.whatCanRead(req.user);
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
    if(model.modelName == "Measurement") {
        const rights = await Right.find({user: req.user._id});
        return authorizator.whichRights(req.user, rights, 'type');
    }
    else {
        let type = model.modelName.toLowerCase();
        if(type == 'tag') type = 'tags';
        const rights = await Right.find({user: req.user._id, type: type});
        return authorizator.whichRights(req.user, rights, 'inside');
    }
} 

exports.hasRights = async function(req, res, model) {
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const item = await authorizator.isAvailable(req.params.id, null, model);
    if(model.modelName == "Measurement") {
        const rights = await Right.find({user: req.user._id});
        if(!authorizator.hasRights(req.user, rights, item, 'type')) return errors.manage(res, errors.restricted_access, item._id);
        return true;
    }
    else {
        let type = model.modelName.toLowerCase();
        if(type == 'tag') type = 'tags';
        const rights = await Right.find({user: req.user._id, type: type});
        if(!authorizator.hasRights(req.user, rights, item, 'inside')) return errors.manage(res, errors.restricted_access, item._id);
        return true;
    }
} 

exports.hasRightsToCreate = async function(req, res, fields) {
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const rights = await Right.find({user: req.user._id});
    if(!authorizator.hasRightsToCreate(req.user, rights, req.body, fields)) return errors.manage(res, errors.restricted_access, 'You miss rigths on some resources');
    return true;
} 

exports.readJustOwned = async function(req, res) {
    return authorizator.readJustOwned(req.user);
} 

exports.whatCanDelete = async function(req, res) {
    return authorizator.whatCanDelete(req.user);
} 
