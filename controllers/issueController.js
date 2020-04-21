const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Issue = mongoose.model('Issue');
const IssueTypes = require('../types/issueTypes');

exports.get = async (req, res) => { 
    const select = await checker.whatCanSee(req, res, Issue)
    const restriction = await checker.readJustOwned(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Issue, restriction); 
};

exports.post = async (req, res) => {
    return await controller.postResource(req, res, Issue);
};

exports.getTypes = async (req, res) => {
    return res.status(200).json(IssueTypes);
};
