const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const ItemTypes = require("../types/itemTypes.js");

const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const select = await checker.whatCanSee(req, res, Feature);
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Feature);
    const restrictions = { ...restriction_1, ...restriction_2 };
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Feature, restrictions);
};

exports.pipe = async (req, res) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const select = await checker.whatCanSee(req, res, Feature);
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Feature);
    const restrictions = { ...restriction_1, ...restriction_2 };
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Feature, restrictions);
};

exports.getone = async (req, res) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const select = await checker.whatCanSee(req, res, Feature);
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Feature); if (result != true) return result;
    return await controller.getResource(req, res, null, Feature, select);
};

exports.post = async (req, res) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    return await controller.postResource(req, res, Feature);
};

exports.put = async (req, res) => {
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const fields = ['tags', '_id', 'items'];
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Feature); if (result != true) return result;
    if (req.body._id) result = await checker.isNotUsed(req, res, Measurement, 'feature'); if (result != true) return result;
    if (req.body._id) result = await checker.isNotUsed(req, res, Device, 'features'); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Feature);
};

exports.delete = async (req, res) => {
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'feature'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'features'); if (result != true) return result;
    result = await checker.hasRights(req, res, Feature); if (result != true) return result;
    return await controller.deleteResource(req, res, Feature);
};
