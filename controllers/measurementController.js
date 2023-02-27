const mongoose = require("mongoose");
const controller = require("./controller");
const checker = require("./checker");
const filemanager = require("../commons/filemanager");
const dataset = require('../commons/dataset.js');
const crypto = require("crypto");

function sha(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

exports.get = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const select = await checker.whatCanSee(req, res, Measurement);
  //const restriction_1 = await checker.whatCanRead(req, res);
  const restriction_1 = await checker.whatCanOperate(req, res, "Measurement");
  const restriction_2 = await checker.whichRights(req, res, Measurement);
  const restrictions = { ...restriction_1, ...restriction_2 };
  return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Measurement, restrictions);
};

exports.pipe = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const select = await checker.whatCanSee(req, res, Measurement);
  //const restriction_1 = await checker.whatCanRead(req, res);
  const restriction_1 = await checker.whatCanOperate(req, res, "Measurement");
  const restriction_2 = await checker.whichRights(req, res, Measurement);
  const restrictions = { ...restriction_1, ...restriction_2 };
  controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Measurement, restrictions);
};

exports.count = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  //const restriction_1 = await checker.whatCanRead(req, res);
  const restriction_1 = await checker.whatCanOperate(req, res, "Measurement");
  const restriction_2 = await checker.whichRights(req, res, Measurement);
  const restrictions = { ...restriction_1, ...restriction_2 };
  return await controller.getResourceListSize(req, res, Measurement, restrictions);
};

exports.getone = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const select = await checker.whatCanSee(req, res, Measurement);
  let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
  //result = await checker.canRead(req, res);if (result != true) return result;
  result = await checker.canOperate(req, res, "Measurement"); if (result != true) return result;
  result = await checker.hasRights(req, res, Measurement); if (result != true) return result;
  return await controller.getResource(req, res, null, Measurement, select);
};

exports.post = async (req, res) => {
  if (Array.isArray(req.body)) { req.body.map((r) => { if (r._id == undefined) { r._id = sha(JSON.stringify(r)); } }); }
  else if (req.body._id == undefined) { req.body._id = sha(JSON.stringify(req.body)); }
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  //let result = await checker.canCreate(req, res);if (result != true) return result;
  let result = await checker.canOperate(req, res, "Measurement"); if (result != true) return result;
  result = await checker.hasRightsToCreate(req, res, ["thing", "device", "feature", "tags",]); if (result != true) return result;
  return await controller.postResource(req, res, Measurement);
};

exports.put = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const fields = ["tags"];
  let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
  result = await checker.isFilled(req, res, fields); if (result != true) return result;
  //result = await checker.canModify(req, res);  if (result != true) return result;
  result = await checker.canOperate(req, res, "Measurement"); if (result != true) return result;
  result = await checker.hasRights(req, res, Measurement); if (result != true) return result;
  return await controller.updateResource(req, res, fields, Measurement);
};

exports.delete = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  let result = await checker.canDeleteMeasurementList(req, res, "Measurement"); if (result != true) return result;
  const restriction_1 = await checker.whatCanOperate(req, res, "Measurement");
  const restriction_2 = await checker.whichRights(req, res, Measurement);
  const restrictions = { ...restriction_1, ...restriction_2 };
  return await controller.deleteResourceList(req, res, Measurement, restrictions);
};

exports.deleteone = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
  result = await checker.canOperate(req, res, "Measurement"); if (result != true) return result;
  result = await checker.hasRights(req, res, Measurement); if (result != true) return result;
  return await controller.deleteResource(req, res, Measurement);
};

exports.getstream = async (ws, req) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  let result = await checker.isAvailable(req, ws, Measurement); if (result != true) return result;
  result = await checker.canOperate(req, ws, "Measurement"); if (result != true) return result;
  result = await checker.hasRights(req, ws, Measurement); if (result != true) return result;
  filemanager.upload(ws, req.resource._id, "webm");
};

exports.poststream = async (ws, req) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  let result = await checker.canOperate(req, res, "Measurement"); if (result != true) return result;
  result = await checker.hasRightsToCreate(req, ws, ["thing", "device", "feature", "tags",]); if (result != true) return result;
  ws.on("message", async function incoming(data) {
    const res = await controller.streamResource(req, data, Measurement);
    ws.send(JSON.stringify(res));
  });
};

exports.getfile = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
  result = await checker.canOperate(req, res, "Measurement"); if (result != true) return result;
  result = await checker.hasRights(req, res, Measurement); if (result != true) return result;
  await filemanager.download(req, res, req.resource._id, "webm");
};

exports.postFile = async (req, res, fileData, descriptionData, filename) => {
  //prepare an object semplified for next steps
  let result;
  [descriptionData, result] = await dataset.checkDescriptionIntegrity(res, descriptionData);
  if (result != true) return result;
  //create report    
  let report = { completed: [], errors: [] };

  //csv unrolling and control
  //control number of element in the description    
  const elementsNumber = await dataset.elementsCount(descriptionData);

  fileData = fileData.replace(/(\r)/gm, "").replace(/['"]+/g, "");
  var lines = fileData.split("\n");

  //check for force save object on database by default value if it is false or undefined
  let force = req.query && req.query.force == 'true' ? true : false;

  //check if the first line of the csv is the header of the file, default is true because csv needs header
  let header = req.query && req.query.header == 'false' ? false : true;

  //set the owner
  if (req.user._id) req.body.owner = req.user._id;
  //principal loop for each line
  [report,error] = await dataset.dataUpload(req, res, lines, elementsNumber, report, descriptionData, filename, force, header, false);
  if (error != null) return error;
  //console.log(report);

  if (report.errors.length === 0) {
    return res.status(200).json(report);
  }
  else {
    return res.status(202).json(report);
  }
};

