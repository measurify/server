const mongoose = require("mongoose");
const crypto = require("crypto");
const broker = require("./broker.js");
const tenancy = require("./tenancy.js");
const factory = require("./factory.js");
const bcrypt = require("bcryptjs");
const { catchErrors } = require("./errorHandlers.js");
const busboy = require("connect-busboy");
const datasetController = require("../controllers/datasetController.js");
const measurementController = require("../controllers/measurementController.js");
const errors = require("./errors.js");
const checker = require("../controllers/checker");
const persistence = require("./persistence.js");
const cache = require("../commons/cache.js");
const common = require("mocha/lib/interfaces/common");

function sha(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

//extract data when receive a form-data post
exports.dataExtractor = async function (req, res, next, saveDataset) {
  if (!req.busboy) { return errors.manage(res, errors.empty_file, "not found any data"); }
  let fileData = "";
  let descriptionData = "";
  let nameFile = null;
  let errorOccurred = false;
  req.busboy.on("file", (fieldName, file, filename) => {
    if (!nameFile) nameFile = filename.filename.substring(0, filename.filename.lastIndexOf('.'));
    if (!errorOccurred) {
      //if there is some error the lambda function is stopped
      if (fieldName != "file" && fieldName != "description") {
        errorOccurred = true;
        return errors.manage(res, errors.fieldName_error, "Key of form-data " + fieldName + " is not file or description");
      }
      file.on("data", (data) => {
        if (!errorOccurred) {
          //if there is some error the lambda function is stopped
          if (fieldName == "file") fileData += data.toString();
          if (fieldName == "description") descriptionData += data.toString();
        }
      });
    }
  });
  req.busboy.on("finish", () => {
    if (fileData === "") return errors.manage(res, errors.empty_file, "file data not found");
    if (descriptionData === "") return errors.manage(res, errors.empty_file, "description data not found");
    if (!errorOccurred) {
      if (saveDataset == true) {
        catchErrors(datasetController.post(req, res, next, fileData, descriptionData, nameFile));
      } else {
        catchErrors(measurementController.postFile(req, res, fileData, descriptionData, nameFile)
        );
      }
    }
  });
};

exports.checkerIfExist = async function (model, id) {
  //if something already exists
  return await model.exists({ _id: id });
};

//for dataset
exports.datauploadCheckAndCreate = async function (req, res, descriptionData, filename, fileData) {
  //datauploads check

  //check rights
  //let result = await checker.canCreate(req, res); 
  let result = await checker.canOperate(req, res, "Dataupload");
  if (result != true)
    return [errors.manage(res, errors.restricted_access_create), null];
  result = await checker.hasRightsToCreate(req, res, ["thing", "device", "feature", "tags",]);
  if (result != true)
    return [errors.manage(res, errors.restricted_access_create), null];

  //check if exist dataupload with the same id (the id is the filename)
  const Dataupload = mongoose.dbs[req.tenant.database].model("Dataupload");
  result = await this.checkerIfExist(Dataupload, filename);
  if (result) { return [errors.manage(res, errors.already_exist_dataupload, filename), null,]; }

  req.body = await this.createDatauploadRequest(filename, req.user._id, Date.now(), fileData.length, null, Date.now());

  try {
    let resourceDataupload = await persistence.post(req.body, Dataupload, req.tenant);
    return [true, resourceDataupload];
  } catch (err) {
    return [errors.manage(res, errors.post_request_error, err), null];
  }
};

exports.createDatauploadRequest = async function (filename, owner, timestamp, size, results, lastmod) {
  var results = {
    _id: filename,
    owner: owner,
    timestamp: timestamp,
    size: size,
    results: results,
    lastmod: lastmod,
  };
  return results;
};

//useful tu create the dataupload tag
exports.createTag = async function (req, res, filename) {
  //create tag {id}
  const Tag = mongoose.dbs[req.tenant.database].model("Tag");

  //check if it already exists
  const tagDataupload = filename;
  let result = await this.checkerIfExist(Tag, tagDataupload);
  if (!result) {
    try {
      bodyTag = await this.createTagRequest(tagDataupload);
      const results = await persistence.post(bodyTag, Tag, req.tenant);
    } catch (err) {
      return errors.manage(res, errors.post_request_error, err);
    }
  }
  return true;
};

exports.createTagRequest = async function (tagName) {
  var results = {
    _id: tagName,
  };
  return results;
};

/*exports.tagLoop = async function (descriptionData, Tag) {
  let tags = [];
  for (let j in descriptionData.tags) {
    id = line[descriptionData.tags[j]].replace(/['"]+/g, "");
    resultTag = await this.checkerIfExist(Tag, id);
    if (!resultTag) {
      errMessage = "tag " + id + " not found in database";
      return [null, errMessage];
    }
    tags.push(id);
  }
  return [tags, null];
};*/

//Count the element in the json file 
exports.elementsCount = async function (descriptionData) {
  var elementsNumber = 0;
  let arrayItems = [];
  for (var key in descriptionData) {
    if (key == "items") {
      for (var features in descriptionData.items) {
        for (var element in descriptionData.items[features]) {
          if(descriptionData.items[features][element]!=="_"){
          arrayItems.push(descriptionData.items[features][element]);}
        }
      }
      arrayItems = [...new Set(arrayItems)]; //to eliminate duplicates
      elementsNumber += arrayItems.length;
    } else {
      if (key == "tags") {
        elementsNumber += descriptionData.tags.length;
      } else {
        if (key == "enddate") {
          if (
            !isNaN(descriptionData.enddate) &&
            descriptionData.enddate == descriptionData.startdate
          ) {
          } else {
            elementsNumber++;
          }
        } else {
          if (key == "commonElements") {
            for (var key in descriptionData.commonElements) {
              elementsNumber--;
            }
          } else {
            elementsNumber++;
          }
        }
      }
    }
  }
  return elementsNumber;
};

exports.createSamples = function (value, delta) {
  if (Array.isArray(value)) return [{ values: value, delta: delta }];
  else return [{ values: [value], delta: delta }];
};

//Check the integrity of elements in the Json file and check from numeric value to string value
exports.checkDescriptionIntegrity = async function (res, descriptionData) {
  //cleaned c and -1 for each row to semplify next steps
  //first try to convert descriptionData to json
  try {
    //descriptionData must be json readable
    descriptionData = JSON.parse(descriptionData);
  } catch (error) {
    return [null, errors.manage(res, errors.description_not_json)];
  }

  data = descriptionData;
  data.commonElements = {};

  let result = await checkDescriptionKeys(res, descriptionData); if (result != true) return [null, result];
  try {
    for (var key in descriptionData) {
      if (key == "items") {
        for (var features of Object.keys(descriptionData.items)) {
          descriptionData.items[features].forEach(function (value, i) {
            if(value==="_") data.items[features][i] = value;
            else{data.items[features][i] = parseInt(value) - 1;}
          });
        }
      } else {
        if (key == "tags") {
          descriptionData.tags.forEach(function (valueTag, j) {
            if (typeof element !== "string") data.tags[j] = parseInt(valueTag) - 1;
          });
        } else {
          if (key !== "commonElements") {
            if (typeof descriptionData[key] == "string") {
              // if is not a number it's a string that is in common with all measurements
              data.commonElements[key] = descriptionData[key];
            } else {
              //is a number
              data[key] = parseInt(descriptionData[key]) - 1;
            }
          }
        }
      }
    }
  } catch (err) {
    return [null, errors.manage(res, errors.error_description_format, err)];
  }
  return [data, true];
};

//check all fields are in the JSON file
const checkDescriptionKeys = async function (res, descriptionData) {
  let keys = ["thing", "device", "items", "tags", "startdate", "enddate", "feature"];
  for (let key of keys) {
    if (!descriptionData.hasOwnProperty(key)) return errors.manage(res, errors.error_description_keys);
  }
  return true;
};

//Create Object to send request
const createRequestObject = async function (startdate, enddate, thing, feature, device, samples, tags, owner) {
  var results = {
    startDate: startdate,
    endDate: enddate,
    thing: thing,
    feature: feature,
    device: device,
    samples: samples,
    tags: tags,
    owner: owner,
  };
  const id = sha(JSON.stringify(results));
  results._id = id;
  return results;
};

exports.sampleLoop = async function (descriptionData, line, feature) {
  let samples = [];
  try{
    for (let k in descriptionData.items[feature._id]) {   
      if(descriptionData.items[feature._id][k]==="_"){samples.push(null); continue;}//for elements missing in the csv file 
      str_val = line[descriptionData.items[feature._id][k]].replace(/['"]+/g, "");    
      if (feature.items[k].dimension != 0) {
        //dimension 1 an array
        if (isNaN(str_val)) {
          //expected array []
          if (str_val.startsWith("[") && str_val.endsWith("]")) {
            const arr = str_val.split(/[[\]\";, ]/); //cover space or ; or other separator
            let filtered_str = arr.filter(function (el) {
              //delete ""
              return el != "";
            });
            if (feature.items[k].type == "number") {
              //if type == number conversion to number
              var aggr = filtered_str.reduce(function (filt, val) {
                const v = Number(val);
                filt.push(v);
                return filt;
              }, []);
              filtered_str = aggr;
            }
            samples.push(filtered_str);
          } else {
            errMessage =
              "Format not recognized: " + str_val + ", expected an array []";
            return [null, errMessage];
          }
        } else {
          //expected an array but is a Number
          errMessage = "expected array in samples at position " + k;
          return [null, errMessage];
        }
      } else {
        if (feature.items[k].type == "number") {
          if (
            str_val == " " ||
            str_val == "" ||
            str_val == "NaN" ||
            str_val == "nan" ||
            str_val == "Nan" ||
            str_val == "NAN" ||
            str_val == "Inf" ||
            str_val == "-Inf" ||
            str_val == "inf" ||
            str_val == "-inf"
          ) {
            str_val = null;
            samples.push(str_val);
            continue;
          } else {
            if (isNaN(str_val)) {
              //not a number
              errMessage = "expected number in samples at position " + k;
              return [null, errMessage];
            } else {
              samples.push(Number(str_val));
              continue;
            }
          }
        } else if (feature.items[k].type == "text") {
          if (typeof str_val != "string") {
            errMessage = "expected string in samples at position " + k;
            return [null, errMessage];
          }
        } else if (feature.items[k].type == "enum") {
          if (typeof str_val != "string") {
            errMessage = "expected string in samples at position " + k;
            return [null, errMessage];
          }
          if (!feature.items[k].range.includes(str_val)) {
            errMessage = "the enum " + str_val + " is not in the rage of items " + feature.items[k].name + " in column  " + k;
            return [null, errMessage];
          }

        }
        else {
          errMessage =
            "error in the definition of the feature on the database, value.type is not a number or string " + feature.items[k].type;
          return [null, errMessage];
        }
        samples.push(str_val);
      }
    }
    if (samples.every(element => element === null)) {
      errMessage = "All items of the feature are null";
      return [null, errMessage];
    }
    return [samples, null];
  }
  catch(error){return [null, error];}
};
/*
exports.tagLoop = async function (descriptionData, Tag, force, req) {
  let tags = [];
  for (let j in descriptionData.tags) {
    id = line[descriptionData.tags[j]].replace(/['"]+/g, "");
    if (id == "") { continue; }
    resultTag = await this.checkerIfExist(Tag, id);
    if (!resultTag) {
      if (force) {
        //save tag on database by default value
        let body = {
          _id: id,
          owner: req.body.owner,
        };
        result = await this.saveModelData(req, body, Tag);
        if (result != true) {
          //error in the post of the value
          errMessage = "tag: " + result;
          return [null, errMessage];
        }
      } else {
        errMessage = "tag " + id + " not found in database";
        return [null, errMessage];
      }
    }
    tags.push(id);
  }
  return [tags, null];
};
*/

//Loop to upload data checking all the information is correct
exports.dataUpload = async function (req, res, lines, elementsNumber, report, descriptionData, filename, force, header, addDatasetTag) {
  const Device = mongoose.dbs[req.tenant.database].model("Device");
  const Thing = mongoose.dbs[req.tenant.database].model("Thing");
  const Tag = mongoose.dbs[req.tenant.database].model("Tag");
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const Feature = mongoose.dbs[req.tenant.database].model("Feature");
  const models = { feature: Feature, device: Device, thing: Thing, tag: Tag };
  let allBodies=[];
  //TEST Optimization let allMeasurementBody=[];
  //algorithm to check every line of the csv and save the value inside a measurement
  let error = null;
  [descriptionData.commonElements, error, descriptionData.commonElementsData] = await this.checkCommonsResources(req, res, descriptionData.commonElements, descriptionData.tags, models, descriptionData.items, force);
  if (error != null) return [null, error];

  for (let i in lines) {
    if (lines[i] == "") continue;
    if ((i == 0) & (header == true)) continue;
    if (!process.env.CSV_DELIMITER) process.env.CSV_DELIMITER = ',';
    let sep = req.query && req.query.sep ? req.query.sep : process.env.CSV_DELIMITER;
    const regex = new RegExp(sep + '(?=(?:(?:[^"]*"){2})*[^"]*$)')  //Split a string by commas but ignore commas within double-quotes
    let line = lines[i].split(regex);
    line = line.map(el=>el.replace(/['"]+/g, ""));
    if (line.length != elementsNumber) {
      errMessage = "Mismatch number of elements: Expected " + elementsNumber + ", got " + line.length;
      report.errors.push("Index: " + i + " (" + errMessage + ")");
      continue;
    }
    let resources = ["feature", "device", "thing"];
    let lineResource = {};
    let errorOccurred = false;
    for (let re of resources) {
      if (errorOccurred) continue;
      if (descriptionData.commonElements.hasOwnProperty(re)) continue;
      lineResource[re + "Name"] = line[descriptionData[re]];      
      lineResource[re + "Info"] = await models[re].findById(lineResource[re + "Name"]);
      if (!lineResource[re + "Info"]) {
        if (!force || re == "feature") {
          //error resource not found
          errMessage = re + " " + lineResource[re + "Name"] + " not found in database";
          report.errors.push("Index: " + i + " (" + errMessage + ")");
          errorOccurred = true;
          continue;
        }
        if (re === "thing") {
          //save thing on database by default value
          let body = {
            _id: lineResource[re + "Name"],
            owner: req.body.owner,
          };
          let result = await this.saveModelData(req, body, Thing);
          if (result != true) {
            //error in the post of the value
            report.errors.push("Index: " + i + " (thing: " + result + ")");
            errorOccurred = true;
            continue;
          }
          lineResource.thingInfo = await models.thing.findById(lineResource.thingName);
        }
        if (re === "device") { 
          //save device on database by default value
          let body = {
            //default value
            _id: lineResource[re + "Name"],
            owner: req.body.owner,
            features: [],
            period: "5s",
            cycle: "10m",
            retryTime: "10s",
            scriptListMaxSize: 5,
            measurementBufferSize: 20,
            issueBufferSize: 20,
            sendBufferSize: 20,
            scriptStatementMaxSize: 5,
            statementBufferSize: 10,
            measurementBufferPolicy: "decimation",
          };
          for (key of Object.keys(descriptionData.items)) body.features.push(key);
          let result = await this.saveModelData(req, body, Device);
          if (result != true) {
            //error in the post of the value
            report.errors.push("Index: " + i + " (device: " + result + ")");
            errorOccurred = true;
            continue;
          }
          lineResource.deviceInfo = await models.device.findById(lineResource.deviceName);
        }
      }
    }    
    if (errorOccurred) { errorOccurred = false; continue; }    
    //check if feature exists and has the same number of items    
    if (!descriptionData.commonElements.hasOwnProperty("feature")) {      
      //check if feature is also in description in items      
      if (!descriptionData.items.hasOwnProperty(lineResource.featureName)) {
        errMessage = "the feature " + lineResource.featureName + " is not as key in description items";
        report.errors.push("Index: " + i + " (" + errMessage + ")");
        continue;
      }
      //check if feature has the same number of items
      itemsNumber = descriptionData.items[lineResource.featureName].length;
      if (itemsNumber != lineResource.featureInfo.items.length) {
        errMessage = "the feature " + lineResource.featureName + " has " + lineResource.featureInfo.items.length + " items, while the line has " + itemsNumber + " items";
        report.errors.push("Index: " + i + " (" + errMessage + ")");
        continue;
      }
    }
    //device exist and with force=true the device must have feature.id in features
    if (!descriptionData.commonElements.hasOwnProperty("device")) {
      let feature = descriptionData.commonElements.hasOwnProperty("feature") ? descriptionData.commonElements.feature : lineResource.featureName;
      if (!lineResource.deviceInfo["features"].includes(feature)) {
        if (force) {
          try {
            let fields = ["features"];
            body = {
              features: {
                add: [feature],
              },
            };
            await persistence.update(body, fields, lineResource.deviceInfo, Device, req.tenant);
            deviceInfo = await Device.findById(lineResource.deviceName);
            cache.set(lineResource.deviceName + "_device", deviceInfo);
          } catch (err) {
            errMessage = "error in adding match between device " + lineResource.deviceName + " and feature " + feature + ", " + err;
            report.errors.push("Index: " + i + " (" + errMessage + ")");
            continue;
          }
        } else {
          errMessage = "device " + lineResource.deviceName + " doesn't have feature " + feature + ", please add it or choose force = true";
          report.errors.push("Index: " + i + " (" + errMessage + ")");
          continue;
        }
      }
    }

    //check if startdate is a date    
    if (!descriptionData.commonElements.hasOwnProperty("startdate")) {
      //check if date is in date format and convert toISOString   
      let date = new Date(line[descriptionData.startdate]);
      if (isNaN(date)) {
        date = new Date(parseInt(date, 10));
        //retry to check if the date is a milliseconds number as type string
        if (isNaN(date)) {
          //error date not in correct format
          errMessage = "startdate is not in Date format : Example format: 2022-12-31T00:00:00+00:00";
          report.errors.push("Index: " + i + " (" + errMessage + ")");
          continue;
        }
      }
      lineResource.startdate = date.toISOString();
    }
    //check if enddate is a date    
    if (!descriptionData.commonElements.hasOwnProperty("enddate")) {
      if (line[descriptionData.enddate] === "") lineResource.enddate = lineResource.startdate ? lineResource.startdate : descriptionData.commonElements.startdate;
      else {
        //check if date is in date format and convert toISOString    
        let date = new Date(line[descriptionData.enddate]);
        if (isNaN(date)) {
          date = new Date(parseInt(date, 10));
          //retry to check if the date is a milliseconds number as type string
          if (isNaN(date)) {
            //error date not in correct format
            errMessage = "enddate is not in Date format : Example format: 2022-12-31T00:00:00+00:00";
            report.errors.push("Index: " + i + " (" + errMessage + ")");
            continue;
          }
        }
        lineResource.enddate = date.toISOString();
      }
    }

    //check if tags is in the database
    errorOccurred = false;
    for (let tag of descriptionData.tags) if (typeof tag == "number") {
      if (errorOccurred) continue;
      result = await this.checkerIfExist(Tag, line[tag]);
      if (!result) {
        if (force) {
          //save tag on database by default value
          let body = {
            _id: line[tag],
            owner: req.body.owner,
          };
          result = await this.saveModelData(req, body, Tag);
          if (result != true) {
            //error in the post of the value
            report.errors.push("Index: " + i + " (tag " + line[tag] + " " + result + ")");
            errorOccurred = true;
            continue;
          }
        } else {
          //error resource not found
          report.errors.push("Index: " + i + " (tag " + line[tag] + " not found in database)");
          errorOccurred = true;
          continue;
        }
      };
    }
    if (errorOccurred) { errorOccurred = false; continue; }
    let tags = [];
    for (let tag of descriptionData.tags) {
      if (typeof tag == "number") tags.push(line[tag]);
      else tags.push(tag);
    }
    //Add datauploadtag
    if (addDatasetTag == true) {
      tags.push(filename);
    }

    let feature = descriptionData.commonElementsData.featureInfo ? descriptionData.commonElementsData.featureInfo : lineResource.featureInfo;
    //Add Samples
    var samples = [];
    [samples, error] = await this.sampleLoop(descriptionData, line, feature);
    if (error) {
      report.errors.push("Index: " + i + " (" + error + ")");
      continue;
    }

    samples = this.createSamples(samples, 0);

    let startdate = descriptionData.commonElements.startdate ? descriptionData.commonElements.startdate : lineResource.startdate;

    let thing = descriptionData.commonElementsData.thingName ? descriptionData.commonElementsData.thingName : lineResource.thingName;
    let device = descriptionData.commonElementsData.deviceName ? descriptionData.commonElementsData.deviceName : lineResource.deviceName;
    let enddate = descriptionData.commonElements.enddate ? descriptionData.commonElements.enddate : (lineResource.enddate ? lineResource.enddate : startdate);
    //create measurement
    body = await createRequestObject(startdate, enddate, thing, feature._id, device, samples, tags, req.user._id);
    allBodies.push(body);
    //TEST OPTIMIZATION allMeasurementBody.push(body);
    /*
    result = await this.saveModelData(req, body, Measurement);
    if (result != true) {
      if(result.message.includes("duplicate key error")){
        result.message= "This element already exists in the database";
      }
      //error in the post of the value
      report.errors.push("Index: " + i + " (" + result.message + ")");
    } else {
      report.completed.push(i);
    }*/
  }
  time=Date.now();
  //Bulk open to speed up operations
  let bulk = Measurement.collection.initializeUnorderedBulkOp();
  allBodies.forEach(elem=>bulk.insert(elem));
  let result;
  try{
    result = await bulk.execute();
    report.completed.push(...Array(allBodies.length).keys());
  }
  catch(error){
    //error in the post of the value    
    const errors= bulk.s.bulkResult.writeErrors.map(elem=>{return {idx:elem.index,message:elem.errmsg.includes("duplicate key error")?"This element already exists in the database":elem.errmsg}});
    errors.forEach(elem=>report.errors.push("Index: " + elem.idx + " (" + elem.message + ")"));
    report.completed.push([...Array(allBodies.length).keys()].filter(item => !errors.map(e=>e.idx).includes(item))); 
}

  console.log(Date.now()-time);
  report.completed.flat();
  report.errors.flat();
  return [report, null];
};

exports.saveModelData = async function (req, body, Model) {
  try {
    const results = await persistence.post(body, Model, req.tenant);
  } catch (err) {
    return err;
    //return errors.manage(res, errors.post_request_error, err);
  }
  return true;
};


//only for dataset update information of the dataUpload filename information
exports.updateDataupload = async function (req, res, report, resource) {
  const Dataupload = mongoose.dbs[req.tenant.database].model("Dataupload");
  const fields = ["results"];
  report = JSON.stringify(report);
  let bodyUpdate = { results: report };
  try {
    await persistence.update(bodyUpdate, fields, resource, Dataupload, req.tenant);
    return true;
  } catch (err) {
    return errors.manage(res, errors.put_request_error, err);
  }
};

//Check elements from JSON file that are in common between all lines of csv
exports.checkCommonElements = async function (req, res, descriptionData, force) {
  let featureInfo = null;
  //check if feature exists and has the same number of items
  if (descriptionData.commonElements.hasOwnProperty("feature")) {
    //feature fixed
    const Feature = mongoose.dbs[req.tenant.database].model("Feature");
    featureName = descriptionData.commonElements["feature"];

    featureInfo = await Feature.findById(featureName);
    if (!featureInfo) {
      //error feature not found
      return errors.manage(
        res,
        errors.feature_not_found_description,
        featureName + " not found"
      );
    }

    //check if feature is also in description in items
    if (!descriptionData.items.hasOwnProperty(featureName)) {
      return errors.manage(res, errors.feature_not_in_items_description, featureName);
    }

    //check if feature has the same number of items
    itemsNumber = descriptionData.items[featureName].length;
    if (itemsNumber != featureInfo.items.length) {
      return errors.manage(res, errors.mismatch_feature_items_description, featureName + " has " + featureInfo.items.length + " elements on database, while in the description has " + itemsNumber + " elements");
    }
  }

  //check if exist thing with the same id
  if (descriptionData.commonElements.hasOwnProperty("thing")) {
    //thing fixed
    const Thing = mongoose.dbs[req.tenant.database].model("Thing");
    thing = descriptionData.commonElements["thing"];

    let resultThing = await this.checkerIfExist(Thing, thing);
    if (!resultThing) {
      if (force) {
        //save thing on database by default value
        let body = {
          _id: thing,
          owner: req.body.owner,
        };
        let result = await this.saveModelData(req, body, Thing);
        if (result != true) {
          //error in the post of the value
          return errors.manage(res, errors.post_force_element, result);
        }
      } else {
        //force false
        return errors.manage(res, errors.thing_not_found_description, thing);
      }
    }
  }

  //check if exist device with the same id
  if (descriptionData.commonElements.hasOwnProperty("device")) {
    //device fixed
    const Device = mongoose.dbs[req.tenant.database].model("Device");
    device = descriptionData.commonElements["device"];

    let resultDevice = await this.checkerIfExist(Device, device);
    if (!resultDevice) {
      if (force) {
        //save device on database by default value
        if (!featureInfo) {
          //no feature id
          body = {
            //default value
            _id: device,
            owner: req.user,
            period: "5s",
            cycle: "10m",
            retryTime: "10s",
            scriptListMaxSize: 5,
            measurementBufferSize: 20,
            issueBufferSize: 20,
            sendBufferSize: 20,
            scriptStatementMaxSize: 5,
            statementBufferSize: 10,
            measurementBufferPolicy: "decimation",
          };
        } else {
          //with feature id
          body = {
            //default value
            _id: device,
            owner: req.user,
            features: [featureInfo._id],
            period: "5s",
            cycle: "10m",
            retryTime: "10s",
            scriptListMaxSize: 5,
            measurementBufferSize: 20,
            issueBufferSize: 20,
            sendBufferSize: 20,
            scriptStatementMaxSize: 5,
            statementBufferSize: 10,
            measurementBufferPolicy: "decimation",
          };
        }

        result = await this.saveModelData(req, body, Device);
        if (result != true) {
          //error in the post of the value
          return errors.manage(res, errors.post_force_element, result);
        }
      } else {
        //force false
        return errors.manage(res, errors.device_not_found_description, device);
      }
    } else {
      //device exist and with force=true the device must have feature.id in features
      let deviceInfo = await Device.findById(device);
      if (descriptionData.commonElements.hasOwnProperty("feature")) {
        if (!deviceInfo["features"].includes(featureInfo.id)) {
          if (force) {
            try {
              let fields = [
                "features"
              ];
              body = {
                features: {
                  add: [featureInfo.id],
                },
              };
              await persistence.update(body, fields, deviceInfo, Device, req.tenant);
              deviceInfo = await Device.findById(device);
              cache.set(device + "_device", deviceInfo);
            } catch (err) {
              return errors.manage(res, errors.post_force_element, err);
            }
          } else {
            //force = false
            return errors.manage(res, errors.device_not_found_description, device + " doesn't have " + featureInfo.id + " as feature");
          }
        }
      }
    }
  }
  return true;
};

exports.prepareFilterDataset = async function (idFile, filter) {
  if (!filter) filter = '{}';
  filter = JSON.parse(filter);
  if (idFile) {//not null
    filter["tags"] = idFile;
  }
  return filter;
}

exports.checkCommonsResources = async function (req, res, commonElements, tags, models, items, force) {
  let commonElementsData = {};
  //check if resource exists
  for (el of Object.keys(commonElements)) {
    if (el.toLowerCase() == "startdate" || el.toLowerCase() == "enddate") {
      if (el.toLowerCase() == "enddate" && commonElements[el] == "") continue;
      //check if date is in date format and convert toISOString    
      let date = new Date(commonElements[el]);
      if (isNaN(date)) {
        date = new Date(parseInt(date, 10));
        //retry to check if the date is a milliseconds number as type string
        if (isNaN(date)) {
          //error date not in correct format
          errMessage = el + " : " + commonElements[el] + " is not in Date format : Example format: 2022-12-31T00:00:00+00:00";
          return [null, errors.manage(res, errors.post_request_error, errMessage)];
        }
      }
      commonElements[el] = date.toISOString();
      continue;
    }


    commonElementsData[el + "Name"] = commonElements[el];
    commonElementsData[el + "Info"] = await models[el].findById(commonElementsData[el + "Name"]);
    if (!commonElementsData[el + "Info"]) {
      if (!force || el == "feature") {
        //error resource not found
        errMessage = el + ": " + commonElementsData[el + "Name"] + " not found in database";
        return [null, errors.manage(res, errors.resource_not_found, errMessage)];
      }
      if (el === "thing") {
        //save thing on database by default value
        let body = {
          _id: commonElementsData[el + "Name"],
          owner: req.body.owner,
        };
        let result = await this.saveModelData(req, body, models.thing);
        if (result != true) {
          //error in the post of the value
          errMessage = "thing: " + result;
          return [null, errors.manage(res, errors.post_request_error, errMessage)];
        }
      }
      if (el === "device") {
        //save device on database by default value
        let body = {
          //default value
          _id: commonElementsData[el + "Name"],
          owner: req.body.owner,
          features: [],
          period: "5s",
          cycle: "10m",
          retryTime: "10s",
          scriptListMaxSize: 5,
          measurementBufferSize: 20,
          issueBufferSize: 20,
          sendBufferSize: 20,
          scriptStatementMaxSize: 5,
          statementBufferSize: 10,
          measurementBufferPolicy: "decimation",
        };
        for (key of Object.keys(items)) body.features.push(key);
        let result = await this.saveModelData(req, body, models.device);
        if (result != true) {
          //error in the post of the value
          errMessage = "device: " + result;
          return [null, errors.manage(res, errors.post_request_error, errMessage)];
        }
      }
    }
  }

  //check if items field has the common feature
  if (commonElementsData.featureName && !items.hasOwnProperty(commonElementsData.featureName)) {
    errMessage = "the feature " + commonElementsData.featureName + " is not as key in description items";
    return [null, errors.manage(res, errors.feature_not_in_items_description, errMessage)];
  }

  //check if feature has the same number of items
  if (commonElementsData.featureName) {
    let itemsNumber = items[commonElementsData.featureName].length;
    if (itemsNumber != commonElementsData.featureInfo.items.length) {
      errMessage = "the feature " + commonElementsData.featureName + " has " + commonElementsData.featureInfo.items.length + " items, while in the description Json file has " + itemsNumber + " items";
      return [null, errors.manage(res, errors.mismatch_feature_items_description, errMessage)];
    }
  }

  //Check if tags is in the database
  for (let tag of tags) if (typeof tag == "string") {
    result = await this.checkerIfExist(models.tag, tag);
    if (!result) {
      if (force) {
        //save tag on database by default value
        let body = {
          _id: tag,
          owner: req.body.owner,
        };
        result = await this.saveModelData(req, body, models.tag);
        if (result != true) {
          //error in the post of the value
          errMessage = "tag: " + result;
          return [null, errors.manage(res, errors.post_request_error, errMessage)];
        }
      } else {
        //error resource not found
        errMessage = "tag : " + tag + " not found in database";
        return [null, errors.manage(res, errors.resource_not_found, errMessage)];
      }
    };
  }

  return [commonElements, null, commonElementsData]
}