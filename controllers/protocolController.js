const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

const persistence = require('../commons/persistence.js');
const { checkerIfExist } = require('../commons/dataset');

exports.get = async (req, res) => {
    const Protocol = mongoose.dbs[req.tenant.database].model('Protocol');
    const select = await checker.whatCanSee(req, res, Protocol);
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Protocol);
    const restrictions = { ...restriction_1, ...restriction_2 };
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Protocol, restrictions);
};

exports.pipe = async (req, res) => {
    const Protocol = mongoose.dbs[req.tenant.database].model('Protocol');
    const select = await checker.whatCanSee(req, res, Protocol);
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Protocol);
    const restrictions = { ...restriction_1, ...restriction_2 };
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Protocol, restrictions);
};

exports.getone = async (req, res) => {
    const Protocol = mongoose.dbs[req.tenant.database].model('Protocol');
    const select = await checker.whatCanSee(req, res, Protocol);
    let result = await checker.isAvailable(req, res, Protocol); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Protocol); if (result != true) return result;
    return await controller.getResource(req, res, null, Protocol, select);
};

exports.post = async (req, res) => {
    const Protocol = mongoose.dbs[req.tenant.database].model('Protocol');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    return await controller.postResource(req, res, Protocol);
};

exports.put = async (req, res) => {
    const Protocol = mongoose.dbs[req.tenant.database].model('Protocol');
    const fields = ['_id', 'description', 'metadata', 'topics', 'tags'];
    let result = await checker.isAvailable(req, res, Protocol); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Protocol); if (result != true) return result;
    /*
    if (req.body._id != null) {        
        //check post        
        let result = await checker.canCreate(req, res); if (result != true) return result;
        result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
        result = await checker.isOwned(req, res); if (result != true) return result;
        //check delete
        //const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
        //result = await checker.isNotUsed(req, res, Protocol, 'protocol'); if (result != true) return result;
        //prepare id for the delete
        req.params.id = req.resource._id;
        //check getone
        const select = await checker.whatCanSee(req, res, Protocol);        
        result = await checker.canRead(req, res); if (result != true) return result;
        //get
        const oldprotocol = await persistence.get(req.params.id, null, Protocol, select);
        if (!oldprotocol) return errors.manage(res, errors.resource_not_found, req.params.id);
        //prepare newprotocol body for the post
        let newProtocol = oldprotocol._doc;
        newProtocol._id = req.body._id;
        newProtocol.owner = req.user._id;
        //post
        const resultPost = await persistence.post(newProtocol, Protocol, req.tenant);
        if (!!resultPost.errors) return errors.manage(res, errors.post_request_error, resultPost);
        req.resource=resultPost._doc;
        //delete
        try {
            const resultDelete = await persistence.delete(req.params.id, Protocol);
            if (!resultDelete) return errors.manage(res, errors.resource_not_found, req.params.id);
        }
        catch (err) {
            if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
            else return errors.manage(res, errors.delete_request_error, err);
        }        
    }
    */
    return await controller.updateResource(req, res, fields, Protocol);
};

/*
exports.putMetadata = async (req, res) => {
    const Protocol = mongoose.dbs[req.tenant.database].model('Protocol');
    const fields = ['name', 'description', 'type'];
    let result = await checker.isAvailable(req, res, Protocol); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Protocol); if (result != true) return result;
    return await controller.updateEmbeddedResource(req, res, 'medatada', fields, Protocol)
};
*/

exports.delete = async (req, res) => {
    const Protocol = mongoose.dbs[req.tenant.database].model('Protocol');
    //const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    let result = await checker.isAvailable(req, res, Protocol); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    //result = await checker.isNotUsed(req, res, Experiment, 'protocol'); if (result != true) return result;
    result = await checker.hasRights(req, res, Protocol); if (result != true) return result;
    return await controller.deleteResource(req, res, Protocol);
};
