const mongoose = require('mongoose');
const broker = require('../commons/broker.js');
const tenancy = require('../commons/tenancy.js');
const factory = require('../commons/factory.js');
const bcrypt = require('bcryptjs');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const datasetController = require('../controllers/datasetController.js');
const errors = require('../commons/errors.js');
const checker = require('../controllers/checker');
const persistence = require('../commons/persistence.js');

//extract data when receive a form-data post
exports.dataExtractor = async function (req, res, next) {
  if (!req.busboy) throw new Error('file binary data cannot be null');
  let fileData = null;
  let descriptionData = null;
  let namefile = null;
  //console.log(req);
  //for numeric field:
  //let token = null;
  req.busboy.on('file', (fieldName, file, filename) => {//fieldname is the key of the file

    //console.log(file);
    //console.log(data);
    //DA METTERE IF fieldname not file and not description error

    if (fieldName != "file" || fieldName != "description") {
      //error
    }
    file.on('data', (data) => {
      if (fieldName == "file") {
        if (fileData === null) {
          fileData = data.toString();
          namefile = filename.filename.replace(".txt", "");
        } else {
          //error max 1 file
        }
      }
      if (fieldName == "description") {
        if (descriptionData === null) {
          descriptionData = data.toString();
        } else {
          //error max 1 file
        }
      }
    });
  });
  //request for adding a numeric field in form-data
  //req.busboy.on('field', (fieldName, value) => {
  //if (fieldName === 'token') {
  //token = value;
  //}
  //});
  req.busboy.on('finish', () => {
    if (!fileData) next(new Error('file binary data cannot be null'));
    //if (!token) next(new Error('No security token was passed')); 
    console.log("fileData vale:");
    console.log(fileData);
    console.log("descriptionData vale:");
    console.log(descriptionData);
    console.log("namefile vale:");
    console.log(namefile);

    catchErrors(datasetController.post(req, res, next, fileData, descriptionData, namefile));
  });
}

exports.checkerIfExist = async function (model, id) {//if something already exists
  let result = await model.exists({ _id: id });
  console.log(result);
  return result;
  //const result = await model.exists({ _id: id });
  //if (result)  return true;//already exist with that id
  //return false; //not exist           
};

exports.datauploadCheckAndCreate = async function (req, res, descriptionData, filename, fileData) {
  //datauploads check
  console.log("sono qui");
  console.log(filename);

  //check rights
  let result = await checker.canCreate(req, res); if (result != true) return errors.manage(res, errors.restricted_access_create);
  result = await checker.hasRightsToCreate(req, res, ['thing', 'device', 'feature', 'tags']); if (result != true) return errors.manage(res, errors.restricted_access_create);
  //check if feature exists
  const Feature = mongoose.dbs[req.tenant.database].model('Feature');
  let feature = await Feature.findById(req.params.id);//utile per le parti successive
  if (!feature) {//error feature not found 
    console.log("feature doesn't exist");
    return errors.manage(res, errors.feature_not_found, req.params.id);
  }
  console.log(feature);

  //check if feature has the same number of items
  //first try to convert descriptionData to json
  try {//descriptionData must be json readable
    descriptionData = JSON.parse(descriptionData);
    console.log("si lo è");

  } catch (error) {
    console.log("non lo è");
    return errors.manage(res, errors.description_not_json);
  }
  //check if feature has the same number of items 
  itemsNumber = descriptionData.items.length;
  const item = await persistence.get(req.params.id, null, Feature, null);
  if (itemsNumber != item.items.length) {
    console.log("errore elementi nella feature in numero diverso");
    return errors.manage(res, errors.feature_different, itemsNumber + " != " + item.items.length);
  }

  //check if exist dataupload with the same id (the id is the filename)
  const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
  result = await this.checkerIfExist(Dataupload, filename);
  if (result) {
    console.log("already exist a dataupload with the same id, can't save two datafile with the same name");
    return errors.manage(res, errors.already_exist_dataupload, filename);
  }


  //createdataupload ricorda che poi results va aggiornato alla fine del processo,
  //await this.createDataupload(filename,req.user,Date.now,fileData.length,null,Date.now);
  req.body = await this.createDatauploadRequest(filename, req.user._id, Date.now(), fileData.length, null, Date.now());
  //console.log(req.body);
  try {
    const results = await persistence.post(req.body, Dataupload, req.tenant);
    console.log(results);
  }
  catch (err) { return errors.manage(res, errors.post_request_error, err); }
  return true;
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
  //results = JSON.stringify(results);
  console.log(results);
  return results;
  /*old
  const Tenant = mongoose.dbs['catalog'].model('Tenant');
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Dataupload = mongoose.dbs[tenant.database].model('Dataupload');
  const req = {
      _id: filename,
      owner: owner,
      timestamp: timestamp || Date.now(),
      size: size,
      results: results,
      lastmod: lastmod || Date.now(),
  }
  const dataupload = new Dataupload(req);
  await dataupload.save();
  return dataupload._doc;
  */
};


exports.createTag = async function (req,res,filename) {
  //create tag {id} 
  const Tag = mongoose.dbs[req.tenant.database].model('Tag');
  //check if it already exists
  const tagDataupload = filename;
  console.log(tagDataupload);
  let result = await this.checkerIfExist(Tag, tagDataupload);
  if (!result) {console.log("non esiste");
    try {
      bodyTag = await this.createTagRequest(tagDataupload);
      const results = await persistence.post(bodyTag, Tag, req.tenant);
      console.log(results);
    }
    catch (err) { return errors.manage(res, errors.post_request_error, err); }
  }console.log("esiste");
  console.log("check3");
  return true;
}

exports.createTagRequest = async function (tagName) {
  var results = {
      "_id": tagName
  };
  console.log(results);
  return results;
};