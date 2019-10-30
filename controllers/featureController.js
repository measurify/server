const mongoose = require('mongoose');
const manager = require('./manager');
const Feature = mongoose.model('Feature');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { return await manager.getResourceList(res, req, '{ "timestamp": "desc" }', '{}', Feature); };

exports.getone = async (req, res) => {
    const feature = await Feature.findById(req.params.id);
    if (feature) return res.status(200).json(feature);
    else return errors.manage(res, errors.feature_not_found, req.params.id);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) return await manager.postResourceList(req, res, Feature);
    return await manager.postResource(req, res, Feature);
};

exports.delete = async (req, res) => {
    const feature = await Feature.findById(req.params.id);
    if(!feature) return errors.manage(res, errors.feature_not_found, req.params.id); 
    if (!Authorization.isOwner(req.user, feature)) return errors.manage(res, errors.feature_cannot_be_deleted_from_not_owner, req.params.id); 
    const measurement = await Measurement.find({ feature: req.params.id }).limit(1);
    if (measurement.length != 0) return errors.manage(res, errors.feature_cannot_be_deleted_with_measurement, measurement); 
    const device = await Device.find({ features : { $elemMatch : {$in: [req.params.id]}  } }).limit(1);
    if (device.length != 0) return errors.manage(res, errors.feature_cannot_be_deleted_with_device, device); 
    const result = await Feature.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.feature_not_found, req.params.id);
    else return res.status(200).json(feature);
};
