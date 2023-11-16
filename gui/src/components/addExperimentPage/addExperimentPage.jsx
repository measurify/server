import React, { useEffect, useState } from "react";
import locale from "../../common/locale";
import { addFields, addTypes } from "../../configManager";
import {
  post_generic,
  get_generic,
  post_file_generic,
} from "../../services/http_operations";
import { removeDefaultElements } from "../../services/misc_functions";
import { useSearchParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import { Form, Nav } from "react-bootstrap";
import { FormManager } from "../formManager/formManager";
import { FormFile } from "../formFileComp/formFile";

import {
  sortObject,
  maintainEmptyElement,
  maintainEmptyElements,
} from "../../services/objects_manipulation";
import ImportExportValues from "../importExportValues/importExportValues";
import { FormatDate } from "../../services/misc_functions";

const cloneDeep = require("clone-deep");

export default function AddExperimentPage(props) {
  //get resource and id from url params
  const resource = "experiments";
  //get from attribute from search param

  const [searchParams, setSearchParams] = useSearchParams();

  //redirect hook
  const navigate = useNavigate();
  //type of input to post resources
  const [postType, setPostType] = useState("form");
  //message for user
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  //import message for user
  const [importMsg, setImportMsg] = useState("");
  //values
  const [values, setValues] = useState(cloneDeep(addFields[resource]));
  //disabled
  const [disabledFields, setDisabledFields] = useState({
    metadata: { name: true },
  });

  //protocols
  const [protocols, setProtocols] = useState();

  //file upload state
  const [file, setFile] = useState(undefined);
  const [csvContent, setCsvContent] = useState(null);
  const [contentPlain, setContentPlain] = useState(null);

  //useeffect to get protocols
  useEffect(() => {
    const fetchData = async (qs = {}) => {
      try {
        // get the protocols data from the api
        const response = await get_generic("protocols", qs);

        setProtocols(response.docs.map((e) => e._id));
      } catch (error) {
        console.error(error);
      }
    };
    const qs = { limit: -1, select: ["_id", "metadata", "topics"] };
    fetchData(qs);
  }, [props, searchParams]);

  //useeffect to get resource if required (for the "duplicate" actions)
  useEffect(() => {
    const fetchDataDuplicate = async (qs = {}) => {
      try {
        // get the data from the api
        const response = await get_generic(resource, qs);

        const data = response.docs[0];
        let tmpValues = cloneDeep(values);

        //add metadata and protocol fields
        tmpValues["protocol"] = "";
        tmpValues["metadata"] = [{ name: "", value: "" }];

        //disable protocol fields
        const tmpDisabled = cloneDeep(disabledFields);
        tmpDisabled["protocol"] = true;

        setDisabledFields(tmpDisabled);

        tmpValues = sortObject(data, tmpValues);

        Object.entries(tmpValues).forEach((e) => {
          if (e[0].toLowerCase().includes("date")) {
            tmpValues[e[0]] = FormatDate(e[1]);
          }
        });

        //add "_copy" to id to avoid duplicate key error

        tmpValues["_id"] = tmpValues["_id"] + "_copy";

        tmpValues = maintainEmptyElements(tmpValues, addFields, resource);
        setValues(tmpValues);
      } catch (error) {
        console.error(error);
      }
    };

    if (searchParams.get("from") === null || searchParams.get("from") === "")
      return;
    const fst = { _id: searchParams.get("from") };
    const qs = {
      filter: JSON.stringify(fst),
    };
    fetchDataDuplicate(qs);
  }, [searchParams, resource]);

  //return if page shouldn't be rendered
  if (addFields[resource] === undefined)
    return <div>This entity cannot be posted</div>;

  //handle changes
  const handleChanges = (val, path) => {
    let tmpVals = cloneDeep(values);
    let valuesPtr = tmpVals;

    let i;
    let lastIndexNumber = -1;
    for (i = 0; i < path.length - 1; i++) {
      valuesPtr = valuesPtr[path[i]];
      if (typeof path[i] === "number") lastIndexNumber = i;
    }
    if (typeof path[i] === "number") lastIndexNumber = i;
    valuesPtr[path[i]] = val;
    //check if an array is present
    if (lastIndexNumber !== -1) {
      //only string and numbers are allowed as item, with this version
      const item = typeof val === "number" ? NaN : "";
      tmpVals = maintainEmptyElement(
        tmpVals,
        path.slice(0, lastIndexNumber),
        addFields,
        resource,
        item
      );
    }
    setValues(tmpVals);
  };

  const handleDeleteItemArray = (path) => {
    let val = cloneDeep(values);
    let tmpPtr = val;

    let i;
    for (i = 0; i < path.length - 1; i++) {
      if (path[i] === undefined) break;
      tmpPtr = tmpPtr[path[i]];
    }

    const removed = tmpPtr.splice(path[i], 1);

    const item = typeof removed[0] === "number" ? NaN : "";
    val = maintainEmptyElement(
      val,
      path.slice(0, i),
      addFields,
      resource,
      item
    );
    setValues(val);
  };
  //handle way selector to post new entity
  const handleTypeSelect = (eventKey) => {
    setPostType(eventKey);
    setMsg("");
    setIsError(false);
  };

  //handle changes to selected protocols
  const handleProtocolChange = async (e) => {
    e.preventDefault();

    const selectedProtocol = e.target.value;
    const fst = { _id: e.target.value };
    const qs = { filter: JSON.stringify(fst) };
    try {
      const res = await get_generic("protocols", qs);
      const protocol = res.docs[0];

      const metadata = [];
      for (let i = 0; i < protocol.metadata.length; i++) {
        if (protocol.metadata[i].type === "scalar") {
          metadata.push({
            name: protocol.metadata[i].name,
            value: 0,
          });
        }
        if (protocol.metadata[i].type === "text") {
          metadata.push({
            name: protocol.metadata[i].name,
            value: protocol.metadata[i].name + "_Name",
          });
        }
        if (protocol.metadata[i].type === "vector") {
          metadata.push({
            name: protocol.metadata[i].name,
            value: [0],
          });
        }
      }

      const tmpValues = cloneDeep(values);
      tmpValues["protocol"] = selectedProtocol;
      if (metadata.length !== 0) tmpValues["metadata"] = metadata;

      const tmpDisabled = cloneDeep(disabledFields);
      tmpDisabled["protocol"] = true;

      setDisabledFields(tmpDisabled);
      //setProtocol(selectedProtocol);
      setValues(tmpValues);
    } catch (error) {
      console.error(error);
    }
  };

  //post the body for forms
  const postBody = async (e) => {
    e.preventDefault();
    //deep clone values
    let token = undefined;
    let body = cloneDeep(values);
    if (body.token !== undefined) {
      token = body.token;
      delete body.token;
    }

    let tmpValues = cloneDeep(body);
    removeDefaultElements(tmpValues);
    if (tmpValues["protocol"] === undefined) {
      setMsg("Please, select a protocol");
      setIsError(true);
      return;
    }
    if (tmpValues["_id"] === "") {
      setMsg("Please, define an _id");
      setIsError(true);
      return;
    }
    if (tmpValues["_id"].includes("#")) {
      setMsg("Please, does not include an '#' in the _id");
      setIsError(true);
      return;
    }
    if (tmpValues["state"] === "") {
      setMsg("Please, select a state");
      setIsError(true);
      return;
    }
    //convert date to avoid issues with timezone (with GMT+ X timezones, results in a wrong date)
    try {
      if (
        tmpValues["startDate"] !== undefined &&
        tmpValues["startDate"] !== ""
      ) {
        const dt = new Date(tmpValues["startDate"]);
        const timestamp = dt.getTime() - dt.getTimezoneOffset() * 60000;
        tmpValues["startDate"] = new Date(timestamp).toISOString();
      }
      if (tmpValues["endDate"] !== undefined && tmpValues["endDate"] !== "") {
        const dt = new Date(tmpValues["endDate"]);
        const timestamp = dt.getTime() - dt.getTimezoneOffset() * 60000;
        tmpValues["endDate"] = new Date(timestamp).toISOString();
      }
    } catch (error) {
      setMsg("Invalid startDate or endDate, please check it again");
      setIsError(true);
      return;
    }

    let res;
    try {
      const resp = await post_generic(
        resource,
        JSON.stringify(tmpValues),
        token
      );
      res = resp.response;
      setMsg(res.statusText);
      setIsError(false);
    } catch (error) {
      console.error(error);
      res = error.error.response;
      console.debug({
        message: error.error.response.data.message,
        details: error.error.response.data.details,
      });

      let det = "";
      if (error.error.response.data.details.includes("duplicate key")) {
        det =
          locale().duplicate_resource_error +
          " " +
          error.error.response.data.details.slice(
            error.error.response.data.details.indexOf("{") + 1,
            -1
          );
      }
      //default case: show details from error message
      else {
        det = error.error.response.data.details;
      }
      //add details
      setMsg(error.error.response.data.message + " : " + det);
      setIsError(true);
      return;
    }
    if (res.status === 200) {
      window.alert("Experiment successufully posted!");
      navigate("/" + resource);
    }
  };

  const back = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const importValues = (importedValues) => {
    try {
      const imported = JSON.parse(importedValues);
      const template = cloneDeep(values);
      if (imported["state"] === null) imported["state"] = NaN;

      template["protocol"] = "";
      template["metadata"] = [{ name: "", value: "" }];
      const sorted = sortObject(imported, template);

      if (
        sorted["_id"] === undefined &&
        sorted["owner"] === undefined &&
        sorted["protocol"] === undefined &&
        sorted["metadata"] === undefined
      ) {
        setImportMsg(locale().error_imported_file);
        return;
      }
      setImportMsg("");

      //remove history when present
      if (sorted["history"] !== undefined) delete sorted["history"];
      setValues(sorted);

      const tmpDisabled = cloneDeep(disabledFields);
      tmpDisabled["protocol"] = true;

      setDisabledFields(tmpDisabled);
    } catch (error) {
      setImportMsg(locale().error_imported_file);
      console.error(error);
    }
  };

  const postFile = async (e) => {
    e.preventDefault();
    let res;
    if (file === undefined) {
      setMsg(locale().no_file);
      setIsError(true);
      return;
    }
    if (file.name.endsWith(".csv")) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const resp = await post_file_generic(resource, formData);

        res = resp.response;
        setMsg(res.statusText);
        setIsError(false);
      } catch (error) {
        console.error(error);
        res = error.error.response;
        console.debug({
          message: error.error.response.data.message,
          details: error.error.response.data.details,
        });

        let det = "";
        if (error.error.response.data.details.includes("duplicate key")) {
          det =
            locale().duplicate_resource_error +
            " " +
            error.error.response.data.details.slice(
              error.error.response.data.details.indexOf("{") + 1,
              -1
            );
        }
        //default case: show details from error message
        else {
          det = error.error.response.data.details;
        }
        //add details
        setMsg(error.error.response.data.message + " : " + det);
        setIsError(true);
      }
    }
    if (file.name.endsWith(".json")) {
      if (JSON.parse(contentPlain)._id.includes("#")) {
        setMsg("Please, does not include an '#' in the _id");
        setIsError(true);
        return;
      }
      try {
        const resp = await post_generic(resource, contentPlain, undefined);
        res = resp.response;
        setMsg(res.statusText);
        setIsError(false);
      } catch (error) {
        console.error(error);
        res = error.error.response;
        console.debug({
          message: error.error.response.data.message,
          details: error.error.response.data.details,
        });

        let det = "";
        if (
          error.error.response.data.details !== undefined &&
          error.error.response.data.details.includes("duplicate key")
        ) {
          det =
            locale().duplicate_resource_error +
            " " +
            error.error.response.data.details.slice(
              error.error.response.data.details.indexOf("{") + 1,
              -1
            );
        } else if (
          error.error.response.data.details === undefined &&
          error.error.response.data.message.includes("Unexpected token")
        ) {
          det =
            "The selected file cannot be uploaded because it contains errors.";
        }
        //default case: show details from error message
        else {
          det = error.error.response.data.details;
        }
        //add details
        setMsg(error.error.response.data.message + " : " + det);
        setIsError(true);
      }
    }

    if (res.status === 200) {
      window.alert("Experiment successufully posted!");

      navigate("/" + resource);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        Add resource &nbsp;
        <b>{resource}</b>
      </header>
      <main className="page-content">
        <Nav
          justify
          variant="tabs"
          className="justify-content-center"
          onSelect={handleTypeSelect}
          defaultActiveKey="form"
        >
          {addTypes[resource].includes("form") && (
            <Nav.Item>
              <Nav.Link eventKey="form">Form</Nav.Link>
            </Nav.Item>
          )}

          {addTypes[resource].includes("file") &&
            searchParams.get("from") === null && (
              <Nav.Item>
                <Nav.Link eventKey="file">File</Nav.Link>
              </Nav.Item>
            )}
        </Nav>
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 2 + "px",
            borderStyle: "solid",
            borderColor: "rgba(18, 54, 81, 0.9)",
            borderWidth: 1 + "px",
            width: 100 + "%",
            height: "fit-content",
          }}
        >
          {postType === "form" &&
            (searchParams.get("from") === null ||
              searchParams.get("from") === "") && (
              <ImportExportValues
                values={values}
                importValues={importValues}
                importMsg={importMsg}
              />
            )}
          {postType === "form" && protocols !== undefined && (
            <div style={{ margin: 5 + "px" }}>
              {(searchParams.get("from") === null ||
                searchParams.get("from") === "") && (
                <Form.Select
                  aria-label={locale().select + " protocol"}
                  onChange={handleProtocolChange}
                  value={values["protocol"]}
                >
                  <option>{locale().select} protocol</option>
                  {React.Children.toArray(
                    protocols.map((e) => {
                      return <option value={e}>{e}</option>;
                    })
                  )}
                </Form.Select>
              )}
              <br />
              <FormManager
                values={values}
                resource={resource}
                functionalFields={addFields}
                disabledFields={disabledFields}
                handleChangesCallback={handleChanges}
                arrayDeleteCallback={handleDeleteItemArray}
                submitFunction={postBody}
                backFunction={back}
              />
              <font
                style={{
                  marginLeft: 5 + "px",
                  color: isError ? "red" : "black",
                }}
              >
                {msg}
              </font>
            </div>
          )}
          {postType === "file" && (
            <div style={{ margin: 5 + "px" }}>
              <FormFile
                submitFunction={postFile}
                backFunction={back}
                setCsvContent={setCsvContent}
                setContentPlain={setContentPlain}
                setFile={setFile}
                contentPlain={contentPlain}
                csvContent={csvContent}
                setMsg={setMsg}
                setIsError={setIsError}
              />
              <font
                style={{
                  marginLeft: 5 + "px",
                  color: isError ? "red" : "black",
                }}
              >
                {msg}
              </font>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
