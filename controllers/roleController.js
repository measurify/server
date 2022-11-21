const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => { 
    const Role = mongoose.dbs[req.tenant.database].model('Role');
    const select = await checker.whatCanSee(req, res, Role);
    //const restriction_1 = await checker.whatCanRead(req, res);    
    const restriction_1 = await checker.whatCanOperate(req, res,"Role");
    const restriction_2 = await checker.whichRights(req, res, Role);
    const restrictions = {...restriction_1, ...restriction_2};
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Role, restrictions);
};

exports.pipe = async (req, res) => { 
    const Role = mongoose.dbs[req.tenant.database].model('Role');
    const select = await checker.whatCanSee(req, res, Role);
    //const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_1 = await checker.whatCanOperate(req, res,"Role");
    const restriction_2 = await checker.whichRights(req, res, Role);
    const restrictions = {...restriction_1, ...restriction_2};
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Role, restrictions);
};

exports.getone = async (req, res) => { 
    const Role = mongoose.dbs[req.tenant.database].model('Role');
    const select = await checker.whatCanSee(req, res, Role);
    let result = await checker.isAvailable(req, res, Role); if (result != true) return result;
    //result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.canOperate(req, res,"Role"); if (result != true) return result;
    result = await checker.hasRights(req, res, Role); if (result != true) return result;
    return await controller.getResource(req, res, null, Role, select);
};

exports.post = async (req, res) => {
    const Role = mongoose.dbs[req.tenant.database].model('Role');
    //let result = await checker.canCreate(req, res); if (result != true) return result;
    let result = await checker.canOperate(req, res,"Role"); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    return await controller.postResource(req, res, Role);
};

exports.put = async (req, res) => { 
    const Role = mongoose.dbs[req.tenant.database].model('Role');
    const User = mongoose.dbs[req.tenant.database].model('User');
    const fields = ['default', 'actions','description'];
    let result = await checker.isAvailable(req, res, Role); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isNotUsed(req, res, User, 'type'); if (result != true) return result; 
    return await controller.updateResource(req, res, fields, Role);
};  

exports.delete = async (req, res) => {
    const User = mongoose.dbs[req.tenant.database].model('User');
    const Role = mongoose.dbs[req.tenant.database].model('Role');
    let result = await checker.isAvailable(req, res, Role); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, User, 'type'); if (result != true) return result; 
    return await controller.deleteResource(req, res, Role);
};