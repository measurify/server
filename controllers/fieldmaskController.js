const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Fieldmask = mongoose.model('Fieldmask');
const Tag = mongoose.model('Tag');
const User = mongoose.model('User');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const bcrypt = require('bcryptjs');

exports.get = async (req, res) => { 
    const select  = '{"owner": false, "password": false, "timestamp": false, "lastmod": false, "__v":false}';
    const result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Fieldmask); 
};

exports.getone = async (req, res) => {
    const select  = '{"owner": false, "password": false, "timestamp": false, "lastmod": false, "__v":false}';
    let result = await checker.isAvailable(req, res, Fieldmask); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.getResource(req, res, null, Fieldmask, select);
};

exports.post = async (req, res) => {
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.postResource(req, res, Fieldmask);
};

exports.put = async (req, res) => { 
    const fields = ['computation_fields', 'device_fields', 'feature_fields', 'measurement_fields', 'script_fields', 'tag_fields', 'thing_fields' ];
    let result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isAvailable(req, res, Fieldmask); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Fieldmask);
};  

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Fieldmask); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, User, 'fieldmask'); if (result != true) return result;
    return await controller.deleteResource(req, res, Fieldmask);
};

