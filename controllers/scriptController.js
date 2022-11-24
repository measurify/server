const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => { 
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const select = await checker.whatCanSee(req, res, Script);
    const restriction = await checker.whatCanOperate(req, res,"Script");
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Script, restriction); 
};

exports.pipe = async (req, res) => { 
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const select = await checker.whatCanSee(req, res, Script);
    const restriction = await checker.whatCanOperate(req, res,"Script");
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Script, restriction);
};

exports.getone = async (req, res) => {
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const select = await checker.whatCanSee(req, res, Script);
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;    
    result = await checker.canOperate(req, res,"Script"); if (result != true) return result;
    return await controller.getResource(req, res, null, Script, select);
};

exports.post = async (req, res) => {
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    let result = await checker.canOperate(req, res,"Script"); if (result != true) return result;
    return await controller.postResource(req, res, Script);
};

exports.put = async (req, res) => { 
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const fields = ['_id','code','tags', 'visibility'];
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isValid(req, res, VisibilityTypes, 'visibility'); if (result != true) return result;
    result = await checker.canOperate(req, res,"Script"); if (result != true) return result;
    if(req.body._id) result = await checker.isNotUsed(req, res, Device, 'scripts'); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Script);
}

exports.delete = async (req, res) => {
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'scripts'); if (result != true) return result;
    result = await checker.canOperate(req, res,"Script"); if (result != true) return result;
    return await controller.deleteResource(req, res, Script);
};


