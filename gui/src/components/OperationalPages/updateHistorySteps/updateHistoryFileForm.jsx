import React, { useState } from "react";
import { Button, Form, Row, Col, Accordion, Table } from "react-bootstrap";
import locale from "../../../common/locale";
import Papa from "papaparse";

export default function UpdateHistoryFileForm(props) {
  const [csvSepGot, setCsvSepGot] = useState(undefined);

  if (
    props.postHistory === undefined ||
    props.arraySepRef === undefined ||
    props.floatSepRef === undefined ||
    props.csvSep === undefined ||
    props.setCsvSep === undefined ||
    props.ovdRef === undefined ||
    props.setCsvContent === undefined ||
    props.setFile === undefined ||
    props.file === undefined ||
    props.csvContent === undefined
  )
    return "Loading";

  return (
    <Form onSubmit={props.postHistory}>
      <Row style={{ paddingTop: 10 + "px" }}>
        <Col xxl={1} xl={2} lg={4} sm={3}>
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
        <Col xxl={1} xl={2} lg={4} sm={3}>
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
        <Col xxl={1} xl={2} lg={4} sm={3}>
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
        <Col xxl={3} xl={6} lg={8} sm={8}>
          <Form.Control
            className="mb-3"
            type="file"
            accept=".csv"
            label="File"
            onChange={(e) => {
              if (
                e.target.files === null ||
                e.target.files === undefined ||
                e.target.files === ""
              ) {
                props.setFile(null);
                props.setCsvContent(null);
                return;
              }
              const _file = e.target.files[0];
              //props.setFile(file);
              props.setFile(_file);
              Papa.parse(_file, {
                preview: 11,
                complete: function (results) {
                  setCsvSepGot(results.meta.delimiter);

                  props.setCsvContent(results.data);
                },
              });
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Update duplicate steps in History Experiment"
              ref={props.ovdRef}
            />
          </Form.Group>
        </Col>
      </Row>
      {props.csvContent !== null && (
        <Row>
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                {locale().preview + " - " + props.file.name}
              </Accordion.Header>
              <Accordion.Body
                style={{
                  overflow: "scroll",
                  height: 70 + "vh",
                  width: 1200 + "px",
                }}
              >
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
        <Row style={{ padding: 5 + "px" }}>
          <Col>
            <font
              style={{
                marginLeft: 5 + "px",
                color: "red",
              }}
            >
              Warning: the selected separator '<b>{props.csvSep}</b>' is
              different from the one detected in file '<b>{csvSepGot}</b>'.
              Please check if all separators are correct, than submit the
              operation.
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
