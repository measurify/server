const mongoose = require('mongoose'); 
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js'); 
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const select = await checker.whatCanSee(req, res, Feature)
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Feature); if (result != true) return result;
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    return await controller.getResourceDataset(req, res,'{ "timestamp": "desc" }', select, Measurement);
};