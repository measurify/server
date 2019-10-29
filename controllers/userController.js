const mongoose = require('mongoose');
const manager = require('../commons/manager');
const ObjectId = require('mongoose').Types.ObjectId;
const User = mongoose.model('User');
const Tag = mongoose.model('Tag');
const Feature = mongoose.model('Feature');
const Thing = mongoose.model('Thing');
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    try {
        if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.user_authorization_error);
        const users = await manager.getResourceList(req.query, '{ "username": "desc" }', '{}', User);
        return res.status(200).json(users);
    } 
    catch (err) { return errors.manage(res, errors.generic_request_error, err); } 
};

exports.getusernames = async (req, res) => {
    try {
        const usernames = await manager.getResourceList(req.query, '{ "username": "desc" }', '{ "type": "0", "_id": "0" }', User);
        return res.status(200).json(usernames);
    } 
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
};

exports.getone = async (req, res) => {
    try {
        if(!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.user_authorization_error);
        if(!ObjectId.isValid(req.params.id)) return errors.manage(res, errors.user_not_found, req.params.id);
        const user = await User.findById(req.params.id);
        if(!user) return errors.manage(res, errors.user_not_found, req.params.id);
        return res.status(200).json(user);
    } 
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
};

exports.post = async (req, res) => {
    if(!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.user_authorization_error);
    if (req.body.constructor == Array) {
        const results = { users: [], errors: [] };
        for (let element of req.body) {
            try { results.users.push(await (new User(element)).save()); }
            catch(err) { results.errors.push(err.message); }
        }
        if(results.errors.length === 0) return res.status(200).json(results);
        else return res.status(202).json(results);
    }
    try { res.status(200).json(await (new User(req.body)).save()); }
    catch (err) { return errors.manage(res, errors.user_post_request_error, err); }
};

exports.delete = async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return errors.manage(res, errors.user_not_found, req.params.id);
    const user = await User.findById(req.params.id);
    if(!user) return errors.manage(res, errors.user_not_found, req.params.id); 
    if(!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.user_authorization_error);
    const measurement = await Measurement.find({ owner: req.params.id }).limit(1);
    if (measurement.length != 0) return errors.manage(res, errors.user_cannot_be_deleted_with_measurement, measurement); 
    const device = await Device.find({ owner: req.params.id }).limit(1);
    if (device.length != 0) return errors.manage(res, errors.user_cannot_be_deleted_with_device, device); 
    const feature = await Feature.find({ owner: req.params.id }).limit(1);
    if (feature.length != 0) return errors.manage(res, errors.user_cannot_be_deleted_with_feature, feature); 
    const thing = await Thing.find({ owner: req.params.id }).limit(1);
    if (thing.length != 0) return errors.manage(res, errors.user_cannot_be_deleted_with_thing, thing); 
    const tag = await Tag.find({ owner: req.params.id }).limit(1);
    if (tag.length != 0) return errors.manage(res, errors.user_cannot_be_deleted_with_tag, tag); 
    const result = await User.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.user_not_found, req.params.id);
    else return res.status(200).json(user);
};

