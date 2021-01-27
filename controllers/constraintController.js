const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const ObjectId = require('mongoose').Types.ObjectId;
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const Constraint = mongoose.dbs[req.tenant.database].model('Constraint');
    const select = await checker.whatCanSee(req, res, Constraint)
    const restriction = await checker.whatCanRead(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Constraint, restriction); 
};

exports.pipe = async (req, res) => { 
    const select = await checker.whatCanSee(req, res, Constraint)
    const restriction = await checker.whatCanRead(req, res);
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Constraint, restriction);
};

exports.getone = async (req, res) => { 
    const Constraint = mongoose.dbs[req.tenant.database].model('Constraint');
    const select = await checker.whatCanSee(req, res, Constraint)
    let result = await checker.isAvailable(req, res, Constraint); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return await controller.getResource(req, res, null, Constraint, select); 
};

exports.post = async (req, res) => {
    const Constraint = mongoose.dbs[req.tenant.database].model('Constraint');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    return await controller.postResource(req, res, Constraint);
};

exports.put = async (req, res) => { 
    const Constraint = mongoose.dbs[req.tenant.database].model('Constraint');
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Constraint); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Constraint);
}; 

exports.delete = async (req, res) => {
    const Constraint = mongoose.dbs[req.tenant.database].model('Constraint');
    let result = await checker.isAvailable(req, res, Constraint); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Constraint);
};

