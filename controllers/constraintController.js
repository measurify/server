const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Constraint = mongoose.model('Constraint');
const Authorization = require('../security/authorization.js');
const ObjectId = require('mongoose').Types.ObjectId;
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Constraint); 
};

exports.getone = async (req, res) => { 
    return await manager.getResource(req, res, null, Constraint); 
};

exports.post = async (req, res) => {
    return await manager.postResource(req, res, Constraint);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Constraint); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    return await manager.deleteResource(req, res, Constraint);
};

