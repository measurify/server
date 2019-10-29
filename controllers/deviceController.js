const mongoose = require('mongoose');
const manager = require('../commons/manager');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    try {
        const devices = await manager.getResourceList(req.query, '{ "timestamp": "desc" }', '{}', Device);
        return res.status(200).json(devices);
    }
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
};

exports.getone = async (req, res) => {
    const device = await Device.findById(req.params.id);
    if (device) return res.status(200).json(device);
    else return errors.manage(res, errors.device_not_found, req.params.id);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) {
        const results = { devices: [], errors: [] };
        for (let element of req.body) {
            try {
                element.owner = req.user._id;
                results.devices.push(await (new Device(element)).save());
            }
            catch (err) { results.errors.push(err.message); }
        }
        if (results.errors.length === 0) return res.status(200).json(results);
        else return res.status(202).json(results);
    }
    else {
        try {
            req.body.owner = req.user._id;
            return res.status(200).json(await (new Device(req.body)).save());
        }
        catch (err) { return errors.manage(res, errors.device_post_request_error, err); }
    }
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
