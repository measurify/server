const mongoose = require('mongoose');
const Tag = mongoose.model('Tag');
const errors = require('../commons/errors.js');
const authorizator = require('../security/authorization.js');

exports.isAvailable = async function(req, res, resource) {
    try {
        const item = await resource.findById(req.params.id);
        if(!item) return errors.manage(res, errors.resource_not_found, req.params.id); 
        req.resource = item;
        return true;
    }
    catch (err) { 
        if(err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.generic_request_error, err); 
    }
}

exports.isNotUsed = async function(req, res, model, field) {
    let references = [];
    if(model.schema.path(field).instance === 'Array') references = await model.find({ [field] : { $elemMatch : {$in: [req.resource._id]}  } }).limit(1);
    else references = await model.find({ [field]: req.params.id }).limit(1);
    if (references.length != 0) return errors.manage(res, errors.already_used, 'Used in ' + references._id + ' ' + model.modelName);
    return true;
}

exports.isAdminitrator = async function(req, res) {
    if(!authorizator.isAdministrator(req.user)) return errors.manage(res, errors.admin_restricted_access, req.resource._id);
    return true;
}

exports.isOwned = async function(req, res) {
    if (!authorizator.isOwner(req.user, req.resource)) return errors.manage(res, errors.not_yours, req.resource._id);
    return true;
}