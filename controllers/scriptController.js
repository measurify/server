const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    const Script = mongoose.dbs[req.tenant._id].model('Script');
    const select = await checker.whatCanSee(req, res, Script)
    const restriction = await checker.whatCanRead(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Script, restriction); 
};

exports.pipe = async (req, res) => { 
    const select = await checker.whatCanSee(req, res, Script)
    const restriction = await checker.whatCanRead(req, res);
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Script, restrictions);
};

exports.getone = async (req, res) => {
    const Script = mongoose.dbs[req.tenant._id].model('Script');
    const select = await checker.whatCanSee(req, res, Script)
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result; 
    return await controller.getResource(req, res, null, Script, select);
};

exports.post = async (req, res) => {
    const Script = mongoose.dbs[req.tenant._id].model('Script');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    return await controller.postResource(req, res, Script);
};

exports.put = async (req, res) => { 
    const Script = mongoose.dbs[req.tenant._id].model('Script');
    const fields = ['code','tags'];
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Script);
}

exports.delete = async (req, res) => {
    const Script = mongoose.dbs[req.tenant._id].model('Script');
    const Device = mongoose.dbs[req.tenant._id].model('Device');
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'scripts'); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Script);
};


