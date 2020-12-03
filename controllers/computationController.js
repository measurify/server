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
    const Feature = mongoose.dbs[req.tenant._id].model('Feature');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['feature','tags']); if (result != true) return result;
    result = await checker.isComputable(req, res, Feature); if (result != true) return result;
    const answer = await controller.postResource(req, res, Computation);
    runner.go(req.result, req.user, req.tenant);
    return answer;
};

exports.put = async (req, res) => { 
    const Computation = mongoose.dbs[req.tenant._id].model('Computation');
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    const answer = await controller.updateResource(req, res, fields, Computation);
    return answer;
};

exports.delete = async (req, res) => {
    const Computation = mongoose.dbs[req.tenant._id].model('Computation');
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Computation);
};

exports.hook = async (req, res) => { 
    const Computation = mongoose.dbs[req.tenant._id].model('Computation');
    const fields = ['progress'];
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    const answer = await controller.updateResource(req, res, fields, Computation);
    runner.update(req.resource, req.user, req.tenant);
    return answer;
};