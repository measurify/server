const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Log = mongoose.model('Log');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.getResourceList(req, res, '{ "date": "desc" }', '{}', Log); 
};

exports.pipe = async (req, res) => { 
    const result = await checker.isAdminitrator(req, res); if (result != true) return result;
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Log);
};

