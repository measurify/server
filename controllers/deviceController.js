const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Device); };

exports.getone = async (req, res) => { return await manager.getResource(req, res, null, Device); };

exports.post = async (req, res) => {
    return await manager.postResource(req, res, Device);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'device'); if (result != true) return result;
    return await manager.deleteResource(req, res, Device);
};

exports.put = async (req, res) => { 
    const fields = ['features', 'scripts', 'tags'];
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    return await manager.updateResource(req, res, fields, Device);
}