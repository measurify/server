const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const errors = require('../commons/errors.js');
const runner = require('../computations/runner.js'); 

exports.get = async (req, res) => { 
    const Computation = mongoose.dbs[req.tenant._id].model('Computation');
    const select = await checker.whatCanSee(req, res, Computation)
    const restriction = await checker.whatCanRead(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Computation, restriction); 
};

exports.getone = async (req, res) => { 
    const Computation = mongoose.dbs[req.tenant._id].model('Computation');
    const select = await checker.whatCanSee(req, res, Computation)
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return await controller.getResource(req, res, null, Computation, select); 
};

exports.post = async (req, res) => {
    const Computation = mongoose.dbs[req.tenant._id].model('Computation');
    const fields = ['code','feature'];
    let result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isComputable(req, res, Feature); if (result != true) return result;
    const computation = new Computation(req.body);
    if(runner.go(computation, req.tenant._id)) {
        await computation.save();
        return res.status(200).json(computation);
    }
    else return res.status(errors.computation_error.status).json(errors.computation_error.message);
}

exports.put = async (req, res) => { 
    const Computation = mongoose.dbs[req.tenant._id].model('Computation');
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Computation);
};

exports.delete = async (req, res) => {
    const Computation = mongoose.dbs[req.tenant._id].model('Computation');
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Computation);
}
