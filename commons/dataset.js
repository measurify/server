const mongoose = require('mongoose');
const broker = require('./broker.js');
const tenancy = require('./tenancy.js');
const factory = require('./factory.js');
const bcrypt = require('bcryptjs');
const { catchErrors } = require('./errorHandlers.js');
const busboy = require('connect-busboy');
const datasetController = require('../controllers/datasetController.js');
const errors = require('./errors.js');
const checker = require('../controllers/checker');
const persistence = require('./persistence.js');


//extract data when receive a form-data post
exports.dataExtractor = async function (req, res, next) {
  if (!req.busboy) throw new Error('file binary data cannot be null');
  let fileData = null;
  let descriptionData = null;
  let namefile = null;
  req.busboy.on('file', (fieldName, file, filename) => {//fieldname is the key of the file

    if (fieldName != "file" && fieldName != "description") {
      return errors.manage(res, errors.fieldName_error, fieldName + " is not file or description");
    }
    file.on('data', (data) => {
      if (fieldName == "file") {
        if (fileData === null) {
          fileData = data.toString();
          namefile = filename.filename.replace(".txt", "");

        } else {
          return errors.manage(res, errors.max_one_csv_file);
        }
      }
      if (fieldName == "description") {
        if (descriptionData === null) {
          descriptionData = data.toString();
        } else {
          return errors.manage(res, errors.max_one_description_file);
        }
      }
    });
  });
  req.busboy.on('finish', () => {
    if (!fileData) { return errors.manage(res, errors.empty_file); }

    catchErrors(datasetController.post(req, res, next, fileData, descriptionData, namefile));
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

  //check if feature exists
  const Feature = mongoose.dbs[req.tenant.database].model('Feature');
  let feature = await Feature.findById(req.params.id);//utile per le parti successive
  if (!feature) {//error feature not found 
    return [errors.manage(res, errors.feature_not_found, req.params.id), null];
  }  

  //check if feature has the same number of items 
  itemsNumber = descriptionData.items.length;
  const item = await persistence.get(req.params.id, null, Feature, null);
  if (itemsNumber != item.items.length) {
    return [errors.manage(res, errors.feature_different, itemsNumber + " != " + item.items.length), null];
  }

  //check if exist dataupload with the same id (the id is the filename)
  const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
  result = await this.checkerIfExist(Dataupload, filename);
  if (result) {    
    return [errors.manage(res, errors.already_exist_dataupload, filename), null];
  }

  //createdataupload ricorda che poi results va aggiornato alla fine del processo,
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
  for (var key in descriptionData) {
    if (key == "items") {
      elementsNumber += descriptionData.items.length;
    }
    else {
      if (key == "tags") {
        elementsNumber += descriptionData.tags.length;

      } else elementsNumber++;
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

  let result = await checkDescriptionKeys(res, descriptionData);
  if (result != true) return [null, result];

  try {
    for (var key in descriptionData) {
      if (key == "items") {
        for (var element in descriptionData.items)
          data.items[element] = parseInt(descriptionData.items[element].replace("c", "")) - 1;
      }
      else {
        if (key == "tags") {
          for (var element in descriptionData.tags)
            data.tags[element] = parseInt(descriptionData.tags[element].replace("c", "")) - 1;

        } else data[key] = parseInt(descriptionData[key].replace("c", "")) - 1;
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
    && descriptionData.hasOwnProperty('startdate') && descriptionData.hasOwnProperty('enddate')) {
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
  return results;
}

exports.sampleLoop = async function (descriptionDataCleaned, line, feature) {
  let samples = [];
  for (let k in descriptionDataCleaned.items) {
    id = line[descriptionDataCleaned.items[k]].replaceAll(/['"]+/g, '');
    if (feature.items[k].type == "number") {
      if (isNaN(id)) {//not a number       
        errMessage = "expected number in samples at position " + k;
        return [null, errMessage];
      }
      else{
        samples.push(Number(id));
        continue;
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

exports.principalLoop = async function (req, res, lines, elementsNumber, feature, report, descriptionDataCleaned, filename, force) {
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

    //check if exist thing with the same id 
    thing = line[descriptionDataCleaned.thing].replaceAll(/['"]+/g, '');
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
    device = line[descriptionDataCleaned.device].replaceAll(/['"]+/g, '');
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

    //check if startdate is a date
    let result = Date.parse(line[descriptionDataCleaned.startdate].replaceAll(/['"]+/g, ''));//need to remove ""
    if (Number.isNaN(result)) {      
      errMessage = "startdate is not in Date format"
      report.errors.push('Index: ' + i + ' (' + errMessage + ')');
      continue;
    }
    startdate = line[descriptionDataCleaned.startdate].replaceAll(/['"]+/g, '');

    //check if enddate exist and is a date
    let enddate = "";
    result = Date.parse(line[descriptionDataCleaned.enddate].replaceAll(/['"]+/g, ''));//need to remove ""
    if (line[descriptionDataCleaned.enddate] == "") {
      enddate = line[descriptionDataCleaned.startdate].replaceAll(/['"]+/g, '');
    }
    else {
      enddate = line[descriptionDataCleaned.enddate].replaceAll(/['"]+/g, '');
      if (Number.isNaN(result)) {       
        errMessage = "enddate is not in Date format"
        report.errors.push('Index: ' + i + ' (' + errMessage + ')');
        continue;
      }
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
    tags.push(filename);

    var samples = [];
    [samples, error] = await this.sampleLoop(descriptionDataCleaned, line, feature);
    if (error) {
      report.errors.push('Index: ' + i + ' (' + error + ')');
      continue;
    }
    
    samples = this.createSamples(samples, 0);

    //create measurement
    //this.createMeasurement(req.user,feature._id,device,thing,tags,samples,startdate,enddate,null,VisibilityTypes.private,req.tenant);
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