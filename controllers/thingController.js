const mongoose = require('mongoose');
const manager = require('./manager');
const Thing = mongoose.model('Thing');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { return await manager.getResourceList(res, req, '{ "timestamp": "desc" }', '{}', Thing); };

exports.getone = async (req, res) => {
    const thing = await Thing.findById(req.params.id);
    if (thing) return res.status(200).json(thing);
    else return errors.manage(res, errors.thing_not_found, req.params.id);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) return await manager.postResourceList(req, res, Thing);
    return await manager.postResource(req, res, Thing);
};

exports.delete = async (req, res) => {
    const thing = await Thing.findById(req.params.id);
    if(!thing) return errors.manage(res, errors.thing_not_found, req.params.id); 
    if (!Authorization.isOwner(req.user, thing)) return errors.manage(res, errors.thing_cannot_be_deleted_from_not_owner, req.params.id);
    const measurement = await Measurement.find({ thing: req.params.id }).limit(1);
    if (measurement.length != 0) return errors.manage(res, errors.thing_cannot_be_deleted_with_measurement, measurement); 
    const other = await Thing.find({ relations : { $elemMatch : {$in: [req.params.id]}  } }).limit(1);
    if (other.length != 0) return errors.manage(res, errors.thing_cannot_be_deleted_with_relations, other); 
    const result = await Thing.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.thing_not_found, req.params.id);
    else return res.status(200).json(thing);
};
