const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Computation = mongoose.model('Computation');
const ObjectId = require('mongoose').Types.ObjectId;
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const runner = require('../computations/runner.js'); 
const ComputationStatusTypes = require('../types/computationStatusTypes.js'); 

exports.get = async (req, res) => { 
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Computation); 
};

exports.getone = async (req, res) => { 
    return await manager.getResource(req, res, 'name', Computation); 
};

exports.post = async (req, res) => {
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
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    return await manager.deleteResource(req, res, Computation);
}
