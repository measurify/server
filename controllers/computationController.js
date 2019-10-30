const mongoose = require('mongoose');
const manager = require('./manager');
const Computation = mongoose.model('Computation');
const ObjectId = require('mongoose').Types.ObjectId;
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const runner = require('../computations/runner.js'); 
const ComputationStatusTypes = require('../models/computationStatusTypes.js'); 

exports.get = async (req, res) => { return await manager.getResourceList(res, req, '{ "timestamp": "desc" }', '{}', Computation); };

exports.getone = async (req, res) => {
    let computation = null;
    if(ObjectId.isValid(req.params.id)) computation = await Computation.findById(req.params.id);
    else computation = await Computation.findOne({ name: req.params.id });
    if(!computation) return res.status(errors.computation_not_found.status).json(errors.computation_not_found);    
    return res.status(200).json(computation);
};

exports.post = async (req, res) => {
    // TBD: think about authorization
    if(!req.body.code) return res.status(errors.computation_code_required.status).json(errors.computation_code_required.message);
    if(!req.body.filter) return res.status(errors.computation_filter_required.status).json(errors.computation_filter_required.message);
    req.body.owner = req.user._id;
    req.body.status = ComputationStatusTypes.running;
    const filter = JSON.parse(req.body.filter);
    const computation = new Computation(req.body);
    if(runner.go(filter, computation)) {
        await computation.save();
        return res.status(200).json(computation);
    }
    else return res.status(errors.computation_code_unknown.status).json(errors.computation_code_unknown.message);
}

exports.delete = async (req, res) => {
    let computation = null;
    if(ObjectId.isValid(req.params.id)) computation = await Computation.findById(req.params.id);
    else computation = await Computation.findOne({ name: req.params.id });
    if(!computation) return res.status(errors.computation_not_found.status).json(errors.computation_not_found);
    if (!Authorization.isOwner(req.user, computation)) return res.status(errors.not_owners_cannot_delete.status).json(errors.not_owners_cannot_delete.message);
    const result = await Computation.deleteOne({ _id: computation._id });
    if (!result) return res.status(errors.computation_not_found.status).json(errors.computation_not_found);
    else return res.status(200).json({ message: "Computation " + req.params.id + " deleted!" });
}
