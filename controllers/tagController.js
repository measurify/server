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
    const restriction = await checker.whatCanRead(req, res);
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Tag, restriction);
};

exports.getone = async (req, res) => { 
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return res.status(200).json(req.resource);
};

exports.post = async (req, res) => {
    let result = await checker.canCreate(req, res); if (result != true) return result;
    return await manager.postResource(req, res, Tag);
};

exports.put = async (req, res) => { 
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    return await manager.updateResource(req, res, fields, Tag);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Feature, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Thing, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Tag, 'tags'); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await manager.deleteResource(req, res, Tag);
};

