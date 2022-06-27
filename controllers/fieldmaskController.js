const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const bcrypt = require('bcryptjs');
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => { 
    const Fieldmask = mongoose.dbs[req.tenant.database].model('Fieldmask');
    const select = await checker.whatCanSee(req, res, Fieldmask)
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Fieldmask); 
};

exports.pipe = async (req, res) => { 
    const select = await checker.whatCanSee(req, res, Feature)
    const result = await checker.isAdminitrator(req, res); if (result != true) return result;
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Fieldmask);
};

exports.getone = async (req, res) => {
    const Fieldmask = mongoose.dbs[req.tenant.database].model('Fieldmask');
    const select = await checker.whatCanSee(req, res, Fieldmask)
    let result = await checker.isAvailable(req, res, Fieldmask); if (result != true) return result;
    return await controller.getResource(req, res, null, Fieldmask, select);
};

exports.post = async (req, res) => {
    const Fieldmask = mongoose.dbs[req.tenant.database].model('Fieldmask');
    let result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.postResource(req, res, Fieldmask);
};

exports.put = async (req, res) => { 
    const Fieldmask = mongoose.dbs[req.tenant.database].model('Fieldmask');
    const fields = ['_id','computation_fields', 'device_fields', 'feature_fields', 'measurement_fields', 'script_fields', 'tag_fields', 'thing_fields' ];
    let result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isAvailable(req, res, Fieldmask); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    if (req.body._id != null) {        
        //check post        
        let result = await checker.isAdminitrator(req, res); if (result != true) return result;
        //check delete        
        const User = mongoose.dbs[req.tenant.database].model('User');
        result = await checker.isNotUsed(req, res, User, 'fieldmask'); if (result != true) return result;
        //prepare id for the delete
        req.params.id = req.resource._id;
        //check getone        
        const select = await checker.whatCanSee(req, res, Fieldmask);        
        //get
        const oldFieldmask = await persistence.get(req.params.id, null, Fieldmask, select);
        if (!oldFieldmask) return errors.manage(res, errors.resource_not_found, req.params.id);
        //prepare newFieldmask body for the post
        let newFieldmask = oldFieldmask._doc;
        newFieldmask._id = req.body._id;
        newFieldmask.owner = req.user._id;
        //post
        const resultPost = await persistence.post(newFieldmask, Fieldmask, req.tenant);
        if (!!resultPost.errors) return errors.manage(res, errors.post_request_error, resultPost);
        req.resource=resultPost._doc;
        //delete
        try {
            const resultDelete = await persistence.delete(req.params.id, Fieldmask);
            if (!resultDelete) return errors.manage(res, errors.resource_not_found, req.params.id);
        }
        catch (err) {
            if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
            else return errors.manage(res, errors.delete_request_error, err);
        }        
    }
    return await controller.updateResource(req, res, fields, Fieldmask);
};  

exports.delete = async (req, res) => {
    const Fieldmask = mongoose.dbs[req.tenant.database].model('Fieldmask');
    const User = mongoose.dbs[req.tenant.database].model('User');
    let result = await checker.isAvailable(req, res, Fieldmask); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, User, 'fieldmask'); if (result != true) return result;
    return await controller.deleteResource(req, res, Fieldmask);
};

