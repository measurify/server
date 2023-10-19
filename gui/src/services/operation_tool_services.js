import { GetToken, api_url } from "./http_operations";
import { instance } from "./http_operations";
import { GetPrefixName, prefixFileSeparator } from "./file_operations";
import { saveAs } from "file-saver";
export let logsManager = {
  PushLog: (obj) => {},
  RemoveLog: (id) => {},
  ClearLogs: () => {},
};

//test logger
export function testLogger() {
  let i = 0;
  setInterval(() => {
    logsManager.PushLog({
      type: "info",
      msg:
        "----------------------------------------Log Testing " +
        i +
        " ------------------------------------\n",
    });
    i++;
  }, 500);
}

//upload file containing history steps
export async function postHistoryFile(file, ovd, csvSep, arrSep, floatSep) {
  const filename = file.name;
  const expName = GetPrefixName(file);

  const data = new FormData();
  data.append("file", file);
  //data.append("file", createReadStream(file));

  let url =
    ovd === false || ovd === undefined
      ? api_url +
        "/experiments/" +
        expName +
        "/file?sep=" +
        csvSep +
        "&sepArray=" +
        arrSep +
        "&sepFloat=" +
        floatSep
      : api_url +
        "/experiments/" +
        expName +
        "/file/?override=true&sep=" +
        csvSep +
        "&sepArray=" +
        arrSep +
        "&sepFloat=" +
        floatSep;

  const tempH = {
    "Content-Type": "multipart/form-data",
    "Cache-Control": "no-cache",
    Authorization: GetToken(),
  };
  const options = {
    headers: tempH,
  };

  let response;
  try {
    response = await instance.put(url, data, options);
    logsManager.PushLog({
      type: "info",
      msg:
        filename +
        ", successfully posted: Added: [ " +
        response.data.report.success.join(", ") +
        " ] Ignored: [" +
        response.data.report.ignored.join(", ") +
        " ] Overridden: [" +
        response.data.report.overridden.join(", ") +
        " ]\n",
    });
  } catch (error) {
    logsManager.PushLog({
      type: "error",
      msg:
        filename +
        " was not posted: " +
        error.response.data.message +
        " " +
        (error.response.data.details !== undefined
          ? error.response.data.details + "\n"
          : ""),
    });
  }
}

//upload a single step
export async function postHistoryStep(expName, body, ovd) {
  let url =
    ovd === false || ovd === undefined
      ? api_url + "/experiments/" + expName
      : api_url + "/experiments/" + expName + "?override=true";

  const step = body.history.add[0].step;
  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: GetToken(),
    },
  };
  let response;
  try {
    response = await instance.put(url, JSON.stringify(body), options);
    logsManager.PushLog({
      type: "info",
      msg:
        "Step " +
        step +
        ", successfully posted: Added: [ " +
        response.data.report.success.join(", ") +
        " ] Ignored: [" +
        response.data.report.ignored.join(", ") +
        " ] Overridden: [" +
        response.data.report.overridden.join(", ") +
        " ]\n",
    });
  } catch (error) {
    logsManager.PushLog({
      type: "error",
      msg:
        "Step " +
        step +
        " was not posted: " +
        error.response.data.message +
        " " +
        (error.response.data.details !== undefined
          ? error.response.data.details + "\n"
          : ""),
    });
  }
}

export async function downloadHistory(
  experiment_id,
  csvSep,
  arrSep,
  floatSep,
  compress = undefined
) {
  const url =
    "experiments/" +
    experiment_id +
    "/history?sep=" +
    csvSep +
    "&sepArray=" +
    arrSep +
    "&sepFloat=" +
    floatSep;
  const fileName = experiment_id + prefixFileSeparator + "history.csv";

  try {
    const data = await getCSV(url);
    const blob = new Blob([data]);
    let file = null;
    if (compress === undefined || compress === false) {
      saveAs(blob, fileName);
    } else {
      file = new File([blob], fileName);
    }

    logsManager.PushLog({
      type: "info",
      msg: fileName + " successfully downloaded.\n",
    });
    return file;
  } catch (error) {
    console.error(error);
  }
}

export async function getCSV(resource_path, headers = {}) {
  const url = api_url + "/" + resource_path;
  headers["Authorization"] = GetToken();
  const config = {
    method: "get",
    url: url,
    headers: headers,
  };

  let response;
  try {
    response = await instance(config);
    return response.data;
  } catch (error) {
    console.error(error);
    logsManager.PushLog({
      type: "error",
      msg:
        error.response.data.message +
        " " +
        (error.response.data.details !== undefined
          ? error.response.data.details
          : ""),
    });
  }
}

export async function deleteHistorySteps(selected, toDelete) {
  const url = api_url + "/experiments/" + selected;

  const config = {
    method: "put",
    url: url,
    headers: {
      Authorization: GetToken(),
    },
    data: { history: { remove: toDelete } },
  };

  let response;
  try {
    response = await instance(config);
    logsManager.PushLog({
      type: "info",
      msg: "Successfully deleted steps with id: " + toDelete.join(" - ") + "\n",
    });
  } catch (error) {
    console.error(error);
    logsManager.PushLog({
      type: "error",
      msg:
        error.response.data.message +
        " " +
        (error.response.data.details !== undefined
          ? error.response.data.details + "\n"
          : "\n"),
    });
  }
}
//download questionnaires/measurements
export async function downloadMeasurements(
  feature,
  csvSep,
  arrSep,
  floatSep,
  limit = -1,
  rename = undefined,
  select = [],
  compress = undefined
) {
  console.log({ feature, csvSep, arrSep, floatSep, limit, rename, select });
  let url = 'measurements/?filter={"feature":"' + feature + '"}&limit=' + limit;
  if (select.length !== 0) {
    url = url + '&select=["' + select.join('","') + '"]';
  }
  if (rename !== undefined) {
    url = url + "&rename=" + JSON.stringify(rename);
  }

  url =
    url + "&sep=" + csvSep + "&sepArray=" + arrSep + "&sepFloat=" + floatSep;

  const fileName = feature + prefixFileSeparator + ".csv";

  try {
    const data = await getCSV(url, { Accept: "text/csv+" });
    const blob = new Blob([data]);
    let file = null;
    if (compress === undefined || compress === false) {
      saveAs(blob, fileName);
    } else {
      file = new File([blob], fileName);
    }

    logsManager.PushLog({
      type: "info",
      msg: fileName + " successfully downloaded.\n",
    });
    return file;
  } catch (error) {
    console.error(error);
  }
}

export function calculateAggregatedKPI(
  measurements,
  devices,
  device,
  deviceFeatures = undefined
) {
  const _measurements = measurements.filter(
    (m) => !m.feature.includes("_description") && m.device === device
  );
  const _aggregated = [];
  const _device = devices.find((d) => d._id === device);
  _device.features
    .filter((f) => !f.includes("_description"))
    .forEach((f) => {
      if (_measurements.filter((m) => m.feature === f).length === 0) return;
      const _measValues = _measurements
        .filter((m) => m.feature === f)
        .map((m) => m.samples[0].values);
      const feat = deviceFeatures.find((df) => df._id === f);
      const l = _measValues[0].length;
      const _maxs = Array(l).fill(0);
      const _mins = Array(l).fill(0);
      const _means = Array(l).fill(0);
      const _stds = Array(l).fill(0);
      for (let i = 0; i < l; i++) {
        _maxs[i] = Math.max(..._measValues.map((v) => v[i]));
        _mins[i] = Math.min(..._measValues.map((v) => v[i]));
        _means[i] =
          _measValues.map((v) => v[i]).reduce((a, b) => a + b, 0) /
          _measValues.length;
        _stds[i] = Math.sqrt(
          _measValues.map((v) => v[i]).reduce((a, b) => a + b, 0) /
            _measValues.length
        );
      }
      _aggregated.push({
        device: device,
        feature: f,
        techRQs: feat.description,
        techKpi: feat.items.map((i) => i.name),
        techLoggingReqs: feat.items.map((i) => i.description),
        kpiIndex: f.split("_")[1],
        maxs: _maxs,
        mins: _mins,
        means: _means,
        stds: _stds,
      });
    });

  return _aggregated;
}
