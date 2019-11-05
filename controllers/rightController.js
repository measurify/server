const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Right = mongoose.model('Right');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Right); 
};

exports.getone = async (req, res) => { 
    return await manager.getResource(req, res, null, Right); 
};

exports.post = async (req, res) => {
    return await manager.postResource(req, res, Right);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Right); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    return await manager.deleteResource(req, res, Right);
};

exports.put = async (req, res) => { 
    const fields = ['access','visibility','tags'];
    let result = await checker.isAvailable(req, res, Right); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    return await manager.updateResource(req, res, fields, Right);
}
