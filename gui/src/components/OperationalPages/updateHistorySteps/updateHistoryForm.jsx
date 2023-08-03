import React from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import locale from "../../../common/locale";
import { FormManager } from "../../formManager/formManager";

export default function UpdateHistoryFileForm(props) {
  if (
    props.experiments === undefined ||
    props.postHistory === undefined ||
    props.values === undefined ||
    props.ovdRef === undefined ||
    props.handleExperimentChange === undefined ||
    props.handleChanges === undefined
  )
    return "Loading";

  return (
    <Container fluid>
      <Row style={{ paddingTop: 10 + "px", paddingBottom: 10 + "px" }}>
        <Col>
          {props.experiments.length === 0 &&
            "No experiments present in database"}
          {props.experiments.length !== 0 && (
            <Form.Select
              aria-label={locale().select + " experiment"}
              onChange={props.handleExperimentChange}
            >
              <option>
                {locale().select} experiment to update its history
              </option>
              {React.Children.toArray(
                props.experiments.map((e) => {
                  return <option value={e["_id"]}>{e["_id"]}</option>;
                })
              )}
            </Form.Select>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          {props.experiments.length !== 0 && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Update step if already present in History Experiment"
                ref={props.ovdRef}
              />
            </Form.Group>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          {props.experiments.length !== 0 && (
            <FormManager
              values={props.values}
              resource={"updateHistory"}
              functionalFields={{ updateHistory: {} }}
              disabledFields={{ fields: { name: true } }}
              handleChangesCallback={props.handleChanges}
              arrayDeleteCallback={() => {}}
              submitFunction={props.postHistory}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}
