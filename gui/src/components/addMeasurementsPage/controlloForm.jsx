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

import fontawesome from "@fortawesome/fontawesome";
import { faMinusCircle } from "@fortawesome/fontawesome-free-solid";
fontawesome.library.add(faMinusCircle);

const cloneDeep = require("clone-deep");

export const ControlloForm = (props) => {
  //return if something is undefined
  if (
    props.values === undefined ||
    props.submitFunction === undefined ||
    props.handleAddItemArray === undefined ||
    props.handleRemoveItemArray === undefined ||
    props.items === undefined ||
    props.getAddress === undefined ||
    props.msg === undefined ||
    props.handleChanges === undefined ||
    props.refreshLocation === undefined ||
    props.addrMsg === undefined
  )
    return "Loading";

  const UnrollObjectControllo = (obj, path) => {
    return React.Children.toArray(
      Object.entries(obj).map((entr) => {
        const newPath = [...path];
        newPath.push(entr[0]);
        //address case (with button for geolocalization)
        if (entr[0] === "address" || entr[0] === "indirizzo") {
          return (
            <Row
              style={{
                paddingBottom: 10 + "px",
              }}
            >
              <Col xs={9}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    value={entr[1]}
                    onChange={(e) => {
                      e.preventDefault();
                      props.handleChanges(e.target.value, newPath);
                    }}
                    placeholder={locale().enter + " " + entr[0]}
                  />
                  <Form.Text className="text-muted">{props.addrMsg}</Form.Text>
                </Form.Group>
              </Col>
              <Col xs>
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
              </Col>
            </Row>
          );
        }
        //età case (number)
        if (entr[0] === "età") {
          return (
            <Row
              style={{
                paddingBottom: 10 + "px",
              }}
            >
              <Col xs={9}>
                <Form.Group>
                  <Form.Control
                    type="number"
                    value={isNaN(entr[1]) ? "" : entr[1]}
                    onChange={(e) => {
                      e.preventDefault();
                      props.handleChanges(
                        parseInt(e.target.value, 10),
                        newPath
                      );
                    }}
                    aria-label={locale().enter + " " + entr[0]}
                    placeholder={locale().enter + " " + entr[0]}
                  />
                </Form.Group>
              </Col>
            </Row>
          );
        }

        //index case (number) -- functional purpouse
        if (entr[0] === "index") {
          return "";
        }

        //note case (textarea)
        if (entr[0] === "note") {
          return (
            <Row
              style={{
                paddingBottom: 10 + "px",
              }}
            >
              <Col xs={12}>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    type="text"
                    value={entr[1]}
                    onChange={(e) => {
                      e.preventDefault();
                      props.handleChanges(e.target.value, newPath);
                    }}
                    placeholder={locale().enter + " " + entr[0]}
                  />
                </Form.Group>
              </Col>
            </Row>
          );
        }
        //date case
        if (entr[0] === "date" || entr[0] === "data") {
          const d = new Date();
          return (
            <Row
              style={{
                paddingBottom: 10 + "px",
              }}
            >
              <Col xs={9}>
                <Form.Control
                  type="date"
                  defaultValue={[
                    d.toLocaleString("default", { year: "numeric" }),
                    d.toLocaleString("default", { month: "2-digit" }),
                    d.toLocaleString("default", { day: "2-digit" }),
                  ].join("-")}
                  onChange={(e) => {
                    const dt = new Date(e.target.value).getTime();
                    props.handleChanges(dt, newPath);
                  }}
                  aria-label={locale().enter + " " + entr[0]}
                />
              </Col>
            </Row>
          );
        }
        //enum case
        const filtered = props.items.filter(
          (e) => e.type === "enum" && e.name === entr[0]
        )[0];
        let options = null;
        if (filtered !== undefined) options = filtered.range;
        if (options !== null) {
          return (
            <Row
              style={{
                paddingBottom: 10 + "px",
              }}
            >
              <Col xs={9}>
                <Form.Select
                  xs={9}
                  aria-label={locale().select + " " + entr[0]}
                  value={entr[1]}
                  onChange={(e) => {
                    e.preventDefault();
                    props.handleChanges(e.target.value, newPath);
                  }}
                >
                  <option value="">{locale().select + " " + entr[0]}</option>
                  {React.Children.toArray(
                    options.map((e) => {
                      return <option value={e}>{e}</option>;
                    })
                  )}
                </Form.Select>
              </Col>
            </Row>
          );
        }

        //array case (persone e sostanze)
        if (Array.isArray(entr[1])) {
          return React.Children.toArray(
            entr[1].map((e, i) => {
              const newPath = [...path];
              newPath.push(entr[0]);
              newPath.push(i);
              return (
                <Row>
                  <Accordion>
                    <Accordion.Item>
                      <Accordion.Header>
                        {entr[0] === "persone" ? "Persona" : "Sostanza"} {i + 1}
                      </Accordion.Header>
                      <Accordion.Body>
                        <Row
                          style={{
                            paddingBottom: 10 + "px",
                          }}
                        >
                          <Col>
                            <Button
                              variant="outline-danger"
                              onClick={(e) => {
                                e.preventDefault();
                                props.handleRemoveItemArray(newPath);
                              }}
                              style={{ textDecoration: "none" }}
                            >
                              <i
                                className="fa fa-minus-circle"
                                aria-hidden="true"
                                title={"Remove"}
                                style={{
                                  width: 25 + "px",
                                  height: 25 + "px",
                                  opacity: 0.85,
                                }}
                              ></i>
                              &nbsp;Rimuovi&nbsp;
                              {entr[0] === "persone" ? "persona" : "sostanza"}
                              &nbsp;
                              {i + 1}
                            </Button>
                          </Col>
                        </Row>
                        {UnrollObjectControllo(e, newPath)}
                        {i === entr[1].length - 1 && (
                          <Row>
                            <Col>
                              <Button
                                variant="link"
                                onClick={(e) => {
                                  e.preventDefault();
                                  props.handleAddItemArray(newPath);
                                }}
                                style={{ textDecoration: "none" }}
                              >
                                <i
                                  className="fa fa-plus-circle"
                                  aria-hidden="true"
                                  title={"Add"}
                                  style={{
                                    width: 25 + "px",
                                    height: 25 + "px",
                                    opacity: 0.85,
                                  }}
                                ></i>
                                &nbsp;Aggiungi&nbsp;
                                {entr[0] === "persone" ? "persona" : "sostanza"}
                              </Button>
                            </Col>
                          </Row>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Row>
              );
            })
          );
        }

        return <Row>{entr[0] + entr[1]}</Row>;
      })
    );
  };

  return (
    <Container
      fluid
      style={{
        paddingRight: 20 + "px",
        paddingLeft: 20 + "px",
      }}
    >
      {UnrollObjectControllo(props.values, [])}
      <Row
        style={{
          padding: 10 + "px",
        }}
      >
        <Col>
          <Button variant="primary" onClick={props.submitFunction}>
            {locale().submit}
          </Button>
        </Col>
      </Row>
      <font>{props.msg}</font>
    </Container>
  );
};
