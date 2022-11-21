const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => { 
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const User = mongoose.dbs[req.tenant.database].model('User');
    const select = await checker.whatCanSee(req, res, Right);
    //const restriction = await checker.whatCanRead(req, res);
    const restriction = await checker.whatCanOperate(req, res,"Right");
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Right, restriction);
};

exports.getone = async (req, res) => { 
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const select = await checker.whatCanSee(req, res, Right);
    let result = await checker.isAvailable(req, res, Right); if (result != true) return result;
    //result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.canOperate(req, res,"Right"); if (result != true) return result;
    return await controller.getResource(req, res, null, Right, select); 
};

exports.post = async (req, res) => {
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const User = mongoose.dbs[req.tenant.database].model('User');
    //let result = await checker.canCreate(req, res); if (result != true) return result;    
    let result = await checker.canOperate(req, res,"Right"); if (result != true) return result;
    if(!mongoose.Types.ObjectId.isValid(req.body.user)) { 
        const user = await User.findOne({username: req.body.user}); 
        if(user) req.body.user = user._id; 
    }
    return await controller.postResource(req, res, Right);
};

exports.put = async (req, res) => { 
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const fields = ['_id','tags'];
    let result = await checker.isAvailable(req, res, Right); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Right);
}

exports.delete = async (req, res) => {
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    let result = await checker.isAvailable(req, res, Right); if (result != true) return result;
    //result = await checker.canDelete(req, res); if (result != true) return result;    
    //result = await checker.isAdminitrator(req, res); if (result != true) return result;(?)
    result = await checker.isOwned(req, res); if (result != true) return result;
    //result = await checker.canOperate(req, res,"Right"); if (result != true) return result;
    return await controller.deleteResource(req, res, Right);
};