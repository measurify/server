const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const broker = require('../commons/broker');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const select = await checker.whatCanSee(req, res, Device)
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Device);
    const restrictions = {...restriction_1, ...restriction_2};
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Device, restrictions); 
};

exports.getone = async (req, res) => { 
    const select = await checker.whatCanSee(req, res, Device)
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Device); if (result != true) return result;
    return await controller.getResource(req, res, null, Device, select); 
};

exports.getstream = async (ws, req) => { 
    let result = await checker.isAvailable(req, ws, Device); if (result != true) return result;
    result = await checker.canRead(req, ws); if (result != true) return result;
    result = await checker.hasRights(req, ws, Device); if (result != true) return result;
    broker.subscribe('device-' + req.resource._id, ws);
};

exports.post = async (req, res) => {
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['device','tags']); if (result != true) return result;
    return await controller.postResource(req, res, Device);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'device'); if (result != true) return result;
    result = await checker.hasRights(req, res, Device); if (result != true) return result;
    return await controller.deleteResource(req, res, Device);
};

exports.put = async (req, res) => { 
    const fields = ['features', 'scripts', 'tags', 'period', 'cycle', 'retryTime', 'scriptListMaxSize', 'measurementBufferSize', 'issueBufferSize', 'sendBufferSize', 'scriptStatementMaxSize', 'statementBufferSize', 'measurementBufferPolicy'  ];
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Device); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Device);
}