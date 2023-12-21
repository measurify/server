const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const errors = require('../commons/errors.js');
const persistence = require('../commons/persistence.js');
const dataset = require('../commons/dataset.js');

exports.get = async (req, res) => {
    const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
    const select = await checker.whatCanSee(req, res, Measurement);
    const restriction_1 = await checker.whatCanOperate(req, res, "Measurement");
    const restriction_2 = await checker.whichRights(req, res, Measurement);
    const restrictions = { ...restriction_1, ...restriction_2 };
    return await controller.getResourceDataset(req, res, '{ "timestamp": "desc" }', select, Measurement, restrictions);
};

exports.post = async (req, res, next, fileData, descriptionData, filename) => {
    //prepare an object semplified for next steps
    let result;
    [descriptionData, result] = await dataset.checkDescriptionIntegrity(res, descriptionData);
    if (result != true) return result;
    //create report    
    let report = { completed: [], errors: [] };

    //csv unrolling and control
    //control number of element in the description    
    const elementsNumber = await dataset.elementsCount(descriptionData);

    fileData = fileData.replace(/\r\n/g,"\n").replace(/\r/g,"\n")//.replace(/['"]+/g, "");
    var lines = fileData.split("\n");

    //check for force save object on database by default value if it is false or undefined
    let force = req.query && req.query.force == 'true' ? true : false;

    //check if the first line of the csv is the header of the file, default is true because csv needs header
    let header = req.query && req.query.header == 'false' ? false : true;


    let resourceDataupload = null;
    [result, resourceDataupload] = await dataset.datauploadCheckAndCreate(req, res, descriptionData, filename, fileData);
    if (result != true) return result;

    result = await dataset.createTag(req, res, filename);
    if (result != true) return result;

    //set the owner
    if (req.user._id) req.body.owner = req.user._id;
    //principal loop for each line
    let error=null;
    [report, error] = await dataset.dataUpload(req, res, lines, elementsNumber, report, descriptionData, filename, force, header, true);
    if (error != null) return error;
    //console.log(report);

    result = await dataset.updateDataupload(req, res, report, resourceDataupload);
    if (result != true) return result;

    if (report.errors.length === 0) {
        return res.status(200).json(report);
    }
    else {
        return res.status(202).json(report);
    }
};

exports.delete = async (req, res) => {
    const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    let result = await checker.isAvailable(req, res, Dataupload); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.canOperate(req, res, "Measurement"); if (result != true) return result;
    result = await checker.hasRights(req, res, Dataupload); if (result != true) return result;
    result = await checker.canDeleteMeasurementList(req, res, "Measurement"); if (result != true) return result;
    const restriction_1 = await checker.whatCanOperate(req, res, "Measurement");
    const restriction_2 = await checker.whichRights(req, res, Measurement);
    const restrictions = { ...restriction_1, ...restriction_2 };
    let filter = { "tags": req.params.id };
    filter = JSON.stringify(filter);
    try {
        await persistence.deletemore(filter, restrictions, Measurement);
    }
    catch (err) { return errors.manage(res, errors.delete_request_error, err); }
    return await controller.deleteResource(req, res, Dataupload);
};

exports.getoneDataupload = async (req, res) => {
    const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
    const select = await checker.whatCanSee(req, res, Dataupload);
    let result = await checker.isAvailable(req, res, Dataupload); if (result != true) return result;
    result = await checker.canOperate(req, res, "Measurement"); if (result != true) return result;
    result = await checker.hasRights(req, res, Dataupload); if (result != true) return result;
    return await controller.getResource(req, res, null, Dataupload, select);
};
