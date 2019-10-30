const mongoose = require('mongoose');
const manager = require('./manager');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { return await manager.getResourceList(res, req, '{ "timestamp": "desc" }', '{}', Device); };

exports.getone = async (req, res) => {
    const device = await Device.findById(req.params.id);
    if (device) return res.status(200).json(device);
    else return errors.manage(res, errors.device_not_found, req.params.id);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) return await manager.postResourceList(req, res, Device);
    return await manager.postResource(req, res, Device);
};

exports.delete = async (req, res) => {
    const device = await Device.findById(req.params.id);
    if(!device) return errors.manage(res, errors.device_not_found, req.params.id); 
    if (!Authorization.isOwner(req.user, device)) return errors.manage(res, errors.device_cannot_be_deleted_from_not_owner, req.params.id); 
    const measurement = await Measurement.find({ device: req.params.id }).limit(1);
    if (measurement.length != 0) return errors.manage(res, errors.device_cannot_be_deleted_with_measurement, measurement); 
    const result = await Device.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.device_not_found, req.params.id);
    else return res.status(200).json(device);
};
