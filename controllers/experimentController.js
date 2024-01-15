const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const persistence = require('../commons/persistence.js');
const conversion = require("../commons/conversion.js");

exports.get = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const select = await checker.whatCanSee(req, res, Experiment);
    delete select['owner'];
    const restriction_1 = await checker.whatCanOperate(req, res,"Experiment");
    const restriction_2 = await checker.whichRights(req, res, Experiment);
    const restrictions = { ...restriction_1, ...restriction_2 };
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Experiment, restrictions);
};

exports.pipe = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const select = await checker.whatCanSee(req, res, Experiment);
    const restriction_1 = await checker.whatCanOperate(req, res,"Experiment");
    const restriction_2 = await checker.whichRights(req, res, Experiment);
    const restrictions = { ...restriction_1, ...restriction_2 };
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Experiment, restrictions);
};

exports.getone = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const select = await checker.whatCanSee(req, res, Experiment);
    let result = await checker.isAvailable(req, res, Experiment); if (result != true) return result;
    result = await checker.canOperate(req, res,"Experiment"); if (result != true) return result;
    result = await checker.hasRights(req, res, Experiment); if (result != true) return result;
    return await controller.getResource(req, res, null, Experiment, select);
};

exports.gethistory = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const Protocol = mongoose.dbs[req.tenant.database].model('Protocol');
    const select = await checker.whatCanSee(req, res, Experiment);
    let result = await checker.isAvailable(req, res, Experiment); if (result != true) return result;
    result = await checker.canOperate(req, res,"Experiment"); if (result != true) return result;
    result = await checker.hasRights(req, res, Experiment); if (result != true) return result;
    const experiment = await persistence.get(req.params.id, null, Experiment, select);
    if (!experiment) return errors.manage(res, errors.resource_not_found, req.params.id);
    const protocol = await persistence.get(experiment._doc.protocol, null, Protocol, select);
    if (!protocol) return errors.manage(res, errors.resource_not_found, req.params.id);
    item = conversion.json2CSVHistory(experiment._doc. history,protocol._doc);    
    let error=null;[item, error] = conversion.replaceSeparatorsGet(item, req.query,res); if (error !== null) return error;
    return res.status(200).json(item);
};

exports.getgroup = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const Protocol = mongoose.dbs[req.tenant.database].model('Protocol');
    const select = await checker.whatCanSee(req, res, Experiment);
    let result = await checker.isAvailable(req, res, Experiment); if (result != true) return result;
    result = await checker.canOperate(req, res,"Experiment"); if (result != true) return result;
    result = await checker.hasRights(req, res, Experiment); if (result != true) return result;
    const experiment = await persistence.get(req.params.id, null, Experiment, select);
    if (!experiment) return errors.manage(res, errors.resource_not_found, req.params.id);
    const protocol = await persistence.get(experiment._doc.protocol, null, Protocol, select);
    if (!protocol) return errors.manage(res, errors.resource_not_found, req.params.id);
    let error=null;[body,error] = conversion.getGroups(experiment._doc,protocol._doc,req.query);if (error !== null) return error;
    return res.status(200).json(body);
};

exports.post = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    let result = await checker.canOperate(req, res,"Experiment"); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    return await controller.postResource(req, res, Experiment);
};

exports.put = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    const fields = ['_id', 'description', 'state', 'startDate', 'endDate', 'location', 'protocol', 'metadata', 'history', 'tags', 'visibility'];
    let result = await checker.isAvailable(req, res, Experiment); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canOperate(req, res,"Experiment"); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'experiment'); if (result != true) return result;
    result = await checker.hasRights(req, res, Experiment); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Experiment);
};

exports.delete = async (req, res) => {
    const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    let result = await checker.isAvailable(req, res, Experiment); if (result != true) return result;
    result = await checker.canOperate(req, res,"Experiment"); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'experiment'); if (result != true) return result;
    result = await checker.hasRights(req, res, Experiment); if (result != true) return result;
    return await controller.deleteResource(req, res, Experiment);
};

exports.getAggregates = async (req, res) => {
    try{
        const Experiment = mongoose.dbs[req.tenant.database].model('Experiment');
        let select = await checker.whatCanSee(req, res, Experiment);
        const restriction_1 = await checker.whatCanOperate(req, res,"Experiment");
        const restriction_2 = await checker.whichRights(req, res, Experiment);
        const restrictions = { ...restriction_1, ...restriction_2 };
        let sort = '{ "timestamp": "desc" }';    
        const query = req.query;
        if (!query.sort) query.sort = sort;
        if (!query.filter) query.filter = '{}';
        query.select ='["_id","history","protocol"]'
        select = prepareSelect(select, query.select);
        if (!query.page) query.page = 1;                       
        query.limit = await Experiment.countDocuments(query.filter);
        let list = JSON.stringify(await persistence.getList(query.filter, query.sort, select, query.page, query.limit, restrictions, Experiment));
        let result = await conversion.aggregateHistories(list);
        let protocolName = JSON.parse(list)["docs"][0]["protocol"];
        if(query.groups)result=await conversion.toGroups(req,result,protocolName);
        return res.status(200).json(result);
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
};

//local function
const prepareSelect = function (select, querySelect) {
    try {
        querySelect=JSON.parse(querySelect);
    } catch (e) {
        return select;
    }
    let object={};
    querySelect.map((key) => {
        if (select[key] === undefined) object[key] = true;
    });
    if(Object.keys(object).length!=0)return object;
    return select;
}

