import React, { useContext, useEffect } from "react";
import locale from "../../common/locale";
import { nonDefaultLength, Capitalize } from "../../services/misc_functions";
import { Button, Form, Accordion, Container, Row, Col } from "react-bootstrap";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import AppContext from "../../context";
<<<<<<< HEAD
import { fetchedPageTypes, fetchedPageData } from "../../config";
=======
import { fetchedPageTypes, fetchedPageData, guidelines } from "../../config";

/////////form width constant variables
//row name
const rowNameWidth = 2;
//single section
const boolWidth = 1;
const numberWidth = 4;
const stringWidth = 4;
const selectWidth = 4;

//arrays section
const boolArrayWidth = 1;
const numberArrayWidth = 2;
const stringArrayWidth = 2;
const selectArrayWidth = 2;
const deleteArrayWidth = 1;
>>>>>>> fresta

export const FormManager = (props) => {
  //return if something is undefined
  const context = useContext(AppContext);
  let myFetched;
  if (context !== undefined) myFetched = context.fetched;
  else myFetched = {};

  if (
    props.values === undefined ||
    props.resource === undefined ||
    props.disabledFields === undefined ||
    props.functionalFields === undefined ||
    props.submitFunction === undefined ||
    props.handleChangesCallback === undefined ||
    props.arrayDeleteCallback === undefined
  )
    return "Loading";
  /*
  console.log({
    values: props.values,
    resource: props.resource,
    disabledFields: props.disabledFields,
    functionalFields: props.functionalFields,
    submitFunction: props.submitFunction,
    backFunction: props.backFunction,
    handleChangesCallback: props.handleChangesCallback,
    arrayDeleteCallback: props.arrayDeleteCallback,
    fetchedData: myFetched.data,
    fetchedTypes: fetchedPageTypes,
  });
*/
  //Numeric for row component
  const NumericFormRow = (key) => {
    return (
      <Row
        key={key}
        style={{
          borderBottomStyle: "solid",
          borderBottomWidth: 1 + "px",
          marginBottom: 5 + "px",
        }}
      >
        <Col
          sm={rowNameWidth}
          style={{
            borderRightStyle: "dotted",
            borderRightWidth: 1 + "px",
          }}
        >
          <b>{key}</b>
        </Col>
        <Col sm={numberWidth}>
          <Form.Group className="mb-3">
            <Form.Control
              type="number"
              id={key}
              onChange={(e) => {
                e.preventDefault();
                props.handleChangesCallback(parseInt(e.target.value, 10), [
                  key,
                ]);
              }}
              value={isNaN(props.values[key]) ? "" : props.values[key]}
              disabled={
                props.disabledFields[key] !== undefined
                  ? props.disabledFields[key]
                  : false
              }
              placeholder={locale().enter + " " + key}
            />
            {guidelines[props.resource] !== undefined &&
              guidelines[props.resource][key] !== undefined && (
                <Form.Text className="text-muted">
                  {guidelines[props.resource][key]}
                </Form.Text>
              )}
          </Form.Group>
        </Col>
      </Row>
    );
  };
  //string form row component
  const StringFormRow = (key) => {
    return (
      <Row
        key={key}
        style={{
          borderBottomStyle: "solid",
          borderBottomWidth: 1 + "px",
          marginBottom: 5 + "px",
        }}
      >
        <Col
          sm={rowNameWidth}
          style={{
            borderRightStyle: "dotted",
            borderRightWidth: 1 + "px",
          }}
        >
          <b>{key}</b>
        </Col>

        <Col sm={stringWidth}>
          <Form.Group className="mb-3">
            <Form.Control
              type={key === "password" ? "password" : "text"}
              id={key}
              onChange={(e) => {
                e.preventDefault();
                props.handleChangesCallback(e.target.value, [key]);
              }}
              disabled={
                props.disabledFields[key] !== undefined
                  ? props.disabledFields[key]
                  : false
              }
              value={props.values[key]}
              placeholder={locale().enter + " " + key}
            />
            {guidelines[props.resource] !== undefined &&
              guidelines[props.resource][key] !== undefined && (
                <Form.Text className="text-muted">
                  {guidelines[props.resource][key]}
                </Form.Text>
              )}
          </Form.Group>
        </Col>
      </Row>
    );
  };

  //boolean form row component
  const BooleanFormRow = (key) => {
    return (
      <Row
        key={key}
        style={{
          borderBottomStyle: "solid",
          borderBottomWidth: 1 + "px",
          marginBottom: 5 + "px",
        }}
      >
        <Col
          sm={rowNameWidth}
          style={{
            borderRightStyle: "dotted",
            borderRightWidth: 1 + "px",
          }}
        >
          <b>{key}</b>
        </Col>

        <Col sm={boolWidth}>
          <Form.Group className="mb-3">
            <Form.Check
              id={key}
              type="checkbox"
              onChange={(e) => {
                e.preventDefault();
                props.handleChangesCallback(e.target.checked, [key]);
              }}
              disabled={
                props.disabledFields[key] !== undefined
                  ? props.disabledFields[key]
                  : false
              }
              checked={props.values[key]}
            />
            {guidelines[props.resource] !== undefined &&
              guidelines[props.resource][key] !== undefined && (
                <Form.Text className="text-muted">
                  {guidelines[props.resource][key]}
                </Form.Text>
              )}
          </Form.Group>
        </Col>
      </Row>
    );
  };
  //fetched data for row component
  const FetchedFormRow = (key, alias) => {
    let options;
    if (
      myFetched !== {} &&
      (myFetched.data[key] !== undefined || myFetched.data[alias] !== undefined)
    ) {
      options = myFetched.data[alias !== undefined ? alias : key];
    }
    return (
      <Row
        key={key}
        style={{
          borderBottomStyle: "solid",
          borderBottomWidth: 1 + "px",
          marginBottom: 5 + "px",
        }}
      >
        <Col
          sm={rowNameWidth}
          style={{
            borderRightStyle: "dotted",
            borderRightWidth: 1 + "px",
          }}
        >
          <b>{key}</b>
        </Col>

        <Col sm={selectWidth}>
          <Form.Group className="mb-3">
            <Autocomplete
              id={key}
              onChange={(e, newValue) => {
                e.preventDefault();
                props.handleChangesCallback(newValue, [key]);
              }}
              disabled={
                props.disabledFields[key] !== undefined
                  ? props.disabledFields[key]
                  : false
              }
              value={props.values[key] === "" ? null : props.values[key]}
              options={options}
              renderInput={(params) => (
                <TextField {...params} label={locale().enter + " " + key} />
              )}
            />
          </Form.Group>
        </Col>
      </Row>
    );
  };
  //fetched data for row component
  const FetchedFormRow = (key, alias) => {
    let options;
    if (
      myFetched !== {} &&
      (myFetched.data[key] !== undefined || myFetched.data[alias] !== undefined)
    ) {
      options = myFetched.data[alias !== undefined ? alias : key];
    }
    return (
      <Row
        style={{
          borderBottomStyle: "solid",
          borderBottomWidth: 1 + "px",
          marginBottom: 5 + "px",
        }}
      >
        <Col
          sm={2}
          style={{
            borderRightStyle: "dotted",
            borderRightWidth: 1 + "px",
          }}
        >
          <b>{key}</b>
        </Col>

        <Col sm={4}>
          <Form.Group className="mb-3">
            <Autocomplete
              id={key}
              onChange={(e, newValue) => {
                e.preventDefault();
                props.handleChangesCallback(newValue, [key]);
              }}
              disabled={
                props.disabledFields[key] !== undefined
                  ? props.disabledFields[key]
                  : false
              }
              value={props.values[key] === "" ? null : props.values[key]}
              options={options}
              renderInput={(params) => (
                <TextField {...params} label={locale().enter + " " + key} />
              )}
            />
          </Form.Group>
        </Col>
      </Row>
    );
  };
  //select form row component
  const SelectFormRow = (key, val) => {
    return (
      <Row
        style={{
          borderBottomStyle: "solid",
          borderBottomWidth: 1 + "px",
          marginBottom: 5 + "px",
        }}
        key={key}
      >
        <Col
          sm={rowNameWidth}
          style={{
            borderRightStyle: "dotted",
            borderRightWidth: 1 + "px",
          }}
        >
          <b>{key}</b>
        </Col>
        <Col sm={selectWidth}>
          <Form.Group className="mb-3">
            <Form.Select
              aria-label="Default select"
              value={props.values[key]}
              id={key}
              onChange={(e) => {
                e.preventDefault();
                props.handleChangesCallback(e.target.value, [key]);
              }}
              disabled={
                props.disabledFields[key] !== undefined
                  ? props.disabledFields[key]
                  : false
              }
            >
              <option>{locale().select + " " + key}</option>
              {React.Children.toArray(
                Object.entries(val).map(([k, v]) => {
                  return <option value={v}>{v}</option>;
                })
              )}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    );
  };

  //object form row comopnent
  const ObjectFormRow = (key) => {
    return (
      <>
        <Row
          style={{
            borderBottomStyle: "dashed",
            borderBottomWidth: 1 + "px",
            marginBottom: 5 + "px",
          }}
        >
          {React.Children.toArray(
            Object.entries(props.values[key]).map((e) => {
              return (
                <Col
                  sm={
                    typeof e[1] === "boolean"
                      ? boolArrayWidth
                      : typeof e[1] === "number"
                      ? numberArrayWidth
                      : typeof e[1] === "string"
                      ? stringArrayWidth
                      : selectArrayWidth
                  }
                >
                  <b>
                    <i>{Capitalize(key) + " " + e[0]}</i>
                  </b>
                </Col>
              );
            })
          )}
        </Row>
        <Row>
          {React.Children.toArray(
            Object.entries(props.values[key]).map(([k, value]) => {
              const disabled =
                props.disabledFields[key] !== undefined
                  ? props.disabledFields[key][k] !== undefined
                    ? props.disabledFields[key][k]
                    : props.disabledFields[key] === true
                    ? true
                    : false
                  : false;
              //check if it's number
              if (typeof value === "number") {
                return (
                  <Col sm={numberArrayWidth}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="number"
                        onChange={(e) => {
                          e.preventDefault();
                          props.handleChangesCallback(
                            parseInt(e.target.value, 10),
                            [key, k]
                          );
                        }}
                        disabled={disabled}
                        value={
                          isNaN(props.values[key][k])
                            ? ""
                            : props.values[key][k]
                        }
                        placeholder={locale().enter + " " + k}
                      />
                    </Form.Group>
                  </Col>
                );
              }
              //check if it's boolean
              if (typeof value === "boolean") {
                return (
                  <Col sm={boolArrayWidth}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        onChange={(e) => {
                          e.preventDefault();
                          props.handleChangesCallback(e.target.checked, [
                            key,
                            k,
                          ]);
                        }}
                        disabled={disabled}
                        checked={props.values[key][k]}
                        label={k}
                      />
                    </Form.Group>
                  </Col>
                );
              }
              //check if it's an enum
              if (
                fetchedPageTypes[props.resource] !== undefined &&
                fetchedPageTypes[props.resource][key] !== undefined &&
                fetchedPageTypes[props.resource][key][k] !== undefined &&
                myFetched.types !== undefined &&
                myFetched.types[fetchedPageTypes[props.resource][key][k]] !==
                  undefined
              ) {
                return (
                  <Col sm={selectArrayWidth}>
                    <Form.Group className="mb-3">
                      <Form.Select
                        aria-label="Default select"
                        onChange={(e) => {
                          e.preventDefault();
                          props.handleChangesCallback(e.target.value, [key, k]);
                        }}
                        value={props.values[key][k]}
                        disabled={disabled}
                      >
                        <option>{locale().select + " " + k}</option>
                        {React.Children.toArray(
                          Object.entries(
                            myFetched.types[
                              fetchedPageTypes[props.resource][key][k]
                            ]
                          ).map(([k, v]) => {
                            return <option value={k}>{v}</option>;
                          })
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                );
              }
              //input field is a string
              if (typeof value === "string") {
                return (
                  <Col sm={stringArrayWidth}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        disabled={disabled}
                        onChange={(e) => {
                          e.preventDefault();
                          props.handleChangesCallback(e.target.value, [key, k]);
                        }}
                        value={props.values[key][k]}
                        placeholder={locale().enter + " " + k}
                      />
                      {key === "metadata" &&
                        k === "name" &&
                        props.values[key][k] === "Country" && (
                          <Form.Text className="text-muted">
                            Please, enter 2-letter country code (i.e., It, De,
                            Fr, etc...).
                          </Form.Text>
                        )}
                    </Form.Group>
                  </Col>
                );
              }
              //the object contains an array
              if (Array.isArray(value)) {
                if (value.length === 0) return k + " is empty";

                //only show range field when enum type is selected, otherwise skip it
                if (k === "range" && props.values[key]["type"] !== "enum")
                  return "";
                return (
                  <Accordion
                    defaultActiveKey="0"
                    style={{ paddingBottom: 10 + "px", width: "auto" }}
                  >
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        <b>{k}</b> : {nonDefaultLength(value)} items
                      </Accordion.Header>
                      <Accordion.Body>
                        <Container fluid>
                          {React.Children.toArray(
                            value.map((e, idx) => {
                              if (e.constructor === Object) {
                                const entr = Object.entries(e);
                                return (
                                  <Row>
                                    <Col
                                      sm={deleteArrayWidth}
                                      style={{
                                        borderRightStyle: "dotted",
                                        borderRightWidth: 1 + "px",
                                      }}
                                    ></Col>
                                    <Col sm={deleteArrayWidth}>
                                      <Button
                                        disabled={
                                          props.disabledFields[key] !==
                                          undefined
                                            ? props.disabledFields[key]
                                            : false
                                        }
                                        variant="link"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          props.arrayDeleteCallback([
                                            key,
                                            k,
                                            idx,
                                          ]);
                                        }}
                                      >
                                        <i
                                          className="fa fa-times"
                                          aria-hidden="true"
                                          title="Remove element"
                                          style={{
                                            width: 30 + "px",
                                            height: 30 + "px",
                                            marginRight: 10 + "px",
                                            opacity: 0.85,
                                          }}
                                        ></i>
                                      </Button>
                                    </Col>
                                    {React.Children.toArray(
                                      entr.map(([_k, _v]) => {
                                        return (
                                          <Col>
                                            <Form.Group className="mb-3">
                                              <Form.Control
                                                type="text"
                                                disabled={disabled}
                                                onChange={(e) => {
                                                  e.preventDefault();
                                                  props.handleChangesCallback(
                                                    e.target.value,
                                                    [key, k, idx, _k]
                                                  );
                                                }}
                                                value={_v}
                                                placeholder={
                                                  locale().enter + " " + _k
                                                }
                                              />
                                            </Form.Group>
                                          </Col>
                                        );
                                      })
                                    )}
                                  </Row>
                                );
                              } else if (typeof e === "number") {
                                return (
                                  <Row>
                                    <Col>
                                      <Button
                                        disabled={disabled}
                                        variant="link"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();

                                          props.arrayDeleteCallback([
                                            key,
                                            k,
                                            idx,
                                          ]);
                                        }}
                                      >
                                        <i
                                          className="fa fa-times"
                                          aria-hidden="true"
                                          title="Remove element"
                                          style={{
                                            width: 30 + "px",
                                            height: 30 + "px",
                                            marginRight: 10 + "px",
                                            opacity: 0.85,
                                          }}
                                        ></i>
                                      </Button>
                                    </Col>
                                    <Col>
                                      <Form.Control
                                        type="number"
                                        disabled={disabled}
                                        onChange={(e) => {
                                          e.preventDefault();
                                          props.handleChangesCallback(
                                            parseInt(e.target.value, 10),
                                            [key, k, idx]
                                          );
                                        }}
                                        value={isNaN(e) ? "" : e} //{props.values[k][index]}
                                        placeholder={locale().enter + " " + k}
                                      />
                                    </Col>
                                  </Row>
                                );
                              } else if (typeof e === "string") {
                                return (
                                  <Row>
                                    <Col>
                                      <Button
                                        disabled={disabled}
                                        variant="link"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();

                                          props.arrayDeleteCallback([
                                            key,
                                            k,
                                            idx,
                                          ]);
                                        }}
                                      >
                                        <i
                                          className="fa fa-times"
                                          aria-hidden="true"
                                          title="Remove element"
                                          style={{
                                            width: 30 + "px",
                                            height: 30 + "px",
                                            marginRight: 10 + "px",
                                            opacity: 0.85,
                                          }}
                                        ></i>
                                      </Button>
                                    </Col>
                                    <Col>
                                      <Form.Control
                                        type="text"
                                        disabled={
                                          props.disabledFields[k] !== undefined
                                            ? props.disabledFields[k]
                                            : false
                                        }
                                        onChange={(e) => {
                                          e.preventDefault();
                                          props.handleChangesCallback(
                                            e.target.value,
                                            [key, k, idx]
                                          );
                                        }}
                                        value={e}
                                        placeholder={locale().enter + " " + k}
                                      />
                                    </Col>
                                  </Row>
                                );
                              }
                              return "Unknown data type";
                            })
                          )}
                        </Container>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                );
              }
              return "Unknown data type";
            })
          )}
        </Row>
      </>
    );
  };

  //numbers array form row component
  const ArrayNumberFormRow = (k) => {
    return (
      <Row
        style={{
          borderBottomStyle: "solid",
          borderBottomWidth: 1 + "px",
          marginBottom: 5 + "px",
        }}
        key={k}
      >
        <Col
          sm={rowNameWidth}
          style={{
            borderRightStyle: "dotted",
            borderRightWidth: 1 + "px",
          }}
        >
          <b>{k}</b>
        </Col>
        <Col sm={numberArrayWidth}>
          {React.Children.toArray(
            props.values[k].map((value, index) => {
              return (
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="number"
                      disabled={
                        props.disabledFields[k] !== undefined
                          ? props.disabledFields[k]
                          : false
                      }
                      onChange={(e) => {
                        e.preventDefault();
                        props.handleChangesCallback(
                          parseInt(e.target.value, 10),
                          [k, index]
                        );
                      }}
                      value={
                        isNaN(props.values[k][index])
                          ? ""
                          : props.values[k][index]
                      }
                      placeholder={locale().enter + " " + k + "[" + index + "]"}
                    />
                  </Form.Group>
                </Row>
              );
            })
          )}
        </Col>
      </Row>
    );
  };
  //strings array form row component
  const ArrayStringFormRow = (key) => {
    let options;
    if (myFetched !== {} && myFetched.data[key] !== undefined) {
      options = myFetched.data[key];
    }

    return (
      <Row
        style={{
          borderBottomStyle: "solid",
          borderBottomWidth: 1 + "px",
          marginBottom: 5 + "px",
        }}
        key={key}
      >
        <Col
          sm={rowNameWidth}
          style={{
            borderRightStyle: "dotted",
            borderRightWidth: 1 + "px",
          }}
        >
          <b>{key}</b>
        </Col>
        <Col>
          {React.Children.toArray(
            props.values[key].map((value, index) => {
              return (
                <Row>
                  <Col sm={deleteArrayWidth}>
                    <Button
                      disabled={
                        props.disabledFields[key] !== undefined
                          ? props.disabledFields[key]
                          : false
                      }
                      variant="link"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        props.arrayDeleteCallback([key, index]);
                      }}
                    >
                      <i
                        className="fa fa-times"
                        aria-hidden="true"
                        title="Remove element"
                        style={{
                          width: 30 + "px",
                          height: 30 + "px",
                          marginRight: 10 + "px",
                          opacity: 0.85,
                        }}
                      ></i>
                    </Button>
                  </Col>
                  <Col sm={Math.max(stringArrayWidth, selectArrayWidth)}>
                    <Form.Group className="mb-3">
                      {myFetched.data[key] !== undefined ? (
                        <Autocomplete
                          disabled={
                            props.disabledFields[key] !== undefined
                              ? props.disabledFields[key]
                              : false
                          }
                          id={key}
                          onChange={(e, newValue) => {
                            e.preventDefault();
                            props.handleChangesCallback(newValue, [key, index]);
                          }}
                          value={
                            props.values[key][index] === ""
                              ? null
                              : props.values[key][index]
                          }
                          options={options}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={
                                locale().enter + " " + key + "[" + index + "]"
                              }
                            />
                          )}
                        />
                      ) : (
                        <Form.Control
                          type="text"
                          disabled={
                            props.disabledFields[key] !== undefined
                              ? props.disabledFields[key]
                              : false
                          }
                          onChange={(e) => {
                            e.preventDefault();
                            props.handleChangesCallback(e.target.value, [
                              key,
                              index,
                            ]);
                          }}
                          value={props.values[key][index]}
                          placeholder={
                            locale().enter + " " + key + "[" + index + "]"
                          }
                        />
                      )}
                    </Form.Group>
                  </Col>

                  <Col md="auto"></Col>
                </Row>
              );
            })
          )}
        </Col>
      </Row>
    );
  };

  //boolean array form row component
  const ArrayBooleanFormRow = (key) => {
    return (
      <Row
        style={{
          borderBottomStyle: "solid",
          borderBottomWidth: 1 + "px",
          marginBottom: 5 + "px",
        }}
        key={key}
      >
        <Col
          sm={rowNameWidth}
          style={{
            borderRightStyle: "dotted",
            borderRightWidth: 1 + "px",
          }}
        >
          <b>{key}</b>
        </Col>
        <Col>
          {React.Children.toArray(
            props.values[key].map((value, index) => {
              return (
                <Row>
                  <Col sm={1}>
                    <Button
                      disabled={
                        props.disabledFields[key] !== undefined
                          ? props.disabledFields[key]
                          : false
                      }
                      variant="link"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        props.arrayDeleteCallback([key, index]);
                      }}
                    >
                      <i
                        className="fa fa-times"
                        aria-hidden="true"
                        title="Remove element"
                        style={{
                          width: 30 + "px",
                          height: 30 + "px",
                          marginRight: 10 + "px",
                          opacity: 0.85,
                        }}
                      ></i>
                    </Button>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
<<<<<<< HEAD
                      {myFetched.data[key] !== undefined ? (
                        <Autocomplete
                          disabled={
                            props.disabledFields[key] !== undefined
                              ? props.disabledFields[key]
                              : false
                          }
                          id={key}
                          onChange={(e, newValue) => {
                            e.preventDefault();
                            props.handleChangesCallback(newValue, [key, index]);
                          }}
                          value={
                            props.values[key][index] === ""
                              ? null
                              : props.values[key][index]
                          }
                          options={options}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={locale().enter + " " + key}
                            />
                          )}
                        />
                      ) : (
                        <Form.Control
                          type="text"
=======
                      {
                        <Form.Check
                          type="checkbox"
>>>>>>> fresta
                          disabled={
                            props.disabledFields[key] !== undefined
                              ? props.disabledFields[key]
                              : false
                          }
                          onChange={(e) => {
                            e.preventDefault();
<<<<<<< HEAD
                            props.handleChangesCallback(e.target.value, [
=======
                            props.handleChangesCallback(e.target.checked, [
>>>>>>> fresta
                              key,
                              index,
                            ]);
                          }}
<<<<<<< HEAD
                          value={props.values[key][index]}
                          placeholder={locale().enter + " " + key}
                        />
                      )}
=======
                          checked={props.values[key][index]}
                          placeholder={locale().enter + " " + key}
                        />
                      }
>>>>>>> fresta
                    </Form.Group>
                  </Col>

                  <Col md="auto"></Col>
                </Row>
              );
            })
          )}
        </Col>
      </Row>
    );
  };

  //strings array form row component
  const ArrayObjectFormRow = (key) => {
    return (
      <Row
        style={{
          borderBottomStyle: "solid",
          borderBottomWidth: 1 + "px",
          marginBottom: 5 + "px",
        }}
        key={key}
      >
        <Col
          sm={rowNameWidth}
          style={{
            borderRightStyle: "dotted",
            borderRightWidth: 1 + "px",
          }}
        >
          <b>{key}</b>
        </Col>
        <Col>
          <Row
            style={{
              borderBottomStyle: "dashed",
              borderBottomWidth: 1 + "px",
              marginBottom: 5 + "px",
            }}
          >
            {props.disabledFields[key] === undefined && (
              <Col sm={deleteArrayWidth}>
                <b>
                  <i>Remove</i>
                </b>
              </Col>
            )}
            {React.Children.toArray(
              Object.entries(props.values[key][0]).map((e) => {
                return (
                  <Col
                    sm={
                      typeof e[1] === "boolean"
                        ? boolArrayWidth
                        : typeof e[1] === "number"
                        ? numberArrayWidth
                        : typeof e[1] === "string"
                        ? stringArrayWidth
                        : selectArrayWidth
                    }
                  >
                    <b>
                      <i>{Capitalize(key) + " " + e[0]}</i>
                    </b>
                  </Col>
                );
              })
            )}
          </Row>
          {React.Children.toArray(
            props.values[key].map((obj, index) => {
              return (
                <Row>
                  {props.disabledFields[key] === undefined && (
                    <Col sm={deleteArrayWidth}>
                      <Button
                        disabled={
                          props.disabledFields[key] !== undefined
                            ? props.disabledFields[key]
                            : false
                        }
                        variant="link"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          props.arrayDeleteCallback([key, index]);
                        }}
                      >
                        <i
                          className="fa fa-times"
                          aria-hidden="true"
                          title="Remove element"
                          style={{
                            width: 30 + "px",
                            height: 30 + "px",
                            marginRight: 10 + "px",
                            opacity: 0.85,
                          }}
                        ></i>
                      </Button>
                    </Col>
                  )}

                  {React.Children.toArray(
                    Object.entries(obj).map(([k, value]) => {
                      const disabled =
                        props.disabledFields[key] !== undefined
                          ? props.disabledFields[key][k] !== undefined
                            ? props.disabledFields[key][k]
                            : props.disabledFields[key] === true
                            ? true
                            : false
                          : false;
                      //check if it's number
                      if (typeof value === "number") {
                        return (
                          <Col sm={numberArrayWidth}>
                            <Form.Group className="mb-3">
                              <Form.Control
                                type="number"
                                onChange={(e) => {
                                  e.preventDefault();
                                  props.handleChangesCallback(
                                    parseInt(e.target.value, 10),
                                    [key, index, k]
                                  );
                                }}
                                disabled={disabled}
                                value={
                                  isNaN(props.values[key][index][k])
                                    ? ""
                                    : props.values[key][index][k]
                                }
                                placeholder={locale().enter + " " + k}
                              />
                            </Form.Group>
                          </Col>
                        );
                      }
<<<<<<< HEAD
=======
                      //check if it's boolean
                      if (typeof value === "boolean") {
                        return (
                          <Col sm={boolArrayWidth}>
                            <Form.Group className="mb-3">
                              <Form.Check
                                type="checkbox"
                                onChange={(e) => {
                                  e.preventDefault();
                                  props.handleChangesCallback(
                                    e.target.checked,
                                    [key, index, k]
                                  );
                                }}
                                disabled={disabled}
                                checked={props.values[key][index][k]}
                                placeholder={locale().enter + " " + k}
                              />
                            </Form.Group>
                          </Col>
                        );
                      }
>>>>>>> fresta
                      //check if it's an enum
                      if (
                        fetchedPageTypes[props.resource] !== undefined &&
                        fetchedPageTypes[props.resource][key] !== undefined &&
                        fetchedPageTypes[props.resource][key][k] !==
                          undefined &&
                        myFetched.types !== undefined &&
                        myFetched.types[
                          fetchedPageTypes[props.resource][key][k]
                        ] !== undefined
                      ) {
                        return (
<<<<<<< HEAD
                          <Col sm={3}>
=======
                          <Col sm={selectArrayWidth}>
>>>>>>> fresta
                            <Form.Group className="mb-3">
                              <Form.Select
                                aria-label="Default select"
                                onChange={(e) => {
                                  e.preventDefault();
                                  props.handleChangesCallback(e.target.value, [
                                    key,
                                    index,
                                    k,
                                  ]);
                                }}
                                value={props.values[key][index][k]}
<<<<<<< HEAD
                                disabled={
                                  props.disabledFields[key] !== undefined
                                    ? props.disabledFields[key]
                                    : false
                                }
=======
                                disabled={disabled}
>>>>>>> fresta
                              >
                                <option>{locale().select + " " + k}</option>
                                {React.Children.toArray(
                                  Object.entries(
                                    myFetched.types[
                                      fetchedPageTypes[props.resource][key][k]
                                    ]
                                  ).map(([k, v]) => {
                                    return <option value={k}>{v}</option>;
                                  })
                                )}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        );
                      }
                      //input field is a string
                      if (typeof value === "string") {
                        return (
                          <Col sm={stringArrayWidth}>
                            <Form.Group className="mb-3">
                              <Form.Control
                                type="text"
                                disabled={disabled}
                                onChange={(e) => {
                                  e.preventDefault();
                                  props.handleChangesCallback(e.target.value, [
                                    key,
                                    index,
                                    k,
                                  ]);
                                }}
                                value={props.values[key][index][k]}
                                placeholder={locale().enter + " " + k}
                              />
                              {key === "metadata" &&
                                k === "name" &&
                                props.values[key][index][k] === "Country" && (
                                  <Form.Text className="text-muted">
                                    Please, enter 2-letter country code (i.e.,
                                    It, De, Fr, etc...).
                                  </Form.Text>
                                )}
                            </Form.Group>
                          </Col>
                        );
                      }
                      //the object contains an array
                      if (Array.isArray(value)) {
                        if (value.length === 0) return k + " is empty";

                        //only show range field when enum type is selected, otherwise skip it
                        if (
                          k === "range" &&
                          props.values[key][index]["type"] !== "enum"
                        )
                          return "";
                        return (
                          <Accordion
                            defaultActiveKey="0"
                            style={{ paddingBottom: 10 + "px", width: "auto" }}
                          >
                            <Accordion.Item eventKey="0">
                              <Accordion.Header>
                                <b>{k}</b> : {nonDefaultLength(value)} items
                              </Accordion.Header>
                              <Accordion.Body>
                                <Container fluid>
                                  {React.Children.toArray(
                                    value.map((e, idx) => {
                                      if (e.constructor === Object) {
                                        const entr = Object.entries(e);
                                        return (
                                          <Row>
                                            <Col
                                              sm={deleteArrayWidth}
                                              style={{
                                                borderRightStyle: "dotted",
                                                borderRightWidth: 1 + "px",
                                              }}
                                            ></Col>
                                            <Col sm={deleteArrayWidth}>
                                              <Button
                                                disabled={
                                                  props.disabledFields[key] !==
                                                  undefined
                                                    ? props.disabledFields[key]
                                                    : false
                                                }
                                                variant="link"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  props.arrayDeleteCallback([
                                                    key,
                                                    index,
                                                    k,
                                                    idx,
                                                  ]);
                                                }}
                                              >
                                                <i
                                                  className="fa fa-times"
                                                  aria-hidden="true"
                                                  title="Remove element"
                                                  style={{
                                                    width: 30 + "px",
                                                    height: 30 + "px",
                                                    marginRight: 10 + "px",
                                                    opacity: 0.85,
                                                  }}
                                                ></i>
                                              </Button>
                                            </Col>
                                            {React.Children.toArray(
                                              entr.map(([_k, _v]) => {
                                                return (
                                                  <Col>
                                                    <Form.Group className="mb-3">
                                                      <Form.Control
                                                        type="text"
                                                        disabled={disabled}
                                                        onChange={(e) => {
                                                          e.preventDefault();
                                                          props.handleChangesCallback(
                                                            e.target.value,
                                                            [
                                                              key,
                                                              index,
                                                              k,
                                                              idx,
                                                              _k,
                                                            ]
                                                          );
                                                        }}
                                                        value={_v}
                                                        placeholder={
                                                          locale().enter +
                                                          " " +
                                                          _k
                                                        }
                                                      />
                                                    </Form.Group>
                                                  </Col>
                                                );
                                              })
                                            )}
                                          </Row>
                                        );
                                      } else if (typeof e === "number") {
                                        return (
                                          <Row>
                                            <Col>
                                              <Button
                                                disabled={disabled}
                                                variant="link"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.preventDefault();

                                                  props.arrayDeleteCallback([
                                                    key,
                                                    index,
                                                    k,
                                                    idx,
                                                  ]);
                                                }}
                                              >
                                                <i
                                                  className="fa fa-times"
                                                  aria-hidden="true"
                                                  title="Remove element"
                                                  style={{
                                                    width: 30 + "px",
                                                    height: 30 + "px",
                                                    marginRight: 10 + "px",
                                                    opacity: 0.85,
                                                  }}
                                                ></i>
                                              </Button>
                                            </Col>
                                            <Col>
                                              <Form.Control
                                                type="number"
                                                disabled={disabled}
                                                onChange={(e) => {
                                                  e.preventDefault();
                                                  props.handleChangesCallback(
                                                    parseInt(
                                                      e.target.value,
                                                      10
                                                    ),
                                                    [key, index, k, idx]
                                                  );
                                                }}
                                                value={isNaN(e) ? "" : e} //{props.values[k][index]}
                                                placeholder={
                                                  locale().enter + " " + k
                                                }
                                              />
                                            </Col>
                                          </Row>
                                        );
                                      } else if (typeof e === "string") {
                                        return (
                                          <Row>
<<<<<<< HEAD
                                            <Col sm={1}>
                                              <Button
                                                disabled={
                                                  props.disabledFields[key] !==
                                                  undefined
                                                    ? props.disabledFields[key]
                                                    : false
                                                }
=======
                                            <Col>
                                              <Button
                                                disabled={disabled}
>>>>>>> fresta
                                                variant="link"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.preventDefault();

                                                  props.arrayDeleteCallback([
                                                    key,
                                                    index,
                                                    k,
                                                    idx,
                                                  ]);
                                                }}
                                              >
                                                <i
                                                  className="fa fa-times"
                                                  aria-hidden="true"
                                                  title="Remove element"
                                                  style={{
                                                    width: 30 + "px",
                                                    height: 30 + "px",
                                                    marginRight: 10 + "px",
                                                    opacity: 0.85,
                                                  }}
                                                ></i>
                                              </Button>
                                            </Col>
<<<<<<< HEAD
                                            <Col sm={3}>
=======
                                            <Col>
>>>>>>> fresta
                                              <Form.Control
                                                type="text"
                                                disabled={
                                                  props.disabledFields[k] !==
                                                  undefined
                                                    ? props.disabledFields[k]
                                                    : false
                                                }
<<<<<<< HEAD
                                                key={"" + key + index + k + idx}
=======
>>>>>>> fresta
                                                onChange={(e) => {
                                                  e.preventDefault();
                                                  props.handleChangesCallback(
                                                    e.target.value,
                                                    [key, index, k, idx]
                                                  );
                                                }}
<<<<<<< HEAD
                                                value={e} //{props.values[k][index]}
=======
                                                value={e}
>>>>>>> fresta
                                                placeholder={
                                                  locale().enter + " " + k
                                                }
                                              />
                                            </Col>
                                          </Row>
                                        );
                                      }
                                      return "Unknown data type";
                                    })
                                  )}
                                </Container>
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        );
                      }
                      if (value.constructor === Object) {
                        return (
                          <Accordion
                            defaultActiveKey="0"
                            style={{ paddingBottom: 10 + "px", width: "auto" }}
                          >
                            <Accordion.Item eventKey="0">
                              <Accordion.Header>
                                <b>{k}</b>
                              </Accordion.Header>
                              <Accordion.Body>
                                <Container fluid>
                                  <Row>
                                    {React.Children.toArray(
                                      Object.entries(value).map((entr) => {
                                        if (typeof entr[1] === "number") {
                                          return (
                                            <Col>
                                              <Form.Control
                                                type="number"
                                                disabled={disabled}
                                                onChange={(e) => {
                                                  e.preventDefault();
                                                  props.handleChangesCallback(
                                                    parseInt(
                                                      e.target.value,
                                                      10
                                                    ),
                                                    [key, index, k, entr[0]],
                                                    true
                                                  );
                                                }}
                                                value={
                                                  isNaN(entr[1]) ? "" : entr[1]
                                                } //{props.values[k][index]}
                                                placeholder={
                                                  locale().enter + " " + entr[0]
                                                }
                                              />
                                            </Col>
                                          );
                                        }
                                        //check if it's boolean
                                        if (typeof entr[1] === "boolean") {
                                          return (
                                            <Col>
                                              <Form.Group className="mb-3">
                                                <Form.Check
                                                  type="checkbox"
                                                  onChange={(e) => {
                                                    e.preventDefault();
                                                    props.handleChangesCallback(
                                                      e.target.checked,
                                                      [key, index, k, entr[0]],
                                                      true
                                                    );
                                                  }}
                                                  disabled={disabled}
                                                  checked={entr[1]}
                                                  label={entr[0]}
                                                />
                                              </Form.Group>
                                            </Col>
                                          );
                                        }
                                        //check if it's an enum

                                        if (
                                          fetchedPageTypes[props.resource] !==
                                            undefined &&
                                          fetchedPageTypes[props.resource][
                                            key
                                          ] !== undefined &&
                                          fetchedPageTypes[props.resource][key][
                                            k
                                          ] !== undefined &&
                                          fetchedPageTypes[props.resource][key][
                                            k
                                          ][entr[0]] !== undefined &&
                                          myFetched.types !== undefined &&
                                          fetchedPageTypes[props.resource][key][
                                            k
                                          ][entr[0]] !== undefined
                                        ) {
                                          return (
                                            <Col>
                                              <Form.Group className="mb-3">
                                                <Form.Select
                                                  aria-label="Default select"
                                                  onChange={(e) => {
                                                    e.preventDefault();
                                                    props.handleChangesCallback(
                                                      e.target.value,
                                                      [key, index, k, entr[0]],
                                                      true
                                                    );
                                                  }}
                                                  value={entr[1]}
                                                  disabled={disabled}
                                                >
                                                  <option>
                                                    {locale().select +
                                                      " " +
                                                      entr[0]}
                                                  </option>
                                                  {React.Children.toArray(
                                                    Object.entries(
                                                      myFetched.types[
                                                        fetchedPageTypes[
                                                          props.resource
                                                        ][key][k][entr[0]]
                                                      ]
                                                    ).map(([k, v]) => {
                                                      return (
                                                        <option value={k}>
                                                          {v}
                                                        </option>
                                                      );
                                                    })
                                                  )}
                                                </Form.Select>
                                              </Form.Group>
                                            </Col>
                                          );
                                        }
                                        if (typeof entr[1] === "string") {
                                          return (
                                            <Col>
                                              <Form.Control
                                                type="text"
                                                disabled={
                                                  props.disabledFields[k] !==
                                                  undefined
                                                    ? props.disabledFields[k]
                                                    : false
                                                }
                                                onChange={(e) => {
                                                  e.preventDefault();
                                                  props.handleChangesCallback(
                                                    e.target.value,
                                                    [key, index, k, entr[0]],
                                                    true
                                                  );
                                                }}
                                                value={entr[1]}
                                                placeholder={
                                                  locale().enter + " " + entr[0]
                                                }
                                              />
                                            </Col>
                                          );
                                        }
                                        return "Unknown data type";
                                      })
                                    )}
                                  </Row>
                                </Container>
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        );
                      }
                      return "Unknown data type";
                    })
                  )}
                </Row>
              );
            })
          )}
        </Col>
      </Row>
    );
  };
<<<<<<< HEAD
  //object form row comopnent
  const ObjectFormRow = (key) => {
    return "TODO ObjectFormRow";
  };
=======
>>>>>>> fresta

  return (
    <Form onSubmit={props.submitFunction}>
      <Container fluid key={"form"}>
        {
          //in case of unfetched data, do nothing
          props.functionalFields[props.resource] === undefined &&
            "No operation allowed"
        }
        {props.functionalFields[props.resource] !== undefined &&
          React.Children.toArray(
            Object.entries(props.values).map(([key, value]) => {
              //enum type defined by config
              //check if all the required resources are defined

              if (
                fetchedPageTypes[props.resource] !== undefined &&
                fetchedPageTypes[props.resource][key] !== undefined &&
                myFetched.types !== undefined &&
                myFetched.types[fetchedPageTypes[props.resource][key]] !==
                  undefined
              ) {
                return SelectFormRow(
                  key,
                  myFetched.types[fetchedPageTypes[props.resource][key]]
                );
              }
              //input field is an array
              if (Array.isArray(value)) {
                if (typeof value[0] === "number") {
                  return ArrayNumberFormRow(key);
                }
                if (typeof value[0] === "boolean") {
                  return ArrayBooleanFormRow(key);
                }
                if (typeof value[0] === "string") {
                  return ArrayStringFormRow(key);
                }
                if (value[0].constructor === Object) {
                  return ArrayObjectFormRow(key);
                }
              }
              //input field is a number
              if (typeof value === "number") {
                return NumericFormRow(key);
              }
              //input field for fetched data

              if (
                fetchedPageData[props.resource] !== undefined &&
                fetchedPageData[props.resource][key] !== undefined &&
                myFetched.data[fetchedPageData[props.resource][key]] !==
                  undefined
              ) {
                return FetchedFormRow(
                  key,
                  fetchedPageData[props.resource][key]
                );
              }
<<<<<<< HEAD
=======
              //input field is a boolean
              if (typeof value === "boolean") {
                return BooleanFormRow(key);
              }
>>>>>>> fresta
              //input field is a string
              if (typeof value === "string") {
                return StringFormRow(key);
              }

              //input field is an object
              if (value.constructor === Object) {
                return ObjectFormRow(key);
              }
              //default return
              return "";
            })
          )}
      </Container>
      <Button variant="primary" type="submit">
        {locale().submit}
      </Button>
      &nbsp;&nbsp;&nbsp;
      {props.backFunction !== undefined && (
        <Button variant="secondary" onClick={props.backFunction}>
          {locale().cancel}
        </Button>
      )}
    </Form>
  );
};
