const runner = require("../computations/runner");
const request = require("../commons/request");
const fs = require("fs");

const base_url = process.env.ELM_URL + process.env.ELM_MODEL;
const base_headers = {
  "User-Agent": "Measurify",
  Connection: "keep-alive",
  Authorization: process.env.ELM_TOKEN,
};
exports.postModel = async function (body) {
  return request.sendJson(base_url, "POST", base_headers, (json = body));
};

exports.postDataset = async function (computation, elm_id, target) {
  let url = base_url + "/" + elm_id + "/trainingset";

  const items = Array.from(computation.items);

  items.forEach((value, i) => {
    if (items[i] == target) items.splice(i, 1);
    else items[i] = '"' + value + '"';
  });

  const select_columns = items.join(",");
  const formData = {
    file: fs.createReadStream(
      process.env.UPLOAD_PATH + "/" + computation._id + ".csv"
    ),
    select_columns: "[" + select_columns + "]",
    target_column: '"' + target + '"',
  };
  return request.sendForm(url, "POST", base_headers, formData);
};

exports.postMeasurify = async function (computation, elm_id) {
  let url = base_url + "/" + elm_id + "/measurify";

  const body = {
    url: "https://127.0.0.1:443/v1/measurements",
    feature: computation.feature,
    items: computation.items,
    filter: computation.filter,
    target: computation.target,
  };
  return request.sendJson(url, "POST", base_headers, body);
};

exports.putTraining = async function (elm_id) {
  let url = base_url + "/" + elm_id;

  const evaluate = {
    mode: "evaluate",
  };
  return request.sendJson(url, "PUT", base_headers, (json = evaluate));
};

exports.putPredict = async function (elm_id, samples) {
  const url = base_url + "/" + elm_id;

  const predict = {
    mode: "predict",
    samples: samples,
  };
  return request.sendJson(url, "PUT", base_headers, (json = predict));
};

exports.getModel = async function (elm_id) {
  let url = base_url + "/" + elm_id;

  return request.sendJson(url, "GET", base_headers);
};

exports.getOutput = async function (elm_id) {
  let url = base_url + "/" + elm_id + "/output";

  return request.sendJson(url, "GET", base_headers);
};
