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
    const restriction = await checker.whatCanRead(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Script, restriction); 
};

exports.pipe = async (req, res) => { 
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const select = await checker.whatCanSee(req, res, Script);
    const restriction = await checker.whatCanRead(req, res);
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Script, restriction);
};

exports.getone = async (req, res) => {
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const select = await checker.whatCanSee(req, res, Script);
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result; 
    return await controller.getResource(req, res, null, Script, select);
};

exports.post = async (req, res) => {
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    return await controller.postResource(req, res, Script);
};

exports.put = async (req, res) => { 
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const fields = ['_id','code','tags', 'visibility'];
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isValid(req, res, VisibilityTypes, 'visibility'); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    if (req.body._id != null) {        
        //check post
        let result = await checker.canCreate(req, res); if (result != true) return result;     
        //check delete                 
        const Device = mongoose.dbs[req.tenant.database].model('Device');        
        result = await checker.isNotUsed(req, res, Device, 'scripts'); if (result != true) return result;
        result = await checker.canDelete(req, res); if (result != true) return result;
        //prepare id for the delete
        req.params.id = req.resource._id;
        //check getone    
        const select = await checker.whatCanSee(req, res, Script);    
        result = await checker.canRead(req, res); if (result != true) return result;     
        //get
        const oldScript = await persistence.get(req.params.id, null, Script, select);
        if (!oldScript) return errors.manage(res, errors.resource_not_found, req.params.id);
        //prepare newScript body for the post
        let newScript = oldScript._doc;
        newScript._id = req.body._id;
        newScript.owner = req.user._id;
        //post
        const resultPost = await persistence.post(newScript, Script, req.tenant);
        if (!!resultPost.errors) return errors.manage(res, errors.post_request_error, resultPost);
        req.resource=resultPost._doc;
        //delete
        try {
            const resultDelete = await persistence.delete(req.params.id, Script);
            if (!resultDelete) return errors.manage(res, errors.resource_not_found, req.params.id);
        }
        catch (err) {
            if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
            else return errors.manage(res, errors.delete_request_error, err);
        }        
    }
    return await controller.updateResource(req, res, fields, Script);
}

exports.delete = async (req, res) => {
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'scripts'); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Script);
};


