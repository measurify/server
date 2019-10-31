const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const ObjectId = require('mongoose').Types.ObjectId;
const User = mongoose.model('User');
const Tag = mongoose.model('Tag');
const Feature = mongoose.model('Feature');
const Thing = mongoose.model('Thing');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.user_authorization_error);
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', User); 
};

exports.getusernames = async (req, res) => { 
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{ "type": "0", "_id": "0" }', User); 
};

exports.getone = async (req, res) => {
    if(!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.user_authorization_error);
    return await manager.getResource(req, res, null, User);
};

exports.post = async (req, res) => {
    if(!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.user_authorization_error);
    return await manager.postResource(req, res, User);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Feature, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Thing, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Tag, 'owner'); if (result != true) return result;
    return await manager.deleteResource(req, res, User);
};

