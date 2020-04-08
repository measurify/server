const mongoose = require('mongoose'); 
const controller = require('./controller');
const checker = require('./checker');
const emitter = require('../commons/emitter');
const Thing = mongoose.model('Thing');
const Measurement = mongoose.model('Measurement');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const select  = '{"owner": false, "timestamp": false, "lastmod": false, "__v":false}';
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Thing);
    const restrictions = {...restriction_1, ...restriction_2};
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Thing, restrictions); 
};

exports.getone = async (req, res) => { 
    const select  = '{"owner": false, "timestamp": false, "lastmod": false, "__v":false}';
    let result = await checker.isAvailable(req, res, Thing); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Thing); if (result != true) return result;
    return await controller.getResource(req, res, null, Thing, select);
};

exports.getstream = async (req, res) => { 
    let result = await checker.isAvailable(req, res, Thing); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Thing); if (result != true) return result;
    res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    emitter.on('thing-' + req.resource._id, function(data) { res.write('data: ' + JSON.stringify(data) + '\n\n'); });
};

exports.post = async (req, res) => {
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    return await controller.postResource(req, res, Thing);
};

exports.put = async (req, res) => { 
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Thing); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Thing); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Thing);
};   

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Thing); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'thing'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Thing, 'relations'); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Thing); if (result != true) return result;
    return await controller.deleteResource(req, res, Thing);
};
