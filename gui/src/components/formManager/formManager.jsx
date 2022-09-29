import React, { useEffect, useState } from "react";
import locale from "../../common/locale";
import { nonDefaultLength } from "../../services/misc_functions";
import { Button, Form, Accordion, Container, Row, Col } from "react-bootstrap";

import { fetchedData } from "../../fetchedData";
import { fetchedPageTypes } from "../../config";

export const FormManager = (props) => {
  //return if something is undefined
  if (
    props.values === undefined ||
    props.resource === undefined ||
    props.disabledFields === undefined ||
    props.functionalFields === undefined ||
    props.submitFunction === undefined ||
    props.backFunction === undefined ||
    props.handleChangesCallback === undefined ||
    props.arrayDeleteCallback === undefined
  )
    return "Loading";

  console.log({
    values: props.values,
    resource: props.resource,
    disabledFields: props.disabledFields,
    functionalFields: props.functionalFields,
    submitFunction: props.submitFunction,
    backFunction: props.backFunction,
    handleChangesCallback: props.handleChangesCallback,
    arrayDeleteCallback: props.arrayDeleteCallback,
  });
  //Numeric for row component
  const NumericFormRow = (key) => {
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
          </Form.Group>
        </Col>
      </Row>
    );
  };
  //string for row component
  const StringFormRow = (key) => {
    //enum type (fetcheddata) defined by config
    //check if all the required resources are defined
    if (
      fetchedPageTypes[props.resource] !== undefined &&
      fetchedPageTypes[props.resource][key] !== undefined &&
      fetchedData !== undefined &&
      fetchedData[fetchedPageTypes[props.resource][key]] !== undefined
    ) {
      return SelectFormRow(
        key,
        fetchedData[fetchedPageTypes[props.resource][key]]
      );
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
                  return <option value={k}>{v}</option>;
                })
              )}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
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
      >
        <Col
          sm={2}
          style={{
            borderRightStyle: "dotted",
            borderRightWidth: 1 + "px",
          }}
        >
          <b>{k}</b>
        </Col>
        <Col sm={4}>
          {React.Children.toArray(
            props.values[k].map((value, index) => {
              return (
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Insert <b>{k}</b>
                      <i>[{index}]</i>
                    </Form.Label>
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
                      placeholder={locale().enter + " " + k}
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
                  <Col sm={4}>
                    <Form.Group className="mb-3">
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
                        placeholder={locale().enter + " " + key}
                      />
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
        <Col>
          {React.Children.toArray(
            props.values[key].map((obj, index) => {
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
                  {React.Children.toArray(
                    Object.entries(obj).map(([k, value]) => {
                      if (typeof value === "number") {
                        return (
                          <Col sm={2}>
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
                                key={key + k + index + ""}
                                disabled={
                                  props.disabledFields[key] !== undefined
                                    ? props.disabledFields[key]
                                    : false
                                }
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

                      //input field is a string
                      if (typeof value === "string") {
                        return (
                          <Col sm={3}>
                            <Form.Group className="mb-3">
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
                                    k,
                                  ]);
                                }}
                                value={props.values[key][index][k]}
                                placeholder={locale().enter + " " + k}
                              />
                            </Form.Group>
                          </Col>
                        );
                      }
                      //the object contains an array
                      if (Array.isArray(value)) {
                        if (value.length === 0) return k + " is empty";
                        return (
                          <Row>
                            <Accordion defaultActiveKey="0">
                              <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                  <b>{k}</b> : {nonDefaultLength(value)} items
                                </Accordion.Header>
                                <Accordion.Body>
                                  {React.Children.toArray(
                                    value.map((e, idx) => {
                                      if (e.constructor === Object) {
                                        const entr = Object.entries(e);
                                        return (
                                          <Row>
                                            <Col
                                              sm={1}
                                              style={{
                                                borderRightStyle: "dotted",
                                                borderRightWidth: 1 + "px",
                                              }}
                                            ></Col>
                                            <Col sm={1}>
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
                                                  <Col sm={3}>
                                                    <Form.Group className="mb-3">
                                                      <Form.Control
                                                        type="text"
                                                        disabled={
                                                          props.disabledFields[
                                                            key
                                                          ] !== undefined
                                                            ? props
                                                                .disabledFields[
                                                                key
                                                              ]
                                                            : false
                                                        }
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
                                            <Col sm={1}>
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
                                            <Col sm={3}>
                                              <Form.Control
                                                type="number"
                                                disabled={
                                                  props.disabledFields[k] !==
                                                  undefined
                                                    ? props.disabledFields[k]
                                                    : false
                                                }
                                                key={"" + key + index + k + idx}
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
                                      } else if (typeof e === "string")
                                        return "TODO string";
                                    })
                                  )}
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                          </Row>
                        );
                      }
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
  //object form row comopnent
  const ObjectFormRow = (key) => {
    return "TODO";
  };

  return (
    <Form onSubmit={props.submitFunction}>
      <Container fluid>
        {
          //in case of unfetched data, do nothing
          props.functionalFields[props.resource] === undefined &&
            "No operation allowed"
        }
        {props.functionalFields[props.resource] !== undefined &&
          React.Children.toArray(
            Object.entries(props.values).map(([key, value]) => {
              //input field is a number
              if (typeof value === "number") {
                return NumericFormRow(key);
              }

              //input field is a string
              if (typeof value === "string") {
                return StringFormRow(key);
              }

              //input field is an array
              if (Array.isArray(value)) {
                if (typeof value[0] === "number") {
                  return ArrayNumberFormRow(key);
                }
                if (typeof value[0] === "string") {
                  return ArrayStringFormRow(key);
                }
                if (value[0].constructor === Object) {
                  return ArrayObjectFormRow(key);
                }
              }

              //input field is an object
              if (value.constructor === Object) {
                return ObjectFormRow();
              }
              //default return
              return "";
            })
          )}
      </Container>
      <Button variant="primary" type="submit" key={"submit"}>
        {locale().submit}
      </Button>
      <Button variant="secondary" key={"cancel"} onClick={props.backFunction}>
        {locale().cancel}
      </Button>
    </Form>
  );
};
