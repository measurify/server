import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Form,
  Container,
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";
import locale from "../../../common/locale";
import { deleteHistorySteps } from "../../../services/operation_tool_services";
import AppContext from "../../../context";
import "../../page/page.scss";
import { get_generic } from "../../../services/http_operations";

const stepsStringRef = React.createRef();

export default function RemoveStepsPage() {
  const myLogs = useContext(AppContext).logs;
  const [now, setNow] = useState(0);

  const [operationindex, setOperationIndex] = useState(0);
  const [experiments, setExperiments] = useState([]);
  const [experiment, setExperiment] = useState();
  const [steps, setSteps] = useState();
  //message for user
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  //fetch experiments (limit 100) on load
  useEffect(() => {
    const getExperiments = async () => {
      try {
        const res = await get_generic("experiments", { limit: -1 });

        setExperiments(res.docs);
      } catch (error) {
        console.error(error);
      }
    };
    getExperiments();
  }, []);

  //handle changes on select experiment
  const handleExperimentChange = (e) => {
    const selected = e.target.value;
    setMsg("");
    setIsError(false);
    if (e.target.selectedIndex === 0) {
      setExperiment(undefined);
      setSteps(undefined);
      return;
    }
    const _experiment = experiments.filter((ex) => ex._id === selected)[0];
    const _steps = _experiment.history.map((h) => h.step).sort((a, b) => a - b);

    setExperiment(selected);
    setSteps(_steps);
  };

  //download history as CSV fules
  const deleteStepsHandler = async () => {
    let toRemove = [];
    let newSteps = [...steps];
    let definedSteps;
    const stepsString = stepsStringRef.current.value;
    if (stepsString === "") {
      setMsg("Please, define at least one step");
      setIsError(true);
      return;
    }
    //check for all "*" option
    if (stepsString.includes("*")) {
      toRemove = toRemove.concat(steps);
      newSteps = [];
    }
    //otherwise check each step
    else {
      definedSteps = stepsString.replace(/\s/g, "").split(",");
      definedSteps.forEach((e) => {
        if (e.includes("-")) {
          const interval = e.split("-");
          //search for the begin and end into step array
          const begin = steps.indexOf(parseInt(interval[0]));
          const end = steps.indexOf(parseInt(interval[1]));
          if (begin !== -1 && end !== -1) {
            for (let i = begin; i <= end; i++) {
              toRemove.push(steps[i]);
              newSteps.splice(newSteps.indexOf(steps[i]), 1);
            }
          }
        } else if (steps.includes(parseInt(e))) {
          toRemove.push(parseInt(e));
          newSteps.splice(newSteps.indexOf(parseInt(e)), 1);
        }
      });
    }
    if (toRemove.length === 0) {
      setMsg(
        "The experiment history does not contain specified steps, please check them"
      );
      setIsError(true);
      return;
    }
    setMsg("");
    setIsError(false);
    setNow(0);

    myLogs.PushLog({
      type: "info",
      msg: "-------Begin Remove Operation " + operationindex + "-------\n",
    });
    try {
      await deleteHistorySteps(experiment, toRemove);
    } catch (error) {
      console.error(error);
    }

    myLogs.PushLog({
      type: "info",
      msg: "-------End Remove Operation " + operationindex + "-------\n\n",
    });

    setOperationIndex((prev) => prev + 1);
    setNow(100);
    setSteps(newSteps);
  };

  return (
    <div className="page">
      <header className="page-header">
        Remove steps from Experiment History
      </header>
      <main className="page-content">
        <Container fluid>
          <Row style={{ paddingBottom: 10 + "px" }}>
            <Col>
              <b>Select experiment</b>
            </Col>
          </Row>
          <Row style={{ paddingBottom: 10 + "px" }}>
            <Col sm={3}>
              {experiments.length === 0 && "No experiments present in database"}
              {experiments.length !== 0 && (
                <Form.Select
                  aria-label={locale().select + " experiment"}
                  onChange={handleExperimentChange}
                >
                  <option>{locale().select} experiment</option>
                  {React.Children.toArray(
                    experiments.map((e) => {
                      return <option value={e["_id"]}>{e["_id"]}</option>;
                    })
                  )}
                </Form.Select>
              )}
            </Col>
            {experiment !== undefined && (
              <Col>
                History steps contained into <b>{experiment}</b>: [{" "}
                {steps.join(", ")} ]
              </Col>
            )}
          </Row>
          {steps !== undefined && steps.length === 0 && (
            <Row style={{ paddingBottom: 10 + "px" }}>
              <Col>
                The selected experiment's history does not contain steps
              </Col>
            </Row>
          )}
          {steps !== undefined && steps.length !== 0 && (
            <>
              <Row style={{ paddingBottom: 10 + "px" }}>
                <Col sm={3}>
                  <Form.Group className="mb-3">
                    <Form.Control type={"text"} ref={stepsStringRef} />
                    <Form.Text className="text-muted">
                      Define the steps comma separated.
                      <br /> intervals can be specified as begin-end (included).{" "}
                      <br /> to remove all steps enter * <br />
                      Example: 2, 3, 5-7
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button onClick={deleteStepsHandler}>Remove steps</Button>
                </Col>
              </Row>
            </>
          )}
          <Row style={{ paddingBottom: 10 + "px" }}>
            <Col>
              <font
                style={{
                  marginLeft: 5 + "px",
                  color: isError ? "red" : "black",
                }}
              >
                {msg}
              </font>
            </Col>
          </Row>
          <Row style={{ paddingTop: 10 + "px", paddingBottom: 10 + "px" }}>
            <Col>
              <ProgressBar
                now={now}
                label={`${now}%`}
                variant={now === 100 ? "success" : "info"}
              />
            </Col>
          </Row>
          <Row style={{ paddingTop: 10 + "px", paddingBottom: 10 + "px" }}>
            <Col>
              <b>Operation logs</b>
            </Col>
          </Row>
          <Row>
            <Col>
              <textarea
                id="logger"
                style={{ resize: "both" }}
                cols="100"
                rows="10"
                readOnly
                value={myLogs.logs
                  .map((l) => l.msg)
                  .reverse()
                  .join("-")}
              />
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
}
