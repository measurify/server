const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Computation = mongoose.model('Computation');
const Feature = mongoose.model('Computation');
const errors = require('../commons/errors.js');
const runner = require('../computations/runner.js'); 

exports.get = async (req, res) => { 
    const restriction = await checker.whatCanRead(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Computation, restriction); 
};

exports.getone = async (req, res) => { 
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return res.status(200).json(req.resource);
};

exports.post = async (req, res) => {
    const fields = ['code','feature'];
    let result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isComputable(req, res, Feature); if (result != true) return result;
    const computation = new Computation(req.body);
    if(runner.go(computation)) {
        await computation.save();
        return res.status(200).json(computation);
    }
    else return res.status(errors.computation_error.status).json(errors.computation_error.message);
}

exports.put = async (req, res) => { 
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Computation);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Computation);
}
