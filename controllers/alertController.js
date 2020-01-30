const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Alert = mongoose.model('Alert');
const AlertTypes = require('../types/alertTypes');

exports.get = async (req, res) => { 
    const restriction = await checker.readJustOwned(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Alert, restriction); 
};

exports.post = async (req, res) => {
    return await controller.postResource(req, res, Alert);
};

exports.getTypes = async (req, res) => {
    return res.status(200).json(AlertTypes);
};
