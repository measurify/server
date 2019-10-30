const mongoose = require('mongoose');
const manager = require('./manager');
const Constraint = mongoose.model('Constraint');
const Authorization = require('../security/authorization.js');
const ObjectId = require('mongoose').Types.ObjectId;
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { return await manager.getResourceList(res, req, '{ "timestamp": "desc" }', '{}', Constraint); };

exports.getone = async (req, res) => {
    if(!ObjectId.isValid(req.params.id)) return errors.manage(res, errors.constraint_not_found, req.params.id);
    const constraint = await Constraint.findById(req.params.id);
    if (!constraint) return errors.manage(res, errors.constraint_not_found, req.params.id);
    return res.status(200).json(constraint);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) return await manager.postResourceList(req, res, Constraint);
    return await manager.postResource(req, res, Constraint);
};

exports.delete = async (req, res) => {
    if(!ObjectId.isValid(req.params.id)) return errors.manage(res, errors.constraint_not_found, req.params.id);
    const constraint = await Constraint.findById(req.params.id);
    if(!constraint) return errors.manage(res, errors.constraint_not_found, req.params.id); 
    if (!Authorization.isOwner(req.user, constraint)) return errors.manage(res, errors.constraint_cannot_be_deleted_from_not_owner, req.params.id); 
    const result = await Constraint.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.constraint_not_found, req.params.id);
    else return res.status(200).json(constraint);
};

