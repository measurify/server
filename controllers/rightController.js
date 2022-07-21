const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => { 
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const User = mongoose.dbs[req.tenant.database].model('User');
    const select = await checker.whatCanSee(req, res, Right);
    const restriction = await checker.whatCanRead(req, res);
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
    const fields = ['_id','tags'];
    let result = await checker.isAvailable(req, res, Right); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
   
    // if (req.body._id != null) {        
    //     //check post                        
    //     let result = await checker.canCreate(req, res); if (result != true) return result;        
    //     //check delete          
    //     result = await checker.canDelete(req, res); if (result != true) return result;
    //     //prepare id for the delete
    //     req.params.id = req.resource._id;
    //     //check getone                
    //     const select = await checker.whatCanSee(req, res, Right);        
    //     result = await checker.canRead(req, res); if (result != true) return result;       
    //     //get
    //     const oldRight = await persistence.get(req.params.id, null, Right, select);
    //     if (!oldRight) return errors.manage(res, errors.resource_not_found, req.params.id);
    //     //prepare newRight body for the post
    //     let newRight = oldRight._doc;
    //     if(newRight.type==="tags")newRight.type="Tag";
    //     if(newRight.type==="thing")newRight.type="Thing";
    //     if(newRight.type==="device")newRight.type="Device";
    //     if(newRight.type==="feature")newRight.type="Feature";
    //     newRight._id = req.body._id;
    //     newRight.owner = req.user._id;
    //     //delete
    //     try {
    //         const resultDelete = await persistence.delete(req.params.id, Right);
    //         if (!resultDelete) return errors.manage(res, errors.resource_not_found, req.params.id);
    //     }
    //     catch (err) {
    //         if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
    //         else return errors.manage(res, errors.delete_request_error, err);
    //     }   
    //     //post
    //     const resultPost = await persistence.post(newRight, Right, req.tenant);
    //     if (!!resultPost.errors) return errors.manage(res, errors.post_request_error, resultPost);
    //     req.resource=resultPost._doc;             
    // }
    return await controller.updateResource(req, res, fields, Right);
}

exports.delete = async (req, res) => {
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    let result = await checker.isAvailable(req, res, Right); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Right);
};