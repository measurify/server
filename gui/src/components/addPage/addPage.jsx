import React, { useEffect, useState } from "react";
import locale from "../../common/locale";
import {
  pages,
  aliasPages,
  addFields,
  addTypes,
  fetchedPageTypes,
} from "../../config";
import { fetchedData } from "../../fetchedData";
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

import {
  Button,
  Form,
  Nav,
  InputGroup,
  Accordion,
  Table,
  FloatingLabel,
} from "react-bootstrap";
import { FormManager } from "../formManager/formManager";

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
  //deep copy addOption dictionary without any references
  const [values, setValues] = useState(cloneDeep(addFields[resource]));

  //file upload state
  const [file, setFile] = useState(undefined);
  const [contentHeader, setContentHeader] = useState(undefined);
  const [contentBody, setContentBody] = useState(undefined);
  const [contentPlain, setContentPlain] = useState(undefined);

  //useeffect to get resource if required
  useEffect(() => {
    const fetchData = async (qs = {}) => {
      // get the data from the api
      const response = await get_generic(resource, qs);

      //test with deep copy
      const test = cloneDeep(values);
      //for each key of addFields, check if it's present from the fetched data and put it into values (if not default for arrays)
      Object.keys(test).map((k) => {
        if (response.docs[0][k] !== undefined) {
          if (Array.isArray(response.docs[0][k])) {
            if (!isDefault(response.docs[0][k])) {
              if (response.docs[0][k][0].constructor === Object) {
                const keys = Object.keys(test[k][0]);
                const temp = response.docs[0][k].map((e) => {
                  const assign = {};
                  keys.map((k) => (assign[k] = null));
                  return Object.assign(assign, e);
                });
                test[k] = temp.concat(test[k]);
              } else {
                test[k] = response.docs[0][k].concat(test[k]);
              }
            }
          } else {
            test[k] = response.docs[0][k];
          }
        }
      });
      setValues(test);
      // set state with the result
    };
    if (searchParams.get("from") === null || searchParams.get("from") === "")
      return;
    const fst = { _id: searchParams.get("from") };
    const qs = { filter: JSON.stringify(fst) };
    fetchData(qs);
  }, [props, searchParams]);

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
    valuesPtr[path[i]] = val;
    if (lastIndexNumber !== -1)
      tmpVals = maintainEmptyElement(tmpVals, path.slice(0, lastIndexNumber));

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

    val = maintainEmptyElement(val, path.slice(0, i));
    setValues(val);
  };
  //handle way selector to post new entity
  const handleTypeSelect = (eventKey) => setPostType(eventKey);

  const maintainEmptyElement = (original, path, item = undefined) => {
    let tmp = cloneDeep(original);
    let tmpPtr = tmp;
    let addFldTmp = cloneDeep(addFields[resource]);
    const tmpPath = [...path];

    //get more nested array
    for (let i = 0; i < tmpPath.length; i++) {
      if (path[i] === undefined) break;
      tmpPtr = tmpPtr[path[i]];
    }

    //get the appropriate item, if possible
    for (let i = 0; i < tmpPath.length; i++) {
      if (path[i] === undefined) break;
      if (addFldTmp === undefined) break;
      //ignore indexes for addFldTmp
      if (typeof path[i] === "number") addFldTmp = addFldTmp[0];
      else addFldTmp = addFldTmp[path[i]];
    }

    //non array case
    if (!Array.isArray(addFldTmp)) return tmp;

    //add item according to addfield dictionary
    if (addFldTmp !== undefined) {
      //0-length array
      if (tmpPtr.length === 0) {
        if (addFldTmp[0].constructor === Object) {
          tmpPtr.push({
            ...addFldTmp[0],
          });
        } else {
          tmpPtr.push("");
        }
      }
      //else 0-length array
      else {
        if (tmpPtr[0].constructor === Object) {
          //check if there are no default elements in array
          if (tmpPtr.filter((e) => isDefault(e)).length === 0) {
            tmpPtr.push({
              ...addFldTmp[0],
            });
          }
        } else {
          if (!tmpPtr.includes("")) {
            tmpPtr.push("");
          }
        }
      }
    }

    //add item according to params
    if (item !== undefined && addFldTmp === undefined) {
      if (tmpPtr.length === 0) {
        if (item.constructor === Object) {
          tmpPtr.push({ ...item });
        } else {
          tmpPtr.push(item);
        }
      }
      //else 0-length array
      else {
        if (tmpPtr.filter((e) => isDefault(e)).length === 0) {
          if (item.constructor === Object) {
            tmpPtr.push({ ...item });
          } else {
            tmpPtr.push(item);
          }
        }
      }
    }
    return tmp;
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
    } catch (error) {
      console.log(error);
      res = error.error.response;
      //add details
      setMsg(
        error.error.response.data.message +
          " : " +
          error.error.response.data.details
      );
    }

    if (res.status === 200) {
      if (window.confirm("Back to resource page?") == true) {
        if (resource === "tenants") navigate("/");
        else navigate("/" + resource);
      } else {
      }
    }
  };

  const postFile = async (e) => {
    e.preventDefault();
    let res;
    if (file.name.endsWith(".csv")) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const resp = await post_file_generic(resource, formData);

        res = resp.response;
        setMsg(res.statusText);
      } catch (error) {
        console.log(error);

        res = error.error.response;
        //add details
        setMsg(
          error.error.response.data.message +
            " : " +
            error.error.response.data.details
        );
      }
    }
    if (file.name.endsWith(".json")) {
      console.log(contentPlain);
      try {
        const resp = await post_generic(resource, contentPlain, undefined);
        res = resp.response;
        setMsg(res.statusText);
      } catch (error) {
        console.log(error);
        res = error.error.response;
        //add details
        setMsg(
          error.error.response.data.message +
            " : " +
            error.error.response.data.details
        );
      }
    }

    if (res.status === 200) {
      if (window.confirm("Back to resource page?") == true) {
        navigate("/" + resource);
      } else {
      }
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
              />

              <br />
              <font style={{ marginLeft: 5 + "px" }}>{msg}</font>
            </div>
          )}
          {postType === "file" && (
            <div style={{ margin: 5 + "px" }}>
              <Form onSubmit={postFile}>
                <Form.Label>
                  <b>{locale().select_file}</b>
                </Form.Label>
                <Form.Control
                  className="mb-3"
                  type="file"
                  accept=".csv, .json"
                  label="File"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFile(file);
                    console.log(file);
                    const fileReader = new FileReader();

                    fileReader.onloadend = () => {
                      const content = fileReader.result;
                      if (file.name.endsWith(".csv")) {
                        const regex = new RegExp("\r", "g");
                        let splitted = content.replace(regex, "").split("\n");

                        setContentHeader(splitted[0]);
                        splitted.splice(0, 1);
                        setContentBody(splitted);
                      }
                      if (file.name.endsWith(".json")) {
                        const content = fileReader.result;
                        setContentPlain(content);
                      }
                    };
                    fileReader.readAsText(file);
                  }}
                />
                {contentBody !== undefined && contentHeader !== undefined && (
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        {locale().file_content}
                      </Accordion.Header>
                      <Accordion.Body
                        style={{ overflow: "scroll", height: 70 + "vh" }}
                      >
                        <Table responsive striped bordered hover>
                          <thead>
                            <tr>
                              {React.Children.toArray(
                                contentHeader.split(",").map((h) => {
                                  return <th>{h}</th>;
                                })
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {React.Children.toArray(
                              contentBody.map((e) => {
                                return (
                                  <tr>
                                    {React.Children.toArray(
                                      e.split(",").map((h) => {
                                        return <td>{h}</td>;
                                      })
                                    )}
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </Table>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                )}
                {contentPlain !== undefined && (
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        {locale().file_content}
                      </Accordion.Header>
                      <Accordion.Body
                        style={{ overflow: "scroll", height: 70 + "vh" }}
                      >
                        {contentPlain}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                )}
                <Button variant="primary" type="submit">
                  Submit
                </Button>
                <br />
                <font style={{ marginLeft: 5 + "px" }}>{msg}</font>
              </Form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
