const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Measurement = mongoose.model('Measurement');

exports.get = async (req, res) => { 
    const select  = '{"owner": false, "timestamp": false, "lastmod": false, "__v":false}';
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Measurement);
    const restrictions = {...restriction_1, ...restriction_2};
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Measurement, restrictions);
};

exports.count = async (req, res) => { 
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Measurement);
    const restrictions = {...restriction_1, ...restriction_2};
    return await controller.getResourceListSize(req, res, Measurement, restrictions); 
};

exports.getone = async (req, res) => { 
    const select  = '{"owner": false, "timestamp": false, "lastmod": false, "__v":false}';
    let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Measurement); if (result != true) return result;
    return await controller.getResource(req, res, null, Measurement, select); 
};

exports.post = async (req, res) => {
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['thing','device', 'feature', 'tags']); if (result != true) return result;
    return await controller.postResource(req, res, Measurement);
};

exports.put = async (req, res) => { 
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Measurement); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Measurement);
};

exports.delete = async (req, res) => {
    const result = await checker.canDeleteList(req, res); if (result != true) return result;
    const restriction_1 = await checker.whatCanDelete(req, res);
    const restriction_2 = await checker.whichRights(req, res, Measurement);
    const restrictions = {...restriction_1, ...restriction_2};
    return await controller.deleteResourceList(req, res, Measurement, restrictions); 
};

exports.deleteone = async (req, res) => {
    let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Measurement); if (result != true) return result;
    return await controller.deleteResource(req, res, Measurement);
} 
