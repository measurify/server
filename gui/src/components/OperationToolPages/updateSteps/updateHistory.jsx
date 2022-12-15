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
import { NavLink } from "react-router-dom";
import { languages } from "../../../config";
import {
  testLogger,
  logsManager,
  postHistoryFile,
  postHistoryStep,
} from "../../../services/operation_tool_services";
import AppContext from "../../../context";
import "../../page/page.scss";
import UpdateHistoryFileForm from "./updateHistoryFileForm";
import UpdateHistoryForm from "./updateHistoryForm";
import { get_generic } from "../../../services/http_operations";
import { maintainEmptyElement } from "../../../services/objects_manipulation";
import { removeDefaultElements } from "../../../services/misc_functions";
const cloneDeep = require("clone-deep");

const ovdRef = React.createRef();
const csvSepRef = React.createRef();
const arraySepRef = React.createRef();
const floatSepRef = React.createRef();

export default function UpdateHistoryPage() {
  const [csvContent, setCsvContent] = useState(null);
  const [csvHeader, setCsvHeader] = useState(null);
  const myLogs = useContext(AppContext).logs;
  const [now, setNow] = useState(0);
  const [file, setFile] = useState(null);
  //type of input to post resources
  const [postType, setPostType] = useState("file");

  const [operationindex, setOperationIndex] = useState(0);
  const [experiments, setExperiments] = useState([]);
  const [experiment, setExperiment] = useState("");
  const [values, setValues] = useState({});
  //message for user
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const [csvSep, setCsvSep] = useState(",");

  useEffect(() => {
    const getExperiments = async () => {
      const res = await get_generic("experiments", {});

      setExperiments(res.docs);
    };
    getExperiments();
  }, []);

  const postHistory = async (e) => {
    e.preventDefault();
    const csvSep = csvSepRef.current.value;
    const arraySep = arraySepRef.current.value;
    const floatSep = floatSepRef.current.value;
    const ovd = ovdRef.current.checked;

    if (csvSep === "" || arraySep === "" || floatSep === "") {
      setMsg("Please, define all the separators");
      setIsError(true);
      return;
    }
    if (csvSep === arraySep || csvSep === floatSep || arraySep === floatSep) {
      setMsg("All the separators should have different values");
      setIsError(true);
      return;
    }
    if (file === null || file === undefined) {
      setMsg("Please, choose a file");
      setIsError(true);
      return;
    }
    setMsg("");
    setIsError(false);
    setNow(0);
    myLogs.PushLog({
      type: "info",
      msg: "-------Begin Upload Operation " + operationindex + "-------\n",
    });
    await postHistoryFile(file, ovd, csvSep, arraySep, floatSep);
    myLogs.PushLog({
      type: "info",
      msg: "-------End Upload Operation " + operationindex + "-------\n\n",
    });
    setOperationIndex((prev) => prev + 1);
    setNow(100);
  };

  const postStep = async (e) => {
    e.preventDefault();
    let tmpValues = cloneDeep(values);
    tmpValues = removeDefaultElements(tmpValues);

    if (experiment === undefined || experiment === "") {
      setMsg("Please, select one experiment");
      setIsError(true);
      return;
    }

    tmpValues["fields"] = tmpValues["fields"].filter(
      (e) =>
        (typeof e.value === "number" && !isNaN(e.value)) ||
        (typeof e.value === "string" && e.value !== "") ||
        (Array.isArray(e.value) && e.value.length !== 0)
    );

    if (isNaN(tmpValues["step"])) {
      setMsg("Please, define the step number");
      setIsError(true);
      return;
    }
    if (tmpValues["fields"].length === 0) {
      setMsg("Please, define at least one field");
      setIsError(true);
      return;
    }
    //reset error message
    setMsg("");
    setIsError(false);

    const body = {};
    const add = [];
    add.push(tmpValues);
    body["history"] = { add };

    setNow(0);
    myLogs.PushLog({
      type: "info",
      msg: "-------Begin Upload Operation " + operationindex + "-------\n",
    });
    await postHistoryStep(experiment, body, ovdRef.current.checked);
    myLogs.PushLog({
      type: "info",
      msg: "-------End Upload Operation " + operationindex + "-------\n\n",
    });
    setOperationIndex((prev) => prev + 1);
    setNow(100);
  };

  //handle way selector to post new entity
  const handleTypeSelect = (eventKey) => {
    setPostType(eventKey);
    setMsg("");
    setIsError(false);
  };

  const handleExperimentChange = async (e) => {
    e.preventDefault();
    const experiment = experiments.filter((ex) => ex._id === e.target.value)[0];
    const expProtocol = experiment.protocol;
    const fst = { _id: expProtocol };
    const qs = { filter: JSON.stringify(fst) };
    const res = await get_generic("protocols", qs);
    const protocol = res.docs[0];
    let fields = [];
    const protoFields = protocol.topics.map((el) => el.fields);
    protoFields.forEach((el) => {
      fields = fields.concat(
        el.map((obj) => {
          let val =
            obj.type === "scalar"
              ? NaN
              : obj.type === "vector"
              ? [NaN]
              : obj.type === "text"
              ? ""
              : //TODO else
                "";
          return { name: obj.name, value: val };
        })
      );
    });
    const _values = {};
    _values["step"] = NaN;
    _values["fields"] = fields;
    setValues(_values);
    setExperiment(e.target.value);
  };

  //handle changes
  const handleChanges = (val, path) => {
    let tmpVals = cloneDeep(values);
    let valuesPtr = tmpVals;

    let i;
    let lastIndexNumber = -1;
    for (i = 0; i < path.length - 1; i++) {
      valuesPtr = valuesPtr[path[i]];
      if (typeof path[i] === "number") lastIndexNumber = i;
    }
    if (typeof path[i] === "number") lastIndexNumber = i;
    valuesPtr[path[i]] = val;
    //check if an array is present
    if (lastIndexNumber !== -1) {
      //only string and numbers are allowed as item, with this version
      const item = typeof val === "number" ? NaN : "";

      tmpVals = maintainEmptyElement(
        tmpVals,
        path.slice(0, lastIndexNumber),
        undefined,
        undefined,
        item
      );
    }
    setValues(tmpVals);
  };
  return (
    <div className="page">
      <header className="page-header">Update Experiment History</header>
      <main className="page-content">
        <Nav
          justify
          variant="tabs"
          className="justify-content-center"
          onSelect={handleTypeSelect}
          defaultActiveKey="file"
        >
          <Nav.Item>
            <Nav.Link eventKey="form">Form</Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link eventKey="file">File</Nav.Link>
          </Nav.Item>
        </Nav>
        <Container fluid>
          {postType === "form" && (
            <Row>
              <UpdateHistoryForm
                postHistory={postStep}
                values={values}
                ovdRef={ovdRef}
                handleExperimentChange={handleExperimentChange}
                handleChanges={handleChanges}
                experiments={experiments}
              />
            </Row>
          )}
          {postType === "file" && (
            <Row>
              <UpdateHistoryFileForm
                postHistory={postHistory}
                arraySepRef={arraySepRef}
                csvSep={csvSep}
                setCsvSep={setCsvSep}
                floatSepRef={floatSepRef}
                ovdRef={ovdRef}
                setCsvHeader={setCsvHeader}
                setCsvContent={setCsvContent}
                setFile={setFile}
                file={file}
                csvContent={csvContent}
                csvHeader={csvHeader}
              />
            </Row>
          )}
          <Row>
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
