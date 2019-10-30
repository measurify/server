const mongoose = require('mongoose');
const manager = require('./manager');
const Tag = mongoose.model('Tag');
const Feature = mongoose.model('Feature');
const Thing = mongoose.model('Thing');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { return await manager.getResourceList(res, req, '{ "timestamp": "desc" }', '{}', Tag); };

exports.getone = async (req, res) => {
    const tag = await Tag.findById(req.params.id);
    if (tag) return res.status(200).json(tag);
    else return errors.manage(res, errors.tag_not_found, req.params.id);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) return await manager.postResourceList(req, res, Tag);
    return await manager.postResource(req, res, Tag);
};

exports.delete = async (req, res) => {
    const tag = await Tag.findById(req.params.id);
    if(!tag) return errors.manage(res, errors.tag_not_found, req.params.id); 
    if (!Authorization.isOwner(req.user, tag)) return errors.manage(res, errors.tag_cannot_be_deleted_from_not_owner, req.params.id);
    const device = await Device.find({ tags : { $elemMatch : {$in: [req.params.id]}  } }).limit(1);
    if (device.length != 0) return errors.manage(res, errors.tag_cannot_be_deleted_with_device, device); 
    const measurement = await Measurement.find({ tags : { $elemMatch : {$in: [req.params.id]}  } }).limit(1);
    if (measurement.length != 0) return errors.manage(res, errors.tag_cannot_be_deleted_with_measurement, measurement); 
    const feature = await Feature.find({ tags : { $elemMatch : {$in: [req.params.id]}  } }).limit(1);
    if (feature.length != 0) return errors.manage(res, errors.tag_cannot_be_deleted_with_feature, feature); 
    const thing = await Thing.find({ tags : { $elemMatch : {$in: [req.params.id]}  } }).limit(1);
    if (thing.length != 0) return errors.manage(res, errors.tag_cannot_be_deleted_with_thing, thing); 
    const other = await Tag.find({ tags : { $elemMatch : {$in: [req.params.id]}  } }).limit(1);
    if (other.length != 0) return errors.manage(res, errors.tag_cannot_be_deleted_with_tag, other); 
    const result = await Tag.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.tag_not_found, req.params.id);
    else return res.status(200).json(tag);
};

