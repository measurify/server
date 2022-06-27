const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => { 
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const select = await checker.whatCanSee(req, res, Tag)
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Tag);
    const restrictions = {...restriction_1, ...restriction_2};
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Tag, restrictions);
};

exports.pipe = async (req, res) => { 
    const select = await checker.whatCanSee(req, res, Tag)
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Tag);
    const restrictions = {...restriction_1, ...restriction_2};
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Tag, restrictions);
};

exports.getone = async (req, res) => { 
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const select = await checker.whatCanSee(req, res, Tag)
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Tag); if (result != true) return result;
    return await controller.getResource(req, res, null, Tag, select);
};

exports.post = async (req, res) => {
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    return await controller.postResource(req, res, Tag);
};

exports.put = async (req, res) => { 
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const fields = ['_id','visibility', 'tags', 'description'];
    let result = await checker.isAvailable(req, res, Tag); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Tag); if (result != true) return result;
    result = await checker.isValid(req, res, VisibilityTypes, 'visibility'); if (result != true) return result;
    if (req.body._id != null) {        
        //check post        
        let result = await checker.canCreate(req, res); if (result != true) return result;
        result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;   
        //check delete                 
        const Device = mongoose.dbs[req.tenant.database].model('Device');
        const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
        const Feature = mongoose.dbs[req.tenant.database].model('Feature');
        const Thing = mongoose.dbs[req.tenant.database].model('Thing');        
        result = await checker.isNotUsed(req, res, Device, 'tags'); if (result != true) return result;
        result = await checker.isNotUsed(req, res, Measurement, 'tags'); if (result != true) return result;
        result = await checker.isNotUsed(req, res, Feature, 'tags'); if (result != true) return result;
        result = await checker.isNotUsed(req, res, Thing, 'tags'); if (result != true) return result;
        result = await checker.isNotUsed(req, res, Tag, 'tags'); if (result != true) return result;
        result = await checker.canDelete(req, res); if (result != true) return result;        
        //prepare id for the delete
        req.params.id = req.resource._id;
        //check getone    
        const select = await checker.whatCanSee(req, res, Tag);        
        result = await checker.canRead(req, res); if (result != true) return result;
        //get
        const oldTag = await persistence.get(req.params.id, null, Tag, select);
        if (!oldTag) return errors.manage(res, errors.resource_not_found, req.params.id);
        //prepare newTag body for the post
        let newTag = oldTag._doc;
        newTag._id = req.body._id;
        newTag.owner = req.user._id;
        //post
        const resultPost = await persistence.post(newTag, Tag, req.tenant);
        if (!!resultPost.errors) return errors.manage(res, errors.post_request_error, resultPost);
        req.resource=resultPost._doc;
        //delete
        try {
            const resultDelete = await persistence.delete(req.params.id, Tag);
            if (!resultDelete) return errors.manage(res, errors.resource_not_found, req.params.id);
        }
        catch (err) {
            if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
            else return errors.manage(res, errors.delete_request_error, err);
        }        
    }
    return await controller.updateResource(req, res, fields, Tag);
};

exports.delete = async (req, res) => {
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
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

