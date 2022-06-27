const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const broker = require('../commons/broker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const MeasurementBufferPolicyTypes = require('../types/measurementBufferPolicyTypes.js'); 
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => { 
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const select = await checker.whatCanSee(req, res, Device)
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Device);
    const restrictions = {...restriction_1, ...restriction_2};
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Device, restrictions); 
};

exports.pipe = async (req, res) => { 
    const select = await checker.whatCanSee(req, res, Device)
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Device);
    const restrictions = {...restriction_1, ...restriction_2};
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Device, restrictions);
};

exports.getone = async (req, res) => { 
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const select = await checker.whatCanSee(req, res, Device)
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Device); if (result != true) return result;
    return await controller.getResource(req, res, null, Device, select); 
};

exports.getstream = async (ws, req) => { 
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    let result = await checker.isAvailable(req, ws, Device); if (result != true) return result;
    result = await checker.canRead(req, ws); if (result != true) return result;
    result = await checker.hasRights(req, ws, Device); if (result != true) return result;
    broker.subscribe('device-' + req.resource._id, ws);
};

exports.post = async (req, res) => {
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['device','tags']); if (result != true) return result;
    return await controller.postResource(req, res, Device);
};

exports.delete = async (req, res) => {
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'device'); if (result != true) return result;
    result = await checker.hasRights(req, res, Device); if (result != true) return result;
    return await controller.deleteResource(req, res, Device);
};

exports.put = async (req, res) => { 
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const fields = ['_id','features', 'scripts', 'tags', 'visibility', 'period', 'cycle', 'retryTime', 'scriptListMaxSize', 'measurementBufferSize', 'issueBufferSize', 'sendBufferSize', 'scriptStatementMaxSize', 'statementBufferSize', 'measurementBufferPolicy'  ];
    let result = await checker.isAvailable(req, res, Device); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Device); if (result != true) return result;
    result = await checker.isValid(req, res, VisibilityTypes, 'visibility'); if (result != true) return result;
    result = await checker.isValid(req, res, MeasurementBufferPolicyTypes, 'measurementBufferPolicy'); if (result != true) return result;
    if (req.body._id != null) {        
        //check post        
        let result = await checker.canCreate(req, res); if (result != true) return result;
        result = await checker.hasRightsToCreate(req, res, ['device','tags']); if (result != true) return result;
        //check delete        
        const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');        
        result = await checker.isOwned(req, res); if (result != true) return result;
        result = await checker.isNotUsed(req, res, Measurement, 'device'); if (result != true) return result;
        //prepare id for the delete
        req.params.id = req.resource._id;
        //check getone        
        const select = await checker.whatCanSee(req, res, Device);        
        result = await checker.canRead(req, res); if (result != true) return result;   
        //get
        const oldDevice = await persistence.get(req.params.id, null, Device, select);
        if (!oldDevice) return errors.manage(res, errors.resource_not_found, req.params.id);
        //prepare newDevice body for the post
        let newDevice = oldDevice._doc;
        newDevice._id = req.body._id;
        newDevice.owner = req.user._id;
        //post
        const resultPost = await persistence.post(newDevice, Device, req.tenant);
        if (!!resultPost.errors) return errors.manage(res, errors.post_request_error, resultPost);
        req.resource=resultPost._doc;
        //delete
        try {
            const resultDelete = await persistence.delete(req.params.id, Device);
            if (!resultDelete) return errors.manage(res, errors.resource_not_found, req.params.id);
        }
        catch (err) {
            if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
            else return errors.manage(res, errors.delete_request_error, err);
        }        
    }
    return await controller.updateResource(req, res, fields, Device);
}
