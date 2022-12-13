import { GetToken, api_url } from "./http_operations";
import { instance } from "./http_operations";

import { saveAs } from "file-saver";
export let logsManager = {
  PushLog: (obj) => {},
  RemoveLog: (id) => {},
  ClearLogs: () => {},
};

//experiment name separator
const experimentFileSeparator = "#";

//upload file containing history steps
export async function postHistoryFile(file, ovd, csvSep, arrSep, floatSep) {
  const filename = file.name;
  const expName = filename.split(experimentFileSeparator)[0];

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
    console.log("error in response");
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
    console.log("error in response");
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
  const fileName = experiment_id + "#history.csv";

  try {
    const data = await getHistoryCSV(url);
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
    console.log(error);
  }
}

export async function getHistoryCSV(resource_path) {
  const url = api_url + "/" + resource_path;
  const config = {
    method: "get",
    url: url,
    headers: {
      Authorization: GetToken(),
    },
  };

  let response;
  try {
    response = await instance(config);
    return response.data;
  } catch (error) {
    console.log("error in response");
    console.log(error);
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
    console.log("error in response");
    console.log(error);
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
