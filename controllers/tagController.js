const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Tag = mongoose.model('Tag');
const Feature = mongoose.model('Feature');
const Thing = mongoose.model('Thing');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Tag); 
};

exports.getone = async (req, res) => { 
    return await manager.getResource(req, res, null, Tag); 
};

exports.post = async (req, res) => {
    return await manager.postResource(req, res, Tag);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Feature, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Thing, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Tag, 'tags'); if (result != true) return result;
    return await manager.deleteResource(req, res, Tag);
};

