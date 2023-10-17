const mongoose = require("mongoose");
const controller = require("./controller");
const checker = require("./checker");
const extractData =require("../commons/extractData.js")
const conversion = require("../commons/conversion.js");

exports.get = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const Timesample = mongoose.dbs[req.tenant.database].model("Timesample");
  let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
  result = await checker.canOperate(req, res,"Measurement"); if (result != true) return result;  
  result = await checker.hasRights(req, res, Measurement); if (result != true) return result;
  await checker.ofResource(req, res, 'measurement');
  let select = null;  
  if(req.headers.accept == 'text/csv'){req.query.limit=1000000;select=["values","timestamp"];}
  if (req.headers.accept == 'text/dataframe') {
    try { let list = await conversion.getTimeseriesDataframe(req.query, null, select, null, 100000000, Timesample); return res.status(200).json(list); } 
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
  }
  return await controller.getResourceList( req, res, '{ "timestamp": "desc" }', select, Timesample, null);
};

exports.count = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const Timesample = mongoose.dbs[req.tenant.database].model("Timesample");
  let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
  result = await checker.canOperate(req, res,"Measurement"); if (result != true) return result;  
  result = await checker.hasRights(req, res, Measurement); if (result != true) return result;
  await checker.ofResource(req, res, 'measurement');
  return await controller.getResourceListSize(req, res, Timesample, null);
};

exports.getone = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const Timesample = mongoose.dbs[req.tenant.database].model("Timesample");
  let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
  result = await checker.canOperate(req, res,"Measurement"); if (result != true) return result;  
  result = await checker.hasRights(req, res, Measurement);if (result != true) return result;
  result = await checker.isRelated(req, res, req.params.id_timesample, 'measurement', Timesample); if (result != true) return result;
  req.params.id = req.params.id_timesample;
  return await controller.getResource(req, res, null, Timesample, null);
};

exports.post = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const Timesample = mongoose.dbs[req.tenant.database].model("Timesample");
  let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
  result = await checker.canOperate(req, res,"Measurement","GET");if (result != true) return result; 
  result = await checker.hasRights(req, res, Measurement);if (result != true) return result;
  result = await checker.canOperate(req, res,"Measurement"); if (result != true) return result;  //POST CHECK
  if(req.headers.accept=="text/csv"){result=await extractData.bodyToCSV(req,res);if (result != true) return result;}
  if (req.body.constructor == Array) req.body.forEach(item => item.measurement = req.resource._id)
  else req.body.measurement = req.resource._id;
  return await controller.postResource(req, res, Timesample);
};

exports.delete = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const Timesample = mongoose.dbs[req.tenant.database].model("Timesample");
  let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
  result = await checker.canOperate(req, res,"Measurement"); if (result != true) return result;  
  result = await checker.hasRights(req, res, Measurement); if (result != true) return result;
  await checker.ofResource(req, res, 'measurement');
  return await controller.deleteResourceList(req, res, Timesample, null);
};

exports.deleteone = async (req, res) => {
  const Measurement = mongoose.dbs[req.tenant.database].model("Measurement");
  const Timesample = mongoose.dbs[req.tenant.database].model("Timesample");
  let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
  result = await checker.canOperate(req, res,"Measurement"); if (result != true) return result;  
  result = await checker.hasRights(req, res, Measurement);if (result != true) return result;
  result = await checker.isRelated(req, res, req.params.id_timesample, 'measurement', Timesample); if (result != true) return result;
  req.params.id = req.params.id_timesample;
  return await controller.deleteResource(req, res, Timesample);
};
