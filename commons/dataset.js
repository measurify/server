const mongoose = require('mongoose');
const crypto = require("crypto");
const broker = require('./broker.js');
const tenancy = require('./tenancy.js');
const factory = require('./factory.js');
const bcrypt = require('bcryptjs');
const { catchErrors } = require('./errorHandlers.js');
const busboy = require('connect-busboy');
const datasetController = require('../controllers/datasetController.js');
const measurementController = require('../controllers/measurementController.js');
const errors = require('./errors.js');
const checker = require('../controllers/checker');
const persistence = require('./persistence.js');
const cache = require("../commons/cache.js");

function sha(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}


//extract data when receive a form-data post
exports.dataExtractor = async function (req, res, next, saveDataset) {
  if (!req.busboy) throw new Error('file binary data cannot be null');
  let fileData = null;
  let descriptionData = null;
  let namefile = null;
  let errorOccurred = false;
  req.busboy.on('file', (fieldName, file, filename) => {//fieldname is the key of the file

    if (!errorOccurred) {//if there is some error the lambda function is stopped
      if (fieldName != "file" && fieldName != "description") {
        errorOccurred = true;
        return errors.manage(res, errors.fieldName_error, fieldName + " is not file or description");
      }
      file.on('data', (data) => {
        if (!errorOccurred) {//if there is some error the lambda function is stopped
          if (fieldName == "file") {
            if (fileData === null) {
              fileData = data.toString();
              namefile = filename.filename.replace(".txt", "");
              namefile = namefile.replace(".csv", "");
              namefile = namefile.replace(".json", "");

            } else {
              fileData += data.toString();
            }
          }
          if (fieldName == "description") {
            if (descriptionData === null) {
              descriptionData = data.toString();
            } else {
              errorOccurred = true;
              return errors.manage(res, errors.max_one_description_file);
            }
          }
        }
      });
    }
  });
  req.busboy.on('finish', () => {
    if (!fileData) { return errors.manage(res, errors.empty_file); }
    if (saveDataset == true) { catchErrors(datasetController.post(req, res, next, fileData, descriptionData, namefile)); }
    else { catchErrors(measurementController.postFile(req, res, next, fileData, descriptionData, namefile)); }
  });
}


exports.checkerIfExist = async function (model, id) {//if something already exists
  return await model.exists({ _id: id });
};


exports.datauploadCheckAndCreate = async function (req, res, descriptionData, filename, fileData) {
  //datauploads check

  //check rights
  let result = await checker.canCreate(req, res); if (result != true) return [errors.manage(res, errors.restricted_access_create), null];
  result = await checker.hasRightsToCreate(req, res, ['thing', 'device', 'feature', 'tags']);
  if (result != true) return [errors.manage(res, errors.restricted_access_create), null];

  //check if exist dataupload with the same id (the id is the filename)
  const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
  result = await this.checkerIfExist(Dataupload, filename);
  if (result) {
    return [errors.manage(res, errors.already_exist_dataupload, filename), null];
  }


  req.body = await this.createDatauploadRequest(filename, req.user._id, Date.now(), fileData.length, null, Date.now());

  try {
    let resourceDataupload = await persistence.post(req.body, Dataupload, req.tenant);
    return [true, resourceDataupload];
  }
  catch (err) { return [errors.manage(res, errors.post_request_error, err), null]; }

}

exports.createDatauploadRequest = async function (filename, owner, timestamp, size, results, lastmod) {
  var results = {
    "_id": filename,
    "owner": owner,
    "timestamp": timestamp,
    "size": size,
    "results": results,
    "lastmod": lastmod
  };
  return results;
};


exports.createTag = async function (req, res, filename) {
  //create tag {id} 
  const Tag = mongoose.dbs[req.tenant.database].model('Tag');

  //check if it already exists
  const tagDataupload = filename;
  let result = await this.checkerIfExist(Tag, tagDataupload);
  if (!result) {
    try {
      bodyTag = await this.createTagRequest(tagDataupload);
      const results = await persistence.post(bodyTag, Tag, req.tenant);
    }
    catch (err) { return errors.manage(res, errors.post_request_error, err); }
  }
  return true;
}

exports.createTagRequest = async function (tagName) {
  var results = {
    "_id": tagName
  };
  return results;
}

exports.tagLoop = async function (descriptionDataCleaned, Tag) {
  let tags = [];
  for (let j in descriptionDataCleaned.tags) {
    id = line[descriptionDataCleaned.tags[j]].replaceAll(/['"]+/g, '');
    resultTag = await this.checkerIfExist(Tag, id);
    if (!resultTag) {
      errMessage = "tag " + id + " not found in database";
      return [null, errMessage];
    }
    tags.push(id);
  }
  return [tags, null];
}

exports.elementsCount = async function (descriptionData) {
  var elementsNumber = 0;
  let arrayItems = [];
  for (var key in descriptionData) {
    if (key == "items") {
      for (var features in descriptionData.items) {
        for (var element in descriptionData.items[features]) {
          arrayItems.push(descriptionData.items[features][element]);
        }
      }
      arrayItems = [...new Set(arrayItems)];//to eliminate duplicates      
      elementsNumber += arrayItems.length;
    }
    else {
      if (key == "tags") {
        elementsNumber += descriptionData.tags.length;
      }
      else {
        if (key == "enddate") {
          if (!isNaN(descriptionData.enddate) && descriptionData.enddate == descriptionData.startdate) { }
          else { elementsNumber++; }
        }
        else {
          if (key == "commonElements") {
            for (var key in descriptionData.commonElements) { elementsNumber--; }
          }
          else { elementsNumber++; }
        }
      }
    }
  }
  return elementsNumber;
}



exports.createSamples = function (value, delta) {
  if (Array.isArray(value)) return [{ values: value, delta: delta }]
  else return [{ values: [value], delta: delta }]
}

exports.cleanObj = async function (res, descriptionData) {//cleaned c and -1 for each row to semplify next steps
  //first try to convert descriptionData to json
  try {//descriptionData must be json readable
    descriptionData = JSON.parse(descriptionData);
  } catch (error) {
    return [null, errors.manage(res, errors.description_not_json)];
  }

  data = descriptionData;
  data.commonElements = {}

  let result = await checkDescriptionKeys(res, descriptionData);
  if (result != true) return [null, result];

  try {
    for (var key in descriptionData) {
      if (key == "items") {
        for (var features in descriptionData.items) {
          for (var element in descriptionData.items[features]) {
            data.items[features][element] = parseInt(descriptionData.items[features][element]) - 1;
          }
        }
      }
      else {
        if (key == "tags") {
          for (var element in descriptionData.tags)
            data.tags[element] = parseInt(descriptionData.tags[element]) - 1;
        }
        else {
          if (key == "commonElements") { }
          else {
            if (isNaN(descriptionData[key])) {// if is not a number it's a string that is in common with all measurements
              data.commonElements[key] = descriptionData[key];
            }
            else {//is a number
              data[key] = parseInt(descriptionData[key]) - 1;
            }
          }
        }
      }
    }
  }
  catch (err) {
    return [null, errors.manage(res, errors.error_description_format, err)];
  }
  return [data, true];
}

const checkDescriptionKeys = async function (res, descriptionData) {
  if (descriptionData.hasOwnProperty('thing') && descriptionData.hasOwnProperty('device')
    && descriptionData.hasOwnProperty('items') && descriptionData.hasOwnProperty('tags')
    && descriptionData.hasOwnProperty('startdate') && descriptionData.hasOwnProperty('enddate')
    && descriptionData.hasOwnProperty('feature')) {
    return true;
  }
  return errors.manage(res, errors.error_description_keys);
}


const createRequestObject = async function (startdate, enddate, thing, feature, device, samples, tags, owner) {
  var results = {
    "startDate": startdate,
    "endDate": enddate,
    "thing": thing,
    "feature": feature,
    "device": device,
    "samples": samples,
    "tags": tags,
    "owner": owner
  };
  const id = sha(JSON.stringify(results));
  results._id = id;
  return results;
}

exports.sampleLoop = async function (descriptionDataCleaned, line, feature) {
  let samples = [];
  for (let k in descriptionDataCleaned.items[feature._id]) {
    id = line[descriptionDataCleaned.items[feature._id][k]].replaceAll(/['"]+/g, '');
    if (feature.items[k].type == "number") {
      if (
        id == "NaN" ||
        id == "nan" ||
        id == "Nan" ||
        id == "NAN" ||
        id == "Inf" ||
        id == "-Inf" ||
        id == "inf" ||
        id == "-inf"
      ) {
        id=null;
        samples.push(id);
        continue;
      }
      else {
        if (isNaN(id)) {//not a number       
          errMessage = "expected number in samples at position " + k;
          return [null, errMessage];
        }
        else {
          samples.push(Number(id));
          continue;
        }
      }
    }
    else if (feature.items[k].type == "string") {
      if (typeof myVar != 'string') {
        errMessage = "expected string in samples at position " + k;
        return [null, errMessage];
      }
    }
    else {
      errMessage = "error in the definition of the feature on the database, value.type is not a number or string";
      return [null, errMessage];
    }
    samples.push(id);
  }
  return [samples, null];
}

exports.tagLoop = async function (descriptionDataCleaned, Tag, force, req) {
  let tags = [];
  for (let j in descriptionDataCleaned.tags) {
    id = line[descriptionDataCleaned.tags[j]].replaceAll(/['"]+/g, '');
    resultTag = await this.checkerIfExist(Tag, id);
    if (!resultTag) {
      if (force) {//save tag on database by default value
        let body = {
          '_id': id,
          'owner': req.body.owner
        };
        result = await this.saveModelData(req, body, Tag);
        if (result != true) {//error in the post of the value
          errMessage = "tag: " + result;
          return [null, errMessage];
        }
      }
      else {
        errMessage = "tag " + id + " not found in database";
        return [null, errMessage];
      }
    }
    tags.push(id);
  }
  return [tags, null];
}

exports.principalLoop = async function (req, res, lines, elementsNumber, feature, report, descriptionDataCleaned, filename, force, addDatasetTag) {
  const Device = mongoose.dbs[req.tenant.database].model('Device');
  const Thing = mongoose.dbs[req.tenant.database].model('Thing');
  const Tag = mongoose.dbs[req.tenant.database].model('Tag');
  const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
  //algorithm for check every line of the csv and save the value inside a measurement
  for (let i in lines) {
    if (lines[i] == "") continue;
    line = lines[i].split(",");
    if (line.length != elementsNumber) {
      errMessage = "not enough fields in the row"
      report.errors.push('Index: ' + i + ' (' + errMessage + ')');
      continue;
    }


    //check if feature exists and has the same number of items 

    const Feature = mongoose.dbs[req.tenant.database].model('Feature');

    if (descriptionDataCleaned.commonElements.hasOwnProperty("feature")) {//feature fixed
      featureName = descriptionDataCleaned.commonElements["feature"];
    }
    else {
      featureName = line[descriptionDataCleaned.feature].replaceAll(/['"]+/g, '');
    }
    let featureInfo = await Feature.findById(featureName);
    if (!featureInfo) {//error feature not found 
      errMessage = "feature " + featureName + " not found in database"
      report.errors.push('Index: ' + i + ' (' + errMessage + ')');
      continue;
    }
    //check if feature is also in description in items
    if (!descriptionDataCleaned.items.hasOwnProperty(featureName)) {
      errMessage = "the feature " + featureName + " is not as key in description items"
      report.errors.push('Index: ' + i + ' (' + errMessage + ')');
      continue;
    }

    //check if feature has the same number of items 
    itemsNumber = descriptionDataCleaned.items[featureName].length;
    if (itemsNumber != featureInfo.items.length) {
      errMessage = "the feature " + featureName + " has " + featureInfo.items.length + " items, while the line has " + itemsNumber + " items"
      report.errors.push('Index: ' + i + ' (' + errMessage + ')');
      continue;
    }
    feature = featureInfo;

    //check if exist thing with the same id 
    if (descriptionDataCleaned.commonElements.hasOwnProperty("thing")) {//thing fixed
      thing = descriptionDataCleaned.commonElements["thing"];
    }
    else {
      thing = line[descriptionDataCleaned.thing].replaceAll(/['"]+/g, '');
    }
    let resultThing = await this.checkerIfExist(Thing, thing);
    if (!resultThing) {
      if (force) {//save thing on database by default value
        let body = {
          '_id': thing,
          'owner': req.body.owner
        };
        let result = await this.saveModelData(req, body, Thing);
        if (result != true) {//error in the post of the value
          report.errors.push('Index: ' + i + ' (thing: ' + result + ')');
          continue;
        }
      }
      else {
        errMessage = "thing " + thing + " not found in database"
        report.errors.push('Index: ' + i + ' (' + errMessage + ')');
        continue;
      }
    }

    //check if exist device with the same id 
    if (descriptionDataCleaned.commonElements.hasOwnProperty("device")) {//device fixed
      device = descriptionDataCleaned.commonElements["device"];
    }
    else {
      device = line[descriptionDataCleaned.device].replaceAll(/['"]+/g, '');
    }
    resultDevice = await this.checkerIfExist(Device, device);
    if (!resultDevice) {
      if (force) {//save device on database by default value
        body = {//default value
          '_id': device,
          'owner': req.body.owner,
          "features": [feature._id],
          "period": "5s",
          "cycle": "10m",
          "retryTime": "10s",
          "scriptListMaxSize": 5,
          "measurementBufferSize": 20,
          "issueBufferSize": 20,
          "sendBufferSize": 20,
          "scriptStatementMaxSize": 5,
          "statementBufferSize": 10,
          "measurementBufferPolicy": "decimation"
        };

        let result = await this.saveModelData(req, body, Device);
        if (result != true) {//error in the post of the value
          report.errors.push('Index: ' + i + ' (device: ' + result + ')');
          continue;
        }
      }
      else {
        errMessage = "device " + device + " not found in database"
        report.errors.push('Index: ' + i + ' (' + errMessage + ')');
        continue;
      }
    }
    else {//device exist and with force=true the device must have feature.id in features
      let deviceInfo = await Device.findById(device);
      if (!deviceInfo["features"].includes(feature.id)) {
        try {
          let fields = ['features', 'scripts', 'tags', 'visibility', 'period', 'cycle', 'retryTime', 'scriptListMaxSize', 'measurementBufferSize', 'issueBufferSize', 'sendBufferSize', 'scriptStatementMaxSize', 'statementBufferSize', 'measurementBufferPolicy'];
          body = {
            "features": {
              "add": [feature.id]
            }
          }
          await persistence.update(body, fields, deviceInfo, Device, req.tenant);
          deviceInfo = await Device.findById(device);
          cache.set(device, deviceInfo);
        }
        catch (err) {
          errMessage = "error in adding match between device " + device + " and feature " + feature.id + ", " + err
          report.errors.push('Index: ' + i + ' (' + errMessage + ')');
          continue;

        }
      }
    }

    //check if startdate is a date
    let result = null;
    if (descriptionDataCleaned.commonElements.hasOwnProperty("startdate")) {//startdate fixed
      if (isNaN(descriptionDataCleaned.commonElements["startdate"].replaceAll(/['"]+/g, ''))) {
        result = Date.parse(descriptionDataCleaned.commonElements["startdate"].replaceAll(/['"]+/g, ''));
        startdate = descriptionDataCleaned.commonElements["startdate"].replaceAll(/['"]+/g, '');
      }
      else {//is a number
        result = descriptionDataCleaned.commonElements["startdate"].replaceAll(/['"]+/g, '');
        startdate = descriptionDataCleaned.commonElements["startdate"].replaceAll(/['"]+/g, '');
      }
    }
    else {
      if (isNaN(line[descriptionDataCleaned.startdate].replaceAll(/['"]+/g, ''))) {
        result = Date.parse(line[descriptionDataCleaned.startdate].replaceAll(/['"]+/g, ''));//need to remove ""
        startdate = line[descriptionDataCleaned.startdate].replaceAll(/['"]+/g, '');
      }
      else {//is a number
        result = line[descriptionDataCleaned.startdate].replaceAll(/['"]+/g, '')
        startdate = line[descriptionDataCleaned.startdate].replaceAll(/['"]+/g, '')
      }
    }
    if (isNaN(result)) {
      errMessage = "startdate is not in Date format"
      report.errors.push('Index: ' + i + ' (' + errMessage + ')');
      continue;
    }


    //check if enddate exist and is a date
    let enddate = "";
    if (descriptionDataCleaned.commonElements.hasOwnProperty("enddate")) {//enddate fixed
      if (isNaN(descriptionDataCleaned.commonElements["enddate"].replaceAll(/['"]+/g, ''))) {
        result = Date.parse(descriptionDataCleaned.commonElements["enddate"].replaceAll(/['"]+/g, ''));
        enddate = descriptionDataCleaned.commonElements["enddate"].replaceAll(/['"]+/g, '');
      }
      else {//is a number
        result = descriptionDataCleaned.commonElements["enddate"].replaceAll(/['"]+/g, '');
        enddate = descriptionDataCleaned.commonElements["enddate"].replaceAll(/['"]+/g, '');
      }
    }
    else {
      if (descriptionDataCleaned.enddate == descriptionDataCleaned.startdate || line[descriptionDataCleaned.enddate] == "") {
        enddate = startdate;
      }
      else {
        if (isNaN(line[descriptionDataCleaned.enddate].replaceAll(/['"]+/g, ''))) {
          result = Date.parse(line[descriptionDataCleaned.enddate].replaceAll(/['"]+/g, ''));//need to remove ""
          enddate = line[descriptionDataCleaned.enddate].replaceAll(/['"]+/g, '');
        }
        else {//is a number
          result = line[descriptionDataCleaned.enddate].replaceAll(/['"]+/g, '')
          enddate = line[descriptionDataCleaned.enddate].replaceAll(/['"]+/g, '')
        }
      }
    }
    if (isNaN(result)) {
      errMessage = "enddate is not in Date format"
      report.errors.push('Index: ' + i + ' (' + errMessage + ')');
      continue;
    }


    //check if exist tags with the same id 
    var tags = [];
    let error;
    [tags, error] = await this.tagLoop(descriptionDataCleaned, Tag, force, req);
    if (error) {
      report.errors.push('Index: ' + i + ' (' + error + ')');
      continue;
    }

    //Add datauploadtag
    if (addDatasetTag == true) { tags.push(filename); }

    //Add Samples
    var samples = [];
    [samples, error] = await this.sampleLoop(descriptionDataCleaned, line, feature);
    if (error) {
      report.errors.push('Index: ' + i + ' (' + error + ')');
      continue;
    }

    samples = this.createSamples(samples, 0);

    //create measurement
    body = await createRequestObject(startdate, enddate, thing, feature._id, device, samples, tags, req.user._id);

    result = await this.saveModelData(req, body, Measurement);
    if (result != true) {//error in the post of the value
      report.errors.push('Index: ' + i + ' (' + result + ')');
    }
    else {
      report.completed.push(i);
    }
  }
  return report;
}

exports.saveModelData = async function (req, body, Model) {
  try {
    const results = await persistence.post(body, Model, req.tenant);
  }
  catch (err) {
    return err;
    //return errors.manage(res, errors.post_request_error, err); 
  }
  return true;
}

exports.updateDataupload = async function (req, res, report, resource) {
  const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
  const fields = ['results'];
  report = JSON.stringify(report);
  let bodyUpdate = { "results": report };
  try {
    await persistence.update(bodyUpdate, fields, resource, Dataupload, req.tenant);
    return true;
  }
  catch (err) { return errors.manage(res, errors.put_request_error, err); }
}