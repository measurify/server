const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');

exports.get = async (req, res) => { 
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const User = mongoose.dbs[req.tenant.database].model('User');
    const select = await checker.whatCanSee(req, res, Right)
    const restriction = await checker.whatCanRead(req, res);
    if (req.query.hasOwnProperty('filter') ) { // Franz
        const json = JSON.parse(req.query.filter) 
        if(!mongoose.Types.ObjectId.isValid(json.user)) { 
            const user = await User.findOne({username: json.user}); 
            if(user) {
                json.user = user._id;
                req.query.filter = JSON.stringify(json)
            }
        }
    }
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Right, restriction);
};

exports.getone = async (req, res) => { 
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const select = await checker.whatCanSee(req, res, Right);
    let result = await checker.isAvailable(req, res, Right); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return await controller.getResource(req, res, null, Right, select); 
};

exports.post = async (req, res) => {
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const User = mongoose.dbs[req.tenant.database].model('User');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    if(!mongoose.Types.ObjectId.isValid(req.body.user)) { 
        const user = await User.findOne({username: req.body.user}); 
        if(user) req.body.user = user._id; 
    }
    return await controller.postResource(req, res, Right);
};

exports.put = async (req, res) => { 
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const fields = ['tags'];
    let result = await checker.isAvailable(req, res, Right); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Right);
}

exports.delete = async (req, res) => {
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    let result = await checker.isAvailable(req, res, Right); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Right);
};