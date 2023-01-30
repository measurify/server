import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Form,
  Container,
  Row,
  Col,
  Accordion,
  Table,
  ProgressBar,
  Nav,
} from "react-bootstrap";
import locale from "../../../common/locale";

export default function UpdateHistoryFileForm(props) {
  /*console.log({
    postHistory: props.postHistory,
    arraySepRef: props.arraySepRef,
    csvSepRef: props.csvSepRef,
    floatSepRef: props.floatSepRef,
    ovdRef: props.ovdRef,
    setCsvHeader: props.setCsvHeader,
    setCsvContent: props.setCsvContent,
    setFile: props.setFile,
    file: props.file,
    csvContent: props.csvContent,
    csvHeader: props.csvHeader,
  });*/
  if (
    props.postHistory === undefined ||
    props.arraySepRef === undefined ||
    props.csvSepRef === undefined ||
    props.floatSepRef === undefined ||
    props.ovdRef === undefined ||
    props.setCsvHeader === undefined ||
    props.setCsvContent === undefined ||
    props.setFile === undefined ||
    props.file === undefined ||
    props.csvContent === undefined ||
    props.csvHeader === undefined
  )
    return "Loading";
  return (
    <Form onSubmit={props.postHistory}>
      <Row style={{ paddingTop: 10 + "px" }}>
        <Col sm={1}>
          <Form.Group className="mb-3">
            <Form.Select
              aria-label="CSV Column Separator"
              ref={props.csvSepRef}
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
              const _file = e.target.files[0];
              //props.setFile(file);
              const fileReader = new FileReader();

              fileReader.onloadend = () => {
                const _content = fileReader.result;

                const regex = new RegExp("\\r", "g");
                let splitted = _content.replace(regex, "").split("\n");

                props.setCsvHeader(splitted[0]);
                props.setFile(_file);
                splitted.splice(0, 1);
                props.setCsvContent(splitted);
              };
              fileReader.readAsText(_file);
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
              <Accordion.Body style={{ overflow: "scroll", height: 70 + "vh" }}>
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      {React.Children.toArray(
                        props.csvHeader
                          .split(props.csvSepRef.current.value)
                          .map((h) => {
                            return <th>{h}</th>;
                          })
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {React.Children.toArray(
                      props.csvContent.map((e) => {
                        return (
                          <tr>
                            {React.Children.toArray(
                              e
                                .split(props.csvSepRef.current.value)
                                .map((h) => {
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
