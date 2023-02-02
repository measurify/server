import React, { useEffect, useState, useContext } from "react";
import locale from "../../common/locale";
import { addFields, addTypes } from "../../configManager";
import {
  post_generic,
  get_generic,
  post_file_generic,
} from "../../services/http_operations";
import {
  isDefault,
  removeDefaultElements,
} from "../../services/misc_functions";
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { Nav } from "react-bootstrap";
import { FormManager } from "../formManager/formManager";
import { FormFile } from "../formFileComp/formFile";

import {
  sortObject,
  maintainEmptyElement,
  maintainEmptyElements,
} from "../../services/objects_manipulation";
import AppContext from "../../context";
import { fetchedPageTypes, fetchedPageData } from "../../configManager";
const cloneDeep = require("clone-deep");

/*
APPUNTI FORM

 <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>
              TEXT
            </Form.Label>
            <Form.Control type="text" placeholder="PLACEHOLDER TEXT" />
            <Form.Text className="text-muted">
              LABEL
            </Form.Text>
          </Form.Group>

tipi consentiti nel form control:
text | number (verifica del numero automatica) | email (verifica email automatica) | file | checkbox

*/

export default function AddPage(props) {
  //get resource and id from url params
  let { resource } = useParams();
  //get from attribute from search param

  const [searchParams, setSearchParams] = useSearchParams();

  //check if resource was passed as params - used for tenants creation
  if (props.resource !== undefined) resource = props.resource;

  //redirect hook
  const navigate = useNavigate();
  //type of input to post resources
  const [postType, setPostType] = useState("form");
  //message for user
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  //deep copy addOption dictionary without any references
  const [values, setValues] = useState(cloneDeep(addFields[resource]));

  //file upload state
  const [file, setFile] = useState(undefined);
  const [contentHeader, setContentHeader] = useState(null);
  const [contentBody, setContentBody] = useState(null);
  const [contentPlain, setContentPlain] = useState(null);

  const context = useContext(AppContext);
  let myFetched;
  if (context !== undefined) myFetched = context.fetched;
  else myFetched = {};

  useEffect(() => {
    /////////////FETCH REQUIRED RESOURCES
    const fetchRequiredData = async (res) => {
      if (myFetched.data[res] !== undefined) return;
      // get the data from the api
      try {
        const response = await get_generic(res, {
          limit: 100,
          select: ["_id", "username", "name"],
        });
        myFetched.UpdateData(
          response.docs.map((e) => {
            return {
              _id: e._id,
              optionalLabel:
                e.name !== undefined
                  ? e.name
                  : e.username !== undefined
                  ? e.username
                  : undefined,
            };
          }),
          res
        );
      } catch (error) {
        console.log(error);
      }
    };
    if (fetchedPageData[resource] !== undefined) {
      Object.values(fetchedPageData[resource]).forEach((e) =>
        fetchRequiredData(e)
      );
    }
  }, []);

  //useeffect to get resource if required
  useEffect(() => {
    const fetchSingle = async (qs = {}) => {
      // get the data from the api
      const response = await get_generic(resource, qs);

      const data = response.docs[0];
      let tmpValues = cloneDeep(values);

      tmpValues = sortObject(data, tmpValues);

      tmpValues = maintainEmptyElements(tmpValues, addFields, resource);
      setValues(tmpValues);
    };

    if (searchParams.get("from") === null || searchParams.get("from") === "")
      return;
    const fst = { _id: searchParams.get("from") };
    const qs = { filter: JSON.stringify(fst) };
    fetchSingle(qs);
  }, [searchParams, resource]);

  //return if page shouldn't be rendered
  if (addFields[resource] === undefined)
    return <div>This entity cannot be posted</div>;

  //handle changes
  const handleChanges = (val, path, ignoreAdd = false) => {
    let tmpVals = cloneDeep(values);
    let valuesPtr = tmpVals;

    let i;
    let lastIndexNumber = -1;
    for (i = 0; i < path.length - 1; i++) {
      valuesPtr = valuesPtr[path[i]];
      if (typeof path[i] === "number") lastIndexNumber = i;
    }
    valuesPtr[path[i]] = val;
    if (typeof path[i] === "number") lastIndexNumber = i;

    if (ignoreAdd === false && lastIndexNumber !== -1)
      tmpVals = maintainEmptyElement(
        tmpVals,
        path.slice(0, lastIndexNumber),
        addFields,
        resource
      );
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

    tmpPtr.splice(path[i], 1);

    val = maintainEmptyElement(val, path.slice(0, i), addFields, resource);
    setValues(val);
  };
  //handle way selector to post new entity
  const handleTypeSelect = (eventKey) => {
    setPostType(eventKey);
    setMsg("");
    setIsError(false);
  };

  const back = (e) => {
    e.preventDefault();
    navigate(-1);
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
      console.log(error);
      res = error.error.response;
      console.log({
        message: res.data.message,
        details: res.data.details,
      });

      let det = "";
      if (res.data.details.includes("duplicate key")) {
        det =
          locale().duplicate_resource_error +
          " " +
          res.data.details.slice(res.data.details.indexOf("{") + 1, -1);
      }
      //default case: show details from error message
      else {
        det = res.data.details;
      }
      //add details
      setMsg(res.data.message + " : " + det);
      setIsError(true);
    }

    if (res.status === 200) {
      if (resource !== "tenants") myFetched.RemoveData(resource);
      window.alert(locale().resource_successfully_posted);
      navigate("/" + resource);
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
        console.log(error);
        res = error.error.response;
        console.log({
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
      try {
        const resp = await post_generic(resource, contentPlain, undefined);
        res = resp.response;
        setMsg(res.statusText);
        setIsError(false);
      } catch (error) {
        console.log(error);
        res = error.error.response;
        console.log({
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
          det = locale().generic_file_post_error;
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
      window.alert(locale().resource_successfully_posted);
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
          {postType === "form" && (
            <div style={{ margin: 5 + "px" }}>
              <FormManager
                values={values}
                resource={resource}
                functionalFields={addFields}
                disabledFields={{}}
                handleChangesCallback={handleChanges}
                arrayDeleteCallback={handleDeleteItemArray}
                submitFunction={postBody}
                backFunction={back}
              />
              <br />
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
                setContentBody={setContentBody}
                setContentHeader={setContentHeader}
                setContentPlain={setContentPlain}
                setFile={setFile}
                contentPlain={contentPlain}
                contentHeader={contentHeader}
                contentBody={contentBody}
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
