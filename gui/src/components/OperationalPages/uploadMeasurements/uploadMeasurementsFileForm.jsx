import React, { useState } from "react";
import { Button, Form, Row, Col, Accordion, Table } from "react-bootstrap";
import locale from "../../../common/locale";
import Papa from "papaparse";
export default function UploadMeasurementsFileForm(props) {
  const [csvSepGot, setCsvSepGot] = useState(undefined);
  /*
  console.log({
    postHistory: props.postHistory,
    arraySepRef: props.arraySepRef,

    csvSep: props.csvSep,
    floatSepRef: props.floatSepRef,
    setCsvContent: props.setCsvContent,
    setFiles: props.setFiles,
    files: props.files,
    csvContent: props.csvContent,
  });*/
  if (
    props.postHistory === undefined ||
    props.arraySepRef === undefined ||
    props.floatSepRef === undefined ||
    props.csvSep === undefined ||
    props.setCsvSep === undefined ||
    props.setCsvContent === undefined ||
    props.setFiles === undefined ||
    props.files === undefined ||
    props.setDescription === undefined ||
    props.description === undefined ||
    props.csvContent === undefined
  )
    return "Loading";

  return (
    <Form onSubmit={props.postHistory}>
      <Row style={{ paddingTop: 10 + "px" }}>
        <Col sm={3}>
          <b>Description file</b>
        </Col>
      </Row>
      <Row style={{ paddingTop: 10 + "px" }}>
        <Col sm={3}>
          <Form.Control
            className="mb-3"
            type="file"
            accept=".json"
            label="File"
            onChange={(e) => {
              if (
                e.target.value === null ||
                e.target.value === undefined ||
                e.target.value === ""
              ) {
                props.setDescription(null);
                return;
              }
              props.setDescription(e.target.files[0]);
            }}
          />
        </Col>
      </Row>
      <Row style={{ paddingTop: 10 + "px" }}>
        <Col sm={3}>
          <b>Measurements CSV file</b>
        </Col>
      </Row>
      <Row style={{ paddingTop: 10 + "px" }}>
        <Col sm={1}>
          <Form.Group className="mb-3">
            <Form.Select
              aria-label="CSV Column Separator"
              value={props.csvSep}
              onChange={(e) => {
                e.preventDefault();
                props.setCsvSep(e.target.value);
              }}
            >
              <option value=",">,</option>
              <option value=";">;</option>
              <option value="-">-</option>
              <option value="\t">\t</option>
            </Form.Select>
            <Form.Text className="text-muted">Column separator</Form.Text>
          </Form.Group>
        </Col>
        <Col sm={1}>
          <Form.Group className="mb-3">
            <Form.Select
              aria-label="CSV Array separator"
              ref={props.arraySepRef}
            >
              <option value=";">;</option>
              <option value=",">,</option>
              <option value=".">.</option>
              <option value="-">-</option>
            </Form.Select>
            <Form.Text className="text-muted">Array separator</Form.Text>
          </Form.Group>
        </Col>
        <Col sm={1}>
          <Form.Group className="mb-3">
            <Form.Select
              aria-label="CSV Floating Point separator"
              ref={props.floatSepRef}
            >
              <option value=".">.</option>
              <option value=",">,</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Floating Point separator
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col sm={3}>
          <Form.Control
            className="mb-3"
            type="file"
            accept=".csv"
            label="File"
            onChange={(e) => {
              if (
                e.target.value === null ||
                e.target.value === undefined ||
                e.target.value === ""
              ) {
                props.setFiles(null);
                props.setCsvContent(null);
                return;
              }
              props.setFiles(e.target.files);
              if (e.target.files.length === 1) {
                const _file = e.target.files[0];
                Papa.parse(_file, {
                  preview: 11,
                  complete: function (results) {
                    setCsvSepGot(results.meta.delimiter);
                    props.setCsvContent(results.data);
                  },
                });
              }
            }}
          />
        </Col>
      </Row>
      {props.csvContent !== null && (
        <Row>
          <Accordion
            style={{
              overflow: "scroll",
              //height: 70 + "vh",
              width: 28 + "vw",
              //width: 1200 + "px",
            }}
          >
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                {locale().preview + " - " + props.files[0].name}
              </Accordion.Header>
              <Accordion.Body>
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      {React.Children.toArray(
                        props.csvContent[0].map((h) => {
                          return <th>{h}</th>;
                        })
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {React.Children.toArray(
                      props.csvContent.slice(1).map((e) => {
                        return (
                          <tr>
                            {React.Children.toArray(
                              e.map((h) => {
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
        </Row>
      )}
      {csvSepGot !== undefined && csvSepGot !== props.csvSep && (
        <Row>
          <Col>
            <font
              style={{
                marginLeft: 5 + "px",
                color: "black",
              }}
            >
              Warning: the selected separator '{props.csvSep}' is different from
              the one detected in file '{csvSepGot}'. Please check if everything
              is correct than submit the operation.
            </font>
          </Col>
        </Row>
      )}
      <Row>
        <Col>
          <Button variant="primary" type="submit">
            {locale().submit}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
