const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Thing = mongoose.model('Thing');
const Measurement = mongoose.model('Measurement');
const AccessTypes = require('../types/accessTypes.js'); 
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Thing); 
};

exports.getone = async (req, res) => { 
    let result = await checker.isAvailable(req, res, Thing); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return res.status(200).json(req.resource);
};

exports.post = async (req, res) => {
    let result = await checker.canCreate(req, res); if (result != true) return result;
    return await manager.postResource(req, res, Thing);
};

exports.put = async (req, res) => { 
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Thing); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    return await manager.updateResource(req, res, fields, Thing);
};   

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Thing); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'thing'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Thing, 'relations'); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await manager.deleteResource(req, res, Thing);
};
