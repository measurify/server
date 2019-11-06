const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Log = mongoose.model('Log');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await manager.getResourceList(req, res, '{ "date": "desc" }', '{}', Log); 
};

