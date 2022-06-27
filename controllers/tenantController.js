const mongoose = require('mongoose'); 
const controller = require('./controller');
const checker = require('./checker');
const errors = require('../commons/errors.js');
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => { 
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', null, Tenant, null); 
};

exports.getone = async (req, res) => { 
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    let result = await checker.isAvailable(req, res, Tenant); if (result != true) return result;
    return await controller.getResource(req, res, null, Tenant, null);
};

exports.post = async (req, res) => {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    return await controller.postResource(req, res, Tenant);
};

exports.put = async (req, res) => { 
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    const fields = ['_id','organization', 'address', 'email', 'phone']
    let result = await checker.isAvailable(req, res, Tenant); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    if (req.body._id != null) {        
        //check post                
        //check delete 
        //prepare id for the delete
        req.params.id = req.resource._id;
        //check getone    
        //get
        const oldTenant = await persistence.get(req.params.id, null, Tenant, null);
        if (!oldTenant) return errors.manage(res, errors.resource_not_found, req.params.id);
        //prepare newTenant body for the post
        let newTenant = oldTenant._doc;
        newTenant._id = req.body._id;
        newTenant.owner = req.user._id;
        //post
        const resultPost = await persistence.post(newTenant, Tenant, req.tenant);
        if (!!resultPost.errors) return errors.manage(res, errors.post_request_error, resultPost);
        req.resource=resultPost._doc;
        //delete
        try {
            const resultDelete = await persistence.delete(req.params.id, Tenant);
            if (!resultDelete) return errors.manage(res, errors.resource_not_found, req.params.id);
        }
        catch (err) {
            if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
            else return errors.manage(res, errors.delete_request_error, err);
        }        
    }
    return await controller.updateResource(req, res, fields, Tenant);
};   

exports.delete = async (req, res) => {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    let result = await checker.isAvailable(req, res, Tenant); if (result != true) return result;
    return await controller.deleteResource(req, res, Tenant);
};
