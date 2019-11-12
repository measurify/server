const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Feature = mongoose.model('Feature');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const restriction = await checker.whatCanRead(req, res);
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Feature, restriction); 
};

exports.getone = async (req, res) => { 
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return res.status(200).json(req.resource);
};

exports.post = async (req, res) => {
    let result = await checker.canCreate(req, res); if (result != true) return result;
    return await manager.postResource(req, res, Feature);
};

exports.put = async (req, res) => { 
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    return await manager.updateResource(req, res, fields, Feature);
}; 

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'feature'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'features'); if (result != true) return result;
    return await manager.deleteResource(req, res, Feature);
};
