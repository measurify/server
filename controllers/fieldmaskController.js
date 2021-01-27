const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const bcrypt = require('bcryptjs');

exports.get = async (req, res) => { 
    const Fieldmask = mongoose.dbs[req.tenant.database].model('Fieldmask');
    const select = await checker.whatCanSee(req, res, Fieldmask)
    const result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Fieldmask); 
};

exports.pipe = async (req, res) => { 
    const select = await checker.whatCanSee(req, res, Feature)
    const result = await checker.isAdminitrator(req, res); if (result != true) return result;
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Fieldmask);
};

exports.getone = async (req, res) => {
    const Fieldmask = mongoose.dbs[req.tenant.database].model('Fieldmask');
    const select = await checker.whatCanSee(req, res, Fieldmask)
    let result = await checker.isAvailable(req, res, Fieldmask); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.getResource(req, res, null, Fieldmask, select);
};

exports.post = async (req, res) => {
    const Fieldmask = mongoose.dbs[req.tenant.database].model('Fieldmask');
    let result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.postResource(req, res, Fieldmask);
};

exports.put = async (req, res) => { 
    const Fieldmask = mongoose.dbs[req.tenant.database].model('Fieldmask');
    const fields = ['computation_fields', 'device_fields', 'feature_fields', 'measurement_fields', 'script_fields', 'tag_fields', 'thing_fields' ];
    let result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isAvailable(req, res, Fieldmask); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Fieldmask);
};  

exports.delete = async (req, res) => {
    const Fieldmask = mongoose.dbs[req.tenant.database].model('Fieldmask');
    const User = mongoose.dbs[req.tenant.database].model('User');
    let result = await checker.isAvailable(req, res, Fieldmask); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, User, 'fieldmask'); if (result != true) return result;
    return await controller.deleteResource(req, res, Fieldmask);
};

