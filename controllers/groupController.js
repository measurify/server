const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const broker = require('../commons/broker');
const errors = require('../commons/errors.js');
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => {
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const select = await checker.whatCanSee(req, res, Group);
    const restriction_1 = await checker.whatCanOperate(req, res,"Group");
    const restriction_2 = await checker.whichRights(req, res, Group);
    const restrictions = { ...restriction_1, ...restriction_2 };
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Group, restrictions);
};

exports.pipe = async (req, res) => {
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const select = await checker.whatCanSee(req, res, Group);
    const restriction_1 = await checker.whatCanOperate(req, res,"Group");
    const restriction_2 = await checker.whichRights(req, res, Group);
    const restrictions = { ...restriction_1, ...restriction_2 };
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Group, restrictions);
};

exports.getone = async (req, res) => {
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const select = await checker.whatCanSee(req, res, Group);
    let result = await checker.isAvailable(req, res, Group); if (result != true) return result;
    result = await checker.canOperate(req, res,"Group"); if (result != true) return result;
    result = await checker.hasRights(req, res, Group); if (result != true) return result;
    return await controller.getResource(req, res, null, Group, select);
};

exports.getstream = async (ws, req) => {
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    let result = await checker.isAvailable(req, ws, Group); if (result != true) return result;
    result = await checker.canOperate(req, ws,"Group"); if (result != true) return result;
    result = await checker.hasRights(req, ws, Group); if (result != true) return result;
    broker.subscribe('Group-' + req.resource._id, ws);
};

exports.post = async (req, res) => {
    const Group = mongoose.dbs[req.tenant.database].model('Group');    
    let result = await checker.canOperate(req, res,"Group"); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    if (req.body.users)req.body.users = await checker.changeUsernameWithId(req,req.body.users);    
    return await controller.postResource(req, res, Group);
};

exports.put = async (req, res) => {
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    const fields = ['tags', '_id', 'description', 'visibility', 'users'];
    let result = await checker.isAvailable(req, res, Group); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canOperate(req, res,"Group"); if (result != true) return result;
    result = await checker.hasRights(req, res, Group); if (result != true) return result;
    if (req.body.users&&req.body.users.add)req.body.users.add = await checker.changeUsernameWithId(req,req.body.users.add);  
    if (req.body.users&&req.body.users.remove)req.body.users.remove = await checker.changeUsernameWithId(req,req.body.users.remove);  
    return await controller.updateResource(req, res, fields, Group);
};

exports.delete = async (req, res) => {
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    let result = await checker.isAvailable(req, res, Group); if (result != true) return result;
    result = await checker.canOperate(req, res,"Group"); if (result != true) return result;
    result = await checker.hasRights(req, res, Group); if (result != true) return result;
    return await controller.deleteResource(req, res, Group);
};
