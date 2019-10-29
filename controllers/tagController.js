const mongoose = require('mongoose');
const manager = require('../commons/manager');
const Tag = mongoose.model('Tag');
const Feature = mongoose.model('Feature');
const Thing = mongoose.model('Thing');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    try {
        const tags = await manager.getResourceList(req.query, '{ "timestamp": "desc" }', '{}', Tag);
        return res.status(200).json(tags);
    } 
    catch (err) { return errors.manage(res, errors.generic_request_error, err); } 
};

exports.getone = async (req, res) => {
    const tag = await Tag.findById(req.params.id);
    if (tag) return res.status(200).json(tag);
    else return errors.manage(res, errors.tag_not_found, req.params.id);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) {
        const results = { tags: [], errors: [] };
        for (let element of req.body) {
            element.owner = req.user._id;
            try { results.tags.push(await (new Tag(element)).save()); }
            catch (err) { results.errors.push(err.message); }
        }
        if (results.errors.length === 0) return res.status(200).json(results);
        else return res.status(202).json(results);
    }
    else {
        try {
            req.body.owner = req.user._id;
            res.status(200).json(await (new Tag(req.body)).save());
        }
        catch (err) { return errors.manage(res, errors.tag_post_request_error, err); }
    }
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

