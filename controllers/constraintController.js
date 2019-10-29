const mongoose = require('mongoose');
const manager = require('../commons/manager');
const Constraint = mongoose.model('Constraint');
const Authorization = require('../security/authorization.js');
const ObjectId = require('mongoose').Types.ObjectId;
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    try {
        const constraints = await manager.getResourceList(req.query, '{ "timestamp": "desc" }', '{}', Constraint);
        return res.status(200).json(constraints);
    }
    catch (err) { return errors.manage(res, errors.generic_request_error, err); }
};

exports.getone = async (req, res) => {
    if(!ObjectId.isValid(req.params.id)) return errors.manage(res, errors.constraint_not_found, req.params.id);
    const constraint = await Constraint.findById(req.params.id);
    if (!constraint) return errors.manage(res, errors.constraint_not_found, req.params.id);
    return res.status(200).json(constraint);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) {
        const results = { constraints: [], errors: [] };
        for (let [i, element] of req.body.entries()) {
            try {
                element.owner = req.user._id;
                results.constraints.push(await (new Constraint(element)).save());
            }
            catch (err) { results.errors.push("Index: " + i+  " (" + err.message + ")"); }
        }
        if (req.query.verbose == 'true') {
            if (results.errors.length === 0) { return res.status(200).json(results); }
            else { return res.status(202).json(results); }
        }
        else {
            if (results.errors.length === 0) { return res.status(200).json({ saved: results.constraints.length, errors: results.errors.length }); }
            else { return res.status(202).json({ saved: results.constraints.length, errors: results.errors.length, Indexes: results.errors }); }
        }
    }
    else {
        try {
            req.body.owner = req.user._id;
            return res.status(200).json(await (new Constraint(req.body)).save());
        }
        catch (err) { return errors.manage(res, errors.constraint_post_request_error, err); }
    }
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

