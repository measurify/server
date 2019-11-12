const mongoose = require('mongoose');
const Right = mongoose.model('Right');
const errors = require('../commons/errors.js');
const authorizator = require('../security/authorization.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

exports.isAvailable = async function(req, res, model) {
    try {
        const item = await model.findById(req.params.id);
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
    if(!values.some(function (element) { return req.body[element] !== null; }) ) return res.status(errors.missing_info.status).json(errors.missing_info);
    else return true;
}

exports.isNotUsed = async function(req, res, model, field) {
    let references = [];
    if(model.schema.path(field).instance === 'Array') references = await model.find({ [field] : { $elemMatch : {$in: [req.resource._id]}  } }).limit(1);
    else references = await model.find({ [field]: req.params.id }).limit(1);
    if (references.length != 0) return errors.manage(res, errors.already_used, 'Used in ' + references._id + ' ' + model.modelName);
    return true;
} 

exports.isAdminitrator = async function(req, res) {
    if(!authorizator.isAdministrator(req.user)) {  
        if (req.resource) return errors.manage(res, errors.admin_restricted_access, req.resource._id);
        else return errors.manage(res, errors.admin_restricted_access);
    }
    return true;
}

// Check rights TBD
//const rights = await Right.findOne({resource: req.resource._id, user: req.user._id})

exports.isOwned = async function(req, res) {
    if (!authorizator.isOwner(req.user, req.resource)) return errors.manage(res, errors.not_yours, req.resource._id);
    return true;
}

exports.canCreate = async function(req, res) {
    if (authorizator.isAdministrator(req.user)) return true;
    if (authorizator.isProvider(req.user)) return true;
    return errors.manage(res, errors.restricted_access_create, "You cannot create new resources");
}

exports.canRead = async function(req, res) {
    if (!req.resource.visibility) req.resource.visibility = VisibilityTypes.private;
    if (req.resource.visibility == VisibilityTypes.public) return true;
    if (authorizator.isAdministrator(req.user)) return true;
    if (authorizator.isAnalyst(req.user)) return true;
    if (authorizator.isProvider(req.user) && authorizator.isOwner(req.user, req.resource)) return true;
    return errors.manage(res, errors.restricted_access_read, req.resource._id);
} 

exports.canModify = async function(req, res) {
    if (authorizator.isAdministrator(req.user)) return true;
    if (authorizator.isProvider(req.user) && authorizator.isOwner(req.user, req.resource)) return true;
    return errors.manage(res, errors.restricted_access_modify, req.resource._id);
} 

exports.canDelete = async function(req, res) {
    if (authorizator.isAdministrator(req.user)) return true;
    if (authorizator.isProvider(req.user) && authorizator.isOwner(req.user, req.resource)) return true;
    return errors.manage(res, errors.restricted_access_delete, req.resource._id);
} 

exports.whatCanRead = async function(req, res) {
    if (authorizator.isAdministrator(req.user)) return null;
    if (authorizator.isAnalyst(req.user)) return null;
    if (authorizator.isProvider(req.user)) return { $or: [  { owner: req.user._id }, { visibility: VisibilityTypes.public } ] };
    return null;
} 

