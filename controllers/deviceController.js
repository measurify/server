const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const emitter = require('../commons/emitter');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const restriction = await checker.whatCanRead(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Device, restriction); 
};

exports.getone = async (req, res) => { 
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return res.status(200).json(req.resource);
};

exports.getstream = async (req, res) => { 
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    emitter.on('device-' + req.resource._id, function(data) { res.write('data: ' + JSON.stringify(data) + '\n\n'); });
};

exports.post = async (req, res) => {
    let result = await checker.canCreate(req, res); if (result != true) return result;
    return await controller.postResource(req, res, Device);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'device'); if (result != true) return result;
    return await controller.deleteResource(req, res, Device);
};

exports.put = async (req, res) => { 
    const fields = ['features', 'scripts', 'tags'];
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Device);
}