const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const broker = require('../commons/broker');
const errors = require('../commons/errors.js');
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => {
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    const select = await checker.whatCanSee(req, res, Thing);
    const restriction_1 = await checker.whatCanOperate(req, res,"Thing");
    const restriction_2 = await checker.whichRights(req, res, Thing);
    const restrictions = { ...restriction_1, ...restriction_2 };
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Thing, restrictions);
};

exports.pipe = async (req, res) => {
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    const select = await checker.whatCanSee(req, res, Thing);
    const restriction_1 = await checker.whatCanOperate(req, res,"Thing");
    const restriction_2 = await checker.whichRights(req, res, Thing);
    const restrictions = { ...restriction_1, ...restriction_2 };
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Thing, restrictions);
};

exports.getone = async (req, res) => {
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    const select = await checker.whatCanSee(req, res, Thing);
    let result = await checker.isAvailable(req, res, Thing); if (result != true) return result;
    result = await checker.canOperate(req, res,"Thing"); if (result != true) return result;
    result = await checker.hasRights(req, res, Thing); if (result != true) return result;
    return await controller.getResource(req, res, null, Thing, select);
};

exports.getstream = async (ws, req) => {
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    let result = await checker.isAvailable(req, ws, Thing); if (result != true) return result;
    result = await checker.canOperate(req, ws,"Thing"); if (result != true) return result;
    result = await checker.hasRights(req, ws, Thing); if (result != true) return result;
    broker.subscribe('thing-' + req.resource._id, ws);
};

exports.post = async (req, res) => {
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    let result = await checker.canOperate(req, res,"Thing"); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    return await controller.postResource(req, res, Thing);
};

exports.put = async (req, res) => {
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    const fields = ['tags', '_id'];
    let result = await checker.isAvailable(req, res, Thing); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canOperate(req, res,"Thing"); if (result != true) return result;
    result = await checker.hasRights(req, res, Thing); if (result != true) return result;
    if (req.body._id) result = await checker.isNotUsed(req, res, Measurement, 'thing'); if (result != true) return result;
    if (req.body._id) result = await checker.isNotUsed(req, res, Thing, 'relations'); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Thing);
};

exports.delete = async (req, res) => {
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    let result = await checker.isAvailable(req, res, Thing); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'thing'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Thing, 'relations'); if (result != true) return result;
    result = await checker.canOperate(req, res,"Thing"); if (result != true) return result;
    result = await checker.hasRights(req, res, Thing); if (result != true) return result;
    return await controller.deleteResource(req, res, Thing);
};
