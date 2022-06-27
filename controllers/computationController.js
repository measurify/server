const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const errors = require('../commons/errors.js');
const runner = require('../computations/runner.js'); 
const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => { 
    const Computation = mongoose.dbs[req.tenant.database].model('Computation');
    const select = await checker.whatCanSee(req, res, Computation);
    const restriction = await checker.whatCanRead(req, res);
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Computation, restriction); 
};

exports.pipe = async (req, res) => { 
    const Computation = mongoose.dbs[req.tenant.database].model('Computation');
    const select = await checker.whatCanSee(req, res, Computation);
    const restriction = await checker.whatCanRead(req, res);
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Computation, restriction);
};

exports.getone = async (req, res) => { 
    const Computation = mongoose.dbs[req.tenant.database].model('Computation');
    const select = await checker.whatCanSee(req, res, Computation);
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    return await controller.getResource(req, res, null, Computation, select); 
};

exports.post = async (req, res) => {
    const Computation = mongoose.dbs[req.tenant.database].model('Computation');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['feature','tags']); if (result != true) return result;
    const answer = await controller.postResource(req, res, Computation);
    if(req.result) runner.go(req.result, req.user, req.tenant);
    return answer;
};

exports.put = async (req, res) => { 
    const Computation = mongoose.dbs[req.tenant.database].model('Computation');
    const fields = ['tags','_id'];
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    if (req.body._id != null) {        
        //check post        
        let result = await checker.canCreate(req, res); if (result != true) return result;
        result = await checker.hasRightsToCreate(req, res, ['feature','tags']); if (result != true) return result;
        //check delete
        result = await checker.canDelete(req, res); if (result != true) return result;     
        //prepare id for the delete
        req.params.id = req.resource._id;
        //check getone
        const select = await checker.whatCanSee(req, res, Computation);        
        result = await checker.canRead(req, res); if (result != true) return result;
        //get
        const oldComputation = await persistence.get(req.params.id, null, Computation, select);
        if (!oldComputation) return errors.manage(res, errors.resource_not_found, req.params.id);
        //prepare newComputation body for the post
        let newComputation = oldComputation._doc;
        newComputation._id = req.body._id;
        newComputation.owner = req.user._id;
        //post
        const resultPost = await persistence.post(newComputation, Computation, req.tenant);
        if (!!resultPost.errors) return errors.manage(res, errors.post_request_error, resultPost);
        req.resource=resultPost._doc;
        //delete
        try {
            const resultDelete = await persistence.delete(req.params.id, Computation);
            if (!resultDelete) return errors.manage(res, errors.resource_not_found, req.params.id);
        }
        catch (err) {
            if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
            else return errors.manage(res, errors.delete_request_error, err);
        }        
    }
    return await controller.updateResource(req, res, fields, Computation);
};

exports.delete = async (req, res) => {
    const Computation = mongoose.dbs[req.tenant.database].model('Computation');
    let result = await checker.isAvailable(req, res, Computation); if (result != true) return result;
    result = await checker.canDelete(req, res); if (result != true) return result;
    return await controller.deleteResource(req, res, Computation);
}
