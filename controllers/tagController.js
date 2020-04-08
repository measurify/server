const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Tag = mongoose.model('Tag');
const Feature = mongoose.model('Feature');
const Thing = mongoose.model('Thing'); 
const Device = mongoose.model('Device');
const Measurement = mongoose.model('Measurement');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Tag);
    const restrictions = {...restriction_1, ...restriction_2};
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', '{"owner": false}', Tag, restrictions);
};

exports.getone = async (req, res) => { 
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Tag); if (result != true) return result;
    return await controller.getResource(req, res, null, Tag, '{"owner": false}');
};

exports.post = async (req, res) => {
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    return await controller.postResource(req, res, Tag);
};

exports.put = async (req, res) => { 
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Tag); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Tag);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Feature, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Thing, 'tags'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Tag, 'tags'); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Tag); if (result != true) return result;
    return await controller.deleteResource(req, res, Tag);
};

