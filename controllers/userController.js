const mongoose = require('mongoose');
const controller = require('./controller');
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
    const result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', User); 
};

exports.getusernames = async (req, res) => { 
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', '{ "type": "0", "_id": "0" }', User); 
};

exports.getone = async (req, res) => {
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return res.status(200).json(req.resource);
};

exports.post = async (req, res) => {
    let result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.postResource(req, res, User);
};

exports.put = async (req, res) => { 
    const fields = ['password'];
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isHim(req, res); if (result != true) return result;
    return await controller.updateResource(req, res, fields, User);
};  

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Feature, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Thing, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Tag, 'owner'); if (result != true) return result;
    return await controller.deleteResource(req, res, User);
};

