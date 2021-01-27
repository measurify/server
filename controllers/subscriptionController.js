const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');

exports.get = async (req, res) => { 
    const Subscription = mongoose.dbs[req.tenant.database].model('Subscription');
    const select = await checker.whatCanSee(req, res, Subscription)
    const restriction = await checker.whatCanRead(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Subscription, restriction); 
};

exports.pipe = async (req, res) => { 
    const select = await checker.whatCanSee(req, res, Subscription)
    const restriction = await checker.whatCanRead(req, res);
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Subscription, restrictions);
};

exports.getone = async (req, res) => {
    const Subscription = mongoose.dbs[req.tenant.database].model('Subscription');
    const select = await checker.whatCanSee(req, res, Subscription)
    let result = await checker.isAvailable(req, res, Subscription); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result; 
    return await controller.getResource(req, res, null, Subscription, select);
};

exports.post = async (req, res) => {
    const Subscription = mongoose.dbs[req.tenant.database].model('Subscription');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['thing', 'device']); if (result != true) return result;
    return await controller.postResource(req, res, Subscription);
};

exports.put = async (req, res) => { 
    const Subscription = mongoose.dbs[req.tenant.database].model('Subscription');
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Subscription); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Subscription);
}

exports.delete = async (req, res) => {
    const Subscription = mongoose.dbs[req.tenant.database].model('Subscription');
    let result = await checker.isAvailable(req, res, Subscription); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Subscription);
};


