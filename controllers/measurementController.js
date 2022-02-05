const mongoose = require("mongoose");
const controller = require("./controller");
const checker = require("./checker");
const filemanager = require("../commons/filemanager");

exports.get = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const select = await checker.whatCanSee(req, res, Measurement);
  const restriction_1 = await checker.whatCanRead(req, res);
  const restriction_2 = await checker.whichRights(req, res, Measurement);
  const restrictions = { ...restriction_1, ...restriction_2 };
  return await controller.getResourceList(
    req,
    res,
    '{ "timestamp": "desc" }',
    select,
    Measurement,
    restrictions
  );
};

exports.pipe = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const select = await checker.whatCanSee(req, res, Measurement);
  const restriction_1 = await checker.whatCanRead(req, res);
  const restriction_2 = await checker.whichRights(req, res, Measurement);
  const restrictions = { ...restriction_1, ...restriction_2 };
  controller.getResourcePipe(
    req,
    res,
    '{ "timestamp": "desc" }',
    select,
    Measurement,
    restrictions
  );
};

exports.count = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const restriction_1 = await checker.whatCanRead(req, res);
  const restriction_2 = await checker.whichRights(req, res, Measurement);
  const restrictions = { ...restriction_1, ...restriction_2 };
  return await controller.getResourceListSize(
    req,
    res,
    Measurement,
    restrictions
  );
};

exports.getone = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const select = await checker.whatCanSee(req, res, Measurement);
  let result = await checker.isAvailable(req, res, Measurement);
  if (result != true) return result;
  result = await checker.canRead(req, res);
  if (result != true) return result;
  result = await checker.hasRights(req, res, Measurement);
  if (result != true) return result;
  return await controller.getResource(req, res, null, Measurement, select);
};

exports.post = async (req, res) => {
  /*if (Array.isArray(req.body)) {
    req.body.map((r) => {
      if (r._id == undefined) {
        r._id = sha(JSON.stringify(r));
      }
    });
  } else if (req.body._id == undefined) {
    req.body._id = sha(JSON.stringify(req.body));
  }*/

  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  let result = await checker.canCreate(req, res);
  if (result != true) return result;
  result = await checker.hasRightsToCreate(req, res, [
    "thing",
    "device",
    "feature",
    "tags",
  ]);
  if (result != true) return result;
  return await controller.postResource(req, res, Measurement);
};

exports.put = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const fields = ["tags"];
  let result = await checker.isAvailable(req, res, Measurement);
  if (result != true) return result;
  result = await checker.isFilled(req, res, fields);
  if (result != true) return result;
  result = await checker.canModify(req, res);
  if (result != true) return result;
  result = await checker.hasRights(req, res, Measurement);
  if (result != true) return result;
  return await controller.updateResource(req, res, fields, Measurement);
};

exports.delete = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const result = await checker.canDeleteList(req, res);
  if (result != true) return result;
  const restriction_1 = await checker.whatCanDelete(req, res);
  const restriction_2 = await checker.whichRights(req, res, Measurement);
  const restrictions = { ...restriction_1, ...restriction_2 };
  return await controller.deleteResourceList(
    req,
    res,
    Measurement,
    restrictions
  );
};

exports.deleteone = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  let result = await checker.isAvailable(req, res, Measurement);
  if (result != true) return result;
  result = await checker.canDelete(req, res);
  if (result != true) return result;
  result = await checker.hasRights(req, res, Measurement);
  if (result != true) return result;
  return await controller.deleteResource(req, res, Measurement);
};

exports.getstream = async (ws, req) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  let result = await checker.isAvailable(req, ws, Measurement);
  if (result != true) return result;
  result = await checker.canRead(req, ws);
  if (result != true) return result;
  result = await checker.hasRights(req, ws, Measurement);
  if (result != true) return result;
  filemanager.upload(ws, req.resource._id, "webm");
};

exports.poststream = async (ws, req) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  let result = await checker.canCreate(req, ws);
  if (result != true) return result;
  result = await checker.hasRightsToCreate(req, ws, [
    "thing",
    "device",
    "feature",
    "tags",
  ]);
  if (result != true) return result;
  ws.on("message", async function incoming(data) {
    const res = await controller.streamResource(req, data, Measurement);
    ws.send(JSON.stringify(res));
  });
};

exports.getfile = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  let result = await checker.isAvailable(req, res, Measurement);
  if (result != true) return result;
  result = await checker.canDelete(req, res);
  if (result != true) return result;
  result = await checker.hasRights(req, res, Measurement);
  if (result != true) return result;
  await filemanager.download(req, res, req.resource._id, "webm");
};
