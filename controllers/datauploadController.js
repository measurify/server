const mongoose = require('mongoose'); 
const controller = require('./controller');
const checker = require('./checker');
const broker = require('../commons/broker');
const errors = require('../commons/errors.js');


exports.get = async (req, res) => { 
    const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
    
    const select = await checker.whatCanSee(req, res, Dataupload)
    
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Dataupload);
    const restrictions = {...restriction_1, ...restriction_2};
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Dataupload, restrictions); 
};
/*not tested
exports.pipe = async (req, res) => { 
    const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
    const select = await checker.whatCanSee(req, res, Dataupload)
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Dataupload);
    const restrictions = {...restriction_1, ...restriction_2};
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Dataupload, restrictions);
};
*/
exports.getone = async (req, res) => { 
    const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
    const select = await checker.whatCanSee(req, res, Dataupload)
    let result = await checker.isAvailable(req, res, Dataupload); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Dataupload); if (result != true) return result;
    return await controller.getResource(req, res, null, Dataupload, select);
};
/*not tested
exports.getstream = async (ws, req) => { 
    const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
    let result = await checker.isAvailable(req, ws, Dataupload); if (result != true) return result;
    result = await checker.canRead(req, ws); if (result != true) return result;
    result = await checker.hasRights(req, ws, Dataupload); if (result != true) return result;
    broker.subscribe('Dataupload-' + req.resource._id, ws);
};

exports.post = async (req, res) => {
    const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['dataupload']); if (result != true) return result;
    console.log("sono qui");
    return await controller.postResource(req, res, Dataupload);
};

exports.put = async (req, res) => { 
    const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Dataupload); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Dataupload); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Dataupload);
};   
*/
exports.delete = async (req, res) => {
    const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    let result = await checker.isAvailable(req, res, Dataupload); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;    
    result = await checker.canDelete(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Dataupload); if (result != true) return result;
    return await controller.deleteResource(req, res, Dataupload);
};
