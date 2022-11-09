import React, { useState } from "react";
import locale from "../../common/locale";
import {
  Button,
  Form,
  Accordion,
  Container,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { getBigDataCloudLocation } from "../../services/http_operations";
const cloneDeep = require("clone-deep");

export const SamplesForm = (props) => {
  //return if something is undefined
  if (
    props.samples === undefined ||
    props.submitFunction === undefined ||
    props.handleAddSample === undefined ||
    props.handleDeleteSample === undefined ||
    props.items === undefined ||
    props.getAddress === undefined ||
    props.msg === undefined ||
    props.handleChanges === undefined ||
    props.refreshLocation === undefined ||
    props.addrMsg === undefined
  )
    return "Loading";
  return (
    <Container fluid>
      <Row>
        <b>Samples :{props.samples.length}</b>
      </Row>
      <br />
      {React.Children.toArray(
        props.samples.map((sample, i) => {
          return (
            <Row
              style={{
                paddingBottom: 10 + "px",
              }}
            >
              <Accordion defaultActiveKey={props.samples.length - 1}>
                <Accordion.Item eventKey={i}>
                  <Accordion.Header>
                    <b>
                      <i>Sample [{i}]</i>
                    </b>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        props.handleDeleteSample([i]);
                      }}
                    >
                      <i
                        className="fa fa-times"
                        aria-hidden="true"
                        title="Remove element"
                        style={{
                          width: 30 + "px",
                          height: 30 + "px",
                          opacity: 0.85,
                        }}
                      ></i>
                      <b>{locale().remove}</b>
                    </Button>
                    {React.Children.toArray(
                      Object.entries(sample.values).map(([key, value]) => {
                        return (
                          <Row
                            style={{
                              borderBottomStyle: "solid",
                              borderBottomWidth: 1 + "px",
                              marginBottom: 5 + "px",
                              paddingBottom: 5,
                            }}
                          >
                            <Col sm={2}>
                              <b>
                                <i>{value.name}</i>
                              </b>
                              {value.name === "address" ||
                              value.name === "indirizzo" ? (
                                <Button
                                  variant="link"
                                  onClick={async () => {
                                    await props.refreshLocation();
                                  }}
                                >
                                  <i
                                    className="fa fa-map-pin"
                                    aria-hidden="true"
                                    title={"Refresh Position"}
                                    style={{
                                      width: 20 + "px",
                                      height: 20 + "px",
                                      marginRight: 10 + "px",
                                      opacity: 0.85,
                                    }}
                                  ></i>
                                </Button>
                              ) : (
                                ""
                              )}
                            </Col>
                            <Col sm={2}>
                              {value.type === "enum" ? (
                                <Form.Select
                                  aria-label={
                                    locale().select + " " + value.name
                                  }
                                  value={value.value}
                                  onChange={(e) => {
                                    e.preventDefault();
                                    props.handleChanges(e.target.value, [
                                      i,
                                      "values",
                                      parseInt(key, 10),
                                      "value",
                                    ]);
                                  }}
                                >
                                  <option value="">
                                    {locale().select + " " + value.name}
                                  </option>
                                  {React.Children.toArray(
                                    value.enumValues.map((e) => {
                                      return <option value={e}>{e}</option>;
                                    })
                                  )}
                                </Form.Select>
                              ) : value.type === "text" ? (
                                value.name === "address" ||
                                value.name === "indirizzo" ? (
                                  <React.Fragment>
                                    <Form.Group>
                                      <Form.Control
                                        type="text"
                                        id={value.name}
                                        value={value.value}
                                        onChange={(e) => {
                                          e.preventDefault();
                                          props.handleChanges(e.target.value, [
                                            i,
                                            "values",
                                            parseInt(key, 10),
                                            "value",
                                          ]);
                                        }}
                                        aria-label={
                                          locale().enter + " " + value.name
                                        }
                                      />
                                      <Form.Text className="text-muted">
                                        {props.addrMsg}
                                      </Form.Text>
                                    </Form.Group>
                                  </React.Fragment>
                                ) : (
                                  <Form.Control
                                    type="text"
                                    //value={value.value}
                                    id={value.name}
                                    value={value.value}
                                    onChange={(e) => {
                                      e.preventDefault();
                                      props.handleChanges(e.target.value, [
                                        i,
                                        "values",
                                        parseInt(key, 10),
                                        "value",
                                      ]);
                                    }}
                                    aria-label={
                                      locale().enter + " " + value.name
                                    }
                                  />
                                )
                              ) : value.name === "date" ||
                                value.name === "data" ? (
                                <Form.Control
                                  type="date"
                                  //value={value.value}
                                  id={value.name}
                                  //value={value.value}
                                  onChange={(e) => {
                                    e.preventDefault();
                                    props.handleChanges(
                                      Date.parse(e.target.value),
                                      [i, "values", parseInt(key, 10), "value"]
                                    );
                                  }}
                                  aria-label={locale().enter + " " + value.name}
                                />
                              ) : (
                                <Form.Control
                                  type="number"
                                  id={value.name}
                                  value={isNaN(value.value) ? "" : value.value}
                                  onChange={(e) => {
                                    e.preventDefault();
                                    props.handleChanges(
                                      parseInt(e.target.value, 10),
                                      [i, "values", parseInt(key, 10), "value"]
                                    );
                                  }}
                                  aria-label={locale().enter + " " + value.name}
                                />
                              )}
                            </Col>
                          </Row>
                        );
                      })
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Row>
          );
        })
      )}
      {props.samples.length !== 0 && (
        <Button
          variant="link"
          onClick={() => {
            props.handleAddSample(props.samples, props.items);
          }}
        >
          <i
            className="fa fa-plus-circle"
            aria-hidden="true"
            title={"Add sample"}
            style={{
              width: 30 + "px",
              height: 30 + "px",
              marginRight: 10 + "px",
              opacity: 0.85,
            }}
          ></i>
        </Button>
      )}
      <br />
      <Button variant="primary" onClick={props.submitFunction}>
        {locale().submit}
      </Button>
      <hr />
      <br />
      <font>{props.msg}</font>
    </Container>
  );
};
