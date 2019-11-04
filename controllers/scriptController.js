const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Script = mongoose.model('Script');
const Device = mongoose.model('Device');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Script); 
};

exports.getone = async (req, res) => { 
    return await manager.getResource(req, res, null, Script); 
};

exports.post = async (req, res) => {
    return await manager.postResource(req, res, Script);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'scripts'); if (result != true) return result;
    return await manager.deleteResource(req, res, Script);
};

exports.put = async (req, res) => { 
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;
    result = await checker.isFilled(req, res, ['code', 'tags']); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    return await manager.updateResource(req, res, ['code', 'tags'], Script);
}
