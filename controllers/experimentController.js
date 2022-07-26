const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const select = await checker.whatCanSee(req, res, Experiment);
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Experiment);
    const restrictions = { ...restriction_1, ...restriction_2 };
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Experiment, restrictions);
};

exports.pipe = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const select = await checker.whatCanSee(req, res, Experiment);
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Experiment);
    const restrictions = { ...restriction_1, ...restriction_2 };
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Experiment, restrictions);
};

exports.getone = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const select = await checker.whatCanSee(req, res, Experiment);
    let result = await checker.isAvailable(req, res, Experiment); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Experiment); if (result != true) return result;
    return await controller.getResource(req, res, null, Experiment, select);
};

exports.post = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    return await controller.postResource(req, res, Experiment);
};

exports.put = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    const fields = ['_id', 'description', 'anonymization', 'state', 'startDate', 'endDate', 'location', 'protocol', 'metadata', 'history', 'tags', 'visibility'];
    let result = await checker.isAvailable(req, res, Experiment); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'experiment'); if (result != true) return result;
    result = await checker.hasRights(req, res, Experiment); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Experiment);
};

exports.delete = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    let result = await checker.isAvailable(req, res, Experiment); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'experiment'); if (result != true) return result;
    result = await checker.hasRights(req, res, Experiment); if (result != true) return result;
    return await controller.deleteResource(req, res, Experiment);
};
