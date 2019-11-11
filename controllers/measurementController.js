const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Measurement = mongoose.model('Measurement');
const Thing = mongoose.model('Thing');
const Feature = mongoose.model('Feature');
const User = mongoose.model('User');
const Authorization = require('../security/authorization.js');
const ObjectId = require('mongoose').Types.ObjectId;
const paginate = require("paginate-array");
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const restriction = await checker.whatCanRead(req, res);
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Measurement, restriction); 
};

exports.getone = async (req, res) => { 
    let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return await manager.getResource(req, res, null, Measurement); 
};

exports.post = async (req, res) => {
    let result = await checker.canCreate(req, res); if (result != true) return result;
    return await manager.postResource(req, res, Measurement);
};

exports.put = async (req, res) => { 
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    return await manager.updateResource(req, res, fields, Measurement);
};

exports.deleteOne = async (req, res) => {
    let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await manager.deleteResource(req, res, Measurement);
}

exports.delete = async (req, res) => {
    // TBD
    if (!req.query.filter) return errors.manage(res, errors.measurement_delete_needs_filter);
    if (req.query.filter.startsWith("[")) { req.query.filter = "{ \"$or\": " + req.query.filter + " }" };
    req.query.filter = "{ \"$and\": [" + req.query.filter + " ,{\"owner\": \"" + req.user._id + "\"} ]}"
    const filter = JSON.parse(req.query.filter);
    const result = await Measurement.deleteMany(filter);
    if (result.n == 0) return errors.manage(res, errors.measurement_not_found, req.params.id);
    else return res.status(200).json({ message: + result.n + " measurements deleted!" });
};  

