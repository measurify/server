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
import { downloadHistory } from "../../../services/operation_tool_services";
import AppContext from "../../../context";
import "../../page/page.scss";
import { get_generic } from "../../../services/http_operations";
import { saveAs } from "file-saver";
import { downloadZip } from "client-zip";

const experimentSelectRef = React.createRef();
const csvSepRef = React.createRef();
const arraySepRef = React.createRef();
const floatSepRef = React.createRef();
const compressRef = React.createRef();

export default function DownloadHistoryPage() {
  const myLogs = useContext(AppContext).logs;
  const [now, setNow] = useState(0);

  const [operationindex, setOperationIndex] = useState(0);
  const [experiments, setExperiments] = useState([]);
  //message for user
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  //fetch experiments (limit 100) on load
  useEffect(() => {
    const getExperiments = async () => {
      const res = await get_generic("experiments", { limit: 100 });

      setExperiments(res.docs);
    };
    getExperiments();
  }, []);

  //download history as CSV fules
  const downloadHistoryHandler = async () => {
    const csvSep = csvSepRef.current.value;
    const arrSep = arraySepRef.current.value;
    const floatSep = floatSepRef.current.value;
    const exp = experimentSelectRef.current.value;
    const expIndex = experimentSelectRef.current.selectedIndex;
    const compress = compressRef.current.checked;

    if (expIndex === 0) {
      setMsg("Please, select one or All experiment");
      setIsError(true);
      return;
    }
    if (csvSep === "" || floatSep === "" || arrSep === "") {
      setMsg("Please, define all the separators");
      setIsError(true);
      return;
    }
    if (csvSep === arrSep || csvSep === floatSep || arrSep === floatSep) {
      setMsg("Please, define three different separators");
      setIsError(true);
      return;
    }
    setMsg("");
    setIsError(false);
    setNow(0);

    myLogs.PushLog({
      type: "info",
      msg: "-------Begin Download Operation " + operationindex + "-------\n",
    });

    const files = [];
    if (exp === "All") {
      for (let i = 0; i < experiments.length; i++) {
        try {
          const f = await downloadHistory(
            experiments[i]._id,
            csvSep,
            arrSep,
            floatSep,
            compress
          );
          files.push(f);
        } catch (error) {
          console.error(error);
        }

        setNow(((i + 1) / experiments.length) * 100);
      }
    } else {
      try {
        const f = await downloadHistory(
          exp,
          csvSep,
          arrSep,
          floatSep,
          compress
        );
        files.push(f);
      } catch (error) {
        console.error(error);
      }
    }
    if (compress === true) {
      const content = await downloadZip(files).blob();
      saveAs(content, "experiments_history.zip");
      myLogs.PushLog({
        type: "info",
        msg: "Files compressed into experiments_history.zip archive\n",
      });
    }
    myLogs.PushLog({
      type: "info",
      msg: "-------End Download Operation " + operationindex + "-------\n\n",
    });
    setOperationIndex((prev) => prev + 1);
    setNow(100);
  };

  //download experiments (already fetched from DB) as json files
  const downloadDataHandler = async () => {
    const exp = experimentSelectRef.current.value;
    const expIndex = experimentSelectRef.current.selectedIndex;
    const compress = compressRef.current.checked;

    if (expIndex === 0) {
      setMsg("Please, select one or All experiment");
      setIsError(true);
      return;
    }
    setMsg("");
    setIsError(false);
    setNow(0);
    myLogs.PushLog({
      type: "info",
      msg: "-------Begin Download Operation " + operationindex + "-------\n",
    });

    const files = [];
    if (exp === "All") {
      for (let i = 0; i < experiments.length; i++) {
        const blob = new Blob([JSON.stringify(experiments[i], null, 4)]);
        const fileName = experiments[i]._id + ".json";

        let file = null;
        if (compress === undefined || compress === false) {
          saveAs(blob, fileName);
        } else {
          file = new File([blob], fileName);
        }

        files.push(file);

        myLogs.PushLog({
          type: "info",
          msg: fileName + " successfully downloaded.\n",
        });
        setNow(((i + 1) / experiments.length) * 100);
      }
    } else {
      const experiment = experiments.filter((ex) => ex._id === exp)[0];
      const blob = new Blob([JSON.stringify(experiment, null, 4)]);
      const fileName = exp + ".json";

      let file = null;
      if (compress === undefined || compress === false) {
        saveAs(blob, fileName);
      } else {
        file = new File([blob], fileName);
      }
      files.push(file);
      myLogs.PushLog({
        type: "info",
        msg: fileName + " successfully downloaded.\n",
      });
    }
    if (compress === true) {
      const content = await downloadZip(files).blob();
      saveAs(content, "experiments_data.zip");
      myLogs.PushLog({
        type: "info",
        msg: "Files compressed into experiments_data.zip archive\n",
      });
    }

    myLogs.PushLog({
      type: "info",
      msg: "-------End Download Operation " + operationindex + "-------\n\n",
    });
    setOperationIndex((prev) => prev + 1);
    setNow(100);
  };
  return (
    <div className="page">
      <header className="page-header">Download Experiment History</header>
      <main className="page-content">
        <Container fluid>
          <Row>
            <Col>
              <b>Select experiment</b>
            </Col>
          </Row>
          <Row>
            <Col sm={3}>
              {experiments.length === 0 && "No experiments present in database"}
              {experiments.length !== 0 && (
                <Form.Select
                  aria-label={locale().select + " experiment"}
                  ref={experimentSelectRef}
                >
                  <option>{locale().select} experiment</option>
                  <option>All</option>
                  {React.Children.toArray(
                    experiments.map((e) => {
                      return <option value={e["_id"]}>{e["_id"]}</option>;
                    })
                  )}
                </Form.Select>
              )}
            </Col>
          </Row>

          <Row>
            <Col>
              {experiments.length !== 0 && (
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Compress files in a single .zip archive"
                    ref={compressRef}
                  />
                </Form.Group>
              )}
            </Col>
          </Row>

          <Row>
            <Col>
              <Row>
                <Col>
                  {experiments.length !== 0 && <b>Download history as csv</b>}
                </Col>
              </Row>{" "}
              {experiments.length !== 0 && (
                <Row style={{ paddingTop: 10 + "px" }}>
                  <Col sm={2}>
                    <Form.Group className="mb-3">
                      <Form.Select
                        aria-label="CSV Column Separator"
                        ref={csvSepRef}
                      >
                        <option value=",">,</option>
                        <option value=";">;</option>
                        <option value="-">-</option>
                        <option value="\t">\t</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Column separator
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col sm={2}>
                    <Form.Group className="mb-3">
                      <Form.Select
                        aria-label="CSV Array separator"
                        ref={arraySepRef}
                      >
                        <option value=";">;</option>
                        <option value=",">,</option>
                        <option value=".">.</option>
                        <option value="-">-</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Array separator
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col sm={2}>
                    <Form.Group className="mb-3">
                      <Form.Select
                        aria-label="CSV Floating Point separator"
                        ref={floatSepRef}
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
              )}
              <Row>
                <Col>
                  {experiments.length !== 0 && (
                    <Button variant="primary" onClick={downloadHistoryHandler}>
                      Download History
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
            <Col>
              <Row>
                <Col>
                  {experiments.length !== 0 && (
                    <b>Download experiment data as json</b>
                  )}
                </Col>
              </Row>
              <Row>
                <Col>
                  {experiments.length !== 0 && (
                    <Button variant="primary" onClick={downloadDataHandler}>
                      Download Data
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
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
                style={{ resize: "both", width: 30 + "vw", height: 30 + "vh" }}
                //cols="100"
                //rows="10"
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
