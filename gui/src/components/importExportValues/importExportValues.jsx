import React, { useEffect, useState } from "react";
import locale from "../../common/locale";
import {
  post_generic,
  get_generic,
  post_file_generic,
} from "../../services/http_operations";
import { useSearchParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import {
  Form,
  Nav,
  Accordion,
  Container,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { FormManager } from "../formManager/formManager";
import { FormFile } from "../formFileComp/formFile";

import { saveAs } from "file-saver";

export default function ImportExportValues(props) {
  const [content, setContent] = useState(null);
  return (
    <Accordion defaultActiveKey={0} size={"lg"}>
      <Accordion.Item eventKey={0}>
        <Accordion.Header>
          {locale().import +
            " - " +
            locale().export +
            " " +
            locale().configuration}
        </Accordion.Header>
        <Accordion.Body>
          <Container>
            <Row>
              <Col sm={6}>
                <Form onSubmit={() => props.importValues(content)}>
                  <Row>
                    <b>Import configuration from json file</b>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>
                        <b>{locale().select_file}</b>
                      </Form.Label>
                      <Form.Control
                        className="mb-3"
                        type="file"
                        accept=".json"
                        label="File"
                        onChange={(e) => {
                          e.preventDefault();
                          const file = e.target.files[0];
                          //props.setFile(file);
                          const fileReader = new FileReader();

                          fileReader.onloadend = () => {
                            const _content = fileReader.result;
                            setContent(_content);
                          };
                          fileReader.readAsText(file);
                        }}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <font
                        style={{
                          marginLeft: 5 + "px",
                          color: "red",
                        }}
                      >
                        {props.importMsg}
                      </font>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Button type="submit" variant="success">
                        Load
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Col>
              <Col sm={6}>
                <Row>
                  <b>Download configuration as json file</b>
                </Row>
                <Row style={{ paddingTop: 22 + "px" }}>
                  <Col>
                    <Button
                      variant="primary"
                      onClick={() => {
                        const blob = new Blob([
                          JSON.stringify(props.values, null, 4),
                        ]);
                        saveAs(
                          blob,
                          (props.values["_id"] !== ""
                            ? props.values["_id"]
                            : "Experiment") + ".json"
                        );
                      }}
                    >
                      Download
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

/*

                  {props.contentBody !== null && props.contentHeader !== null && (
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
                                  props.contentHeader.split(",").map((h) => {
                                    return <th>{h}</th>;
                                  })
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {React.Children.toArray(
                                props.contentBody.map((e) => {
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
                  {props.contentPlain !== null && (
                    <Accordion>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>
                          {locale().file_content}
                        </Accordion.Header>
                        <Accordion.Body
                          style={{ overflow: "scroll", height: 70 + "vh" }}
                        >
                          <textarea
                            //style={{ resize: "both;" }}
                            cols="120"
                            rows="10"
                            readOnly
                          >
                            {props.contentPlain}
                          </textarea>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  )}


*/
