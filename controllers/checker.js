const mongoose = require('mongoose');
const errors = require('../commons/errors.js');
const authorizator = require('../security/authorization.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

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

exports.isFilled = async function(req, res, values ) {
    if(!authorizator.isFilled(req.body, values)) return errors.manage(res, errors.missing_info);
    else return true;
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

exports.whatCanRead = async function(req, res) {
    return authorizator.whatCanRead(req.user);
} 
