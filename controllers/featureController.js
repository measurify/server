const mongoose = require('mongoose');
const manager = require('../commons/manager');
const Feature = mongoose.model('Feature');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    try {
        const features = await manager.getResourceList(req.query, '{ "timestamp": "desc" }', '{}', Feature);
        return res.status(200).json(features);
    }
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
};

exports.getone = async (req, res) => {
    const feature = await Feature.findById(req.params.id);
    if (feature) return res.status(200).json(feature);
    else return errors.manage(res, errors.feature_not_found, req.params.id);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) {
        const results = { features: [], errors: [] };
        for (let element of req.body) {
            element.owner = req.user._id;
            try { results.features.push(await (new Feature(element)).save()); }
            catch (err) { results.errors.push(err.message); }
        }
        if (results.errors.length === 0) return res.status(200).json(results);
        else return res.status(202).json(results);
    }
    else {
        try {
            req.body.owner = req.user._id;
            return res.status(200).json(await (new Feature(req.body)).save());
        }
        catch (err) { return errors.manage(res, errors.feature_post_request_error, err); }
    }
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
