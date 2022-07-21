const mongoose = require('mongoose'); 
const controller = require('./controller');
const checker = require('./checker');
const broker = require('../commons/broker');
const errors = require('../commons/errors.js');
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => { 
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const select = await checker.whatCanSee(req, res, Group);
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Group);
    const restrictions = {...restriction_1, ...restriction_2};
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Group, restrictions); 
};

exports.pipe = async (req, res) => { 
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const select = await checker.whatCanSee(req, res, Group);
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Group);
    const restrictions = {...restriction_1, ...restriction_2};
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Group, restrictions);
};

exports.getone = async (req, res) => { 
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const select = await checker.whatCanSee(req, res, Group);
    let result = await checker.isAvailable(req, res, Group); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Group); if (result != true) return result;
    return await controller.getResource(req, res, null, Group, select);
};

exports.getstream = async (ws, req) => { 
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    let result = await checker.isAvailable(req, ws, Group); if (result != true) return result;
    result = await checker.canRead(req, ws); if (result != true) return result;
    result = await checker.hasRights(req, ws, Group); if (result != true) return result;
    broker.subscribe('Group-' + req.resource._id, ws);
};

exports.post = async (req, res) => {
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    return await controller.postResource(req, res, Group);
};

exports.put = async (req, res) => { 
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const fields = ['tags','_id','description','visibility','users'];
    let result = await checker.isAvailable(req, res, Group); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Group); if (result != true) return result;
    if (req.body._id != null) {        
        //check post        
        let result = await checker.canCreate(req, res); if (result != true) return result;
        result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
        //check delete
        const User = mongoose.dbs[req.tenant.database].model('User');        
        result = await checker.isOwned(req, res); if (result != true) return result;             
        result = await checker.canDelete(req, res); if (result != true) return result;        
        //prepare id for the delete
        req.params.id = req.resource._id;
        //check getone               
        const select = await checker.whatCanSee(req, res, Group);       
        result = await checker.canRead(req, res); if (result != true) return result;        
        //get
        const oldGroup = await persistence.get(req.params.id, null, Group, select);
        if (!oldGroup) return errors.manage(res, errors.resource_not_found, req.params.id);
        //prepare newGroup body for the post
        let newGroup = oldGroup._doc;
        newGroup._id = req.body._id;
        newGroup.owner = req.user._id;
        //post
        const resultPost = await persistence.post(newGroup, Group, req.tenant);
        if (!!resultPost.errors) return errors.manage(res, errors.post_request_error, resultPost);
        req.resource=resultPost._doc;
        //delete
        try {
            const resultDelete = await persistence.delete(req.params.id, Group);
            if (!resultDelete) return errors.manage(res, errors.resource_not_found, req.params.id);
        }
        catch (err) {
            if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
            else return errors.manage(res, errors.delete_request_error, err);
        }        
    }
    return await controller.updateResource(req, res, fields, Group);
};   

exports.delete = async (req, res) => {
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const User = mongoose.dbs[req.tenant.database].model('User');
    let result = await checker.isAvailable(req, res, Group); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Group); if (result != true) return result;
    return await controller.deleteResource(req, res, Group);
};
