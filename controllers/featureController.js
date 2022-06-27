const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

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
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const fields = ['tags', '_id'];
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Feature); if (result != true) return result;
    if (req.body._id != null) {        
        //check post        
        let result = await checker.canCreate(req, res); if (result != true) return result;
        result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
        //check delete
        const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
        const Device = mongoose.dbs[req.tenant.database].model('Device');        
        result = await checker.isOwned(req, res); if (result != true) return result;
        result = await checker.isNotUsed(req, res, Measurement, 'feature'); if (result != true) return result;
        result = await checker.isNotUsed(req, res, Device, 'features'); if (result != true) return result;       
        //prepare id for the delete
        req.params.id = req.resource._id;
        //check getone
        const select = await checker.whatCanSee(req, res, Feature);        
        result = await checker.canRead(req, res); if (result != true) return result;
        //get
        const oldFeature = await persistence.get(req.params.id, null, Feature, select);
        if (!oldFeature) return errors.manage(res, errors.resource_not_found, req.params.id);
        //prepare newfeature body for the post
        let newFeature = oldFeature._doc;
        newFeature._id = req.body._id;
        newFeature.owner = req.user._id;
        //post
        const resultPost = await persistence.post(newFeature, Feature, req.tenant);
        if (!!resultPost.errors) return errors.manage(res, errors.post_request_error, resultPost);
        req.resource=resultPost._doc;
        //delete
        try {
            const resultDelete = await persistence.delete(req.params.id, Feature);
            if (!resultDelete) return errors.manage(res, errors.resource_not_found, req.params.id);
        }
        catch (err) {
            if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
            else return errors.manage(res, errors.delete_request_error, err);
        }        
    }
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
