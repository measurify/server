const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const busboy = require('connect-busboy');
const persistence = require('../commons/persistence.js');
const { result } = require('underscore');
const { file } = require('../types/itemTypes');
const VisibilityTypes = require('../types/visibilityTypes.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const datasetCreator = require('../commons/dataset.js');

exports.get = async (req, res) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const select = await checker.whatCanSee(req, res, Feature)
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Feature); if (result != true) return result;
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    return await controller.getResourceDataset(req, res, '{ "timestamp": "desc" }', select, Measurement);
};

exports.getFile = async (req, res) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const select = await checker.whatCanSee(req, res, Feature)
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Feature); if (result != true) return result;
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    return await controller.getResourceDataset(req, res, '{ "timestamp": "desc" }', select, Measurement);
};


exports.post = async (req, res, next, fileData, descriptionData, filename) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');

    //prepare an object semplified for next steps
    let result;
    [descriptionDataCleaned, result] = await datasetCreator.cleanObj(res, descriptionData);
    if (result != true) return result;

    let resourceDataupload
    [result,resourceDataupload] = await datasetCreator.datauploadCheckAndCreate(req, res, descriptionDataCleaned, filename, fileData);
    if (result != true) return result;

    result = await datasetCreator.createTag(req, res, filename);
    if (result != true) return result;

    //create report
    let report = { completed: [], errors: [] };
    let feature = await Feature.findById(req.params.id);

    //csv unrolling and control
    //control number of element in the description    
    const elementsNumber = await datasetCreator.elementsCount(descriptionDataCleaned);

    fileDataModified = fileData.replace(/(\r)/gm, "");
    var lines = fileDataModified.split("\n");

    //check for force save object on database by default value if it is true or undefined
    let force=false;
    if(req.query.force=='true'){force=true;}

    //set the owner
    if (req.user._id) req.body.owner = req.user._id;

    //principal loop for each line
    report = await datasetCreator.principalLoop(req, res, lines, elementsNumber, feature, report, descriptionDataCleaned, filename, force);
    //console.log(report);


    result = await datasetCreator.updateDataupload(req, res, report, resourceDataupload);
    if (result != true) {        
        return result;
    };

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
    result = await checker.canDelete(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Dataupload); if (result != true) return result;

    
    result = await checker.canDeleteList(req, res); if (result != true) return result;
    const restriction_1 = await checker.whatCanDelete(req, res);
    const restriction_2 = await checker.whichRights(req, res, Measurement);
    const restrictions = { ...restriction_1, ...restriction_2 };
    filter = { "tags": req.params.id };
    filter=JSON.stringify(filter);
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
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Dataupload); if (result != true) return result;
    return await controller.getResource(req, res, null, Dataupload, select);
};

exports.putDataupload = async (req, res) => {
    const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
    const fields = ['results'];
    let result = await checker.isAvailable(req, res, Dataupload); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Dataupload); if (result != true) return result;
    return await controller.updateResource(req, res, fields, Dataupload);
};