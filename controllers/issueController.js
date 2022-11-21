const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const IssueTypes = require('../types/issueTypes');
const IssueStatusTypes = require('../types/issueStatusTypes');

exports.get = async (req, res) => { 
    const Issue = mongoose.dbs[req.tenant.database].model('Issue');
    const select = await checker.whatCanSee(req, res, Issue);
    const restriction = await checker.readJustOwned(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Issue, restriction); 
};

exports.getone = async (req, res) => { 
    const Issue = mongoose.dbs[req.tenant.database].model('Issue');
    let result = await checker.isAvailable(req, res, Issue); if (result != true) return result;
    //result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.canOperate(req, res,"Issue"); if (result != true) return result;
    return await controller.getResource(req, res, null, Issue); 
};

exports.post = async (req, res) => {
    const Issue = mongoose.dbs[req.tenant.database].model('Issue');
    return await controller.postResource(req, res, Issue);
};

exports.getTypes = async (req, res) => {
    return res.status(200).json(IssueTypes);
};

exports.getStatusTypes = async (req, res) => {
    return res.status(200).json(IssueStatusTypes);
};

exports.put = async (req, res) => { 
    const Issue = mongoose.dbs[req.tenant.database].model('Issue');
    const fields = ['status' ];
    let result = await checker.isAvailable(req, res, Issue); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isValid(req, res, IssueStatusTypes, 'status'); if (result != true) return result;
    //result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.canOperate(req, res,"Issue"); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Issue);
}

exports.delete = async (req, res) => {
    const Issue = mongoose.dbs[req.tenant.database].model('Issue');
    let result = await checker.isAvailable(req, res, Issue); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Issue);
};
