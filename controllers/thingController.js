const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Thing = mongoose.model('Thing');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Thing); 
};

exports.getone = async (req, res) => { 
    return await manager.getResource(req, res, null, Thing); 
};

exports.post = async (req, res) => {
    return await manager.postResource(req, res, Thing);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Thing); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'thing'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Thing, 'relations'); if (result != true) return result;
    return await manager.deleteResource(req, res, Thing);
};
