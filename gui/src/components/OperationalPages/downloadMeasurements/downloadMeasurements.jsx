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
import { downloadMeasurements } from "../../../services/operation_tool_services";
import AppContext from "../../../context";
import "../../page/page.scss";
import { get_generic } from "../../../services/http_operations";
import { saveAs } from "file-saver";
import { downloadZip } from "client-zip";

const questionnaireSelectRef = React.createRef();
const csvSepRef = React.createRef();
const arraySepRef = React.createRef();
const floatSepRef = React.createRef();
const compressRef = React.createRef();

export default function DownloadMeasurementsPage() {
  const myLogs = useContext(AppContext).logs;
  const [now, setNow] = useState(0);

  const [operationindex, setOperationIndex] = useState(0);
  const [features, setFeatures] = useState([]);
  //message for user
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  //fetch experiments (limit 100) on load
  useEffect(() => {
    const getFeatures = async () => {
      const res = await get_generic("features", {
        limit: -1,
        select: ["_id"],
      });

      setFeatures(res.docs);
    };
    getFeatures();
  }, []);

  //download history as CSV fules
  const downloadMeasurementsHandler = async () => {
    const csvSep = csvSepRef.current.value;
    const arrSep = arraySepRef.current.value;
    const floatSep = floatSepRef.current.value;
    const qs = questionnaireSelectRef.current.value;
    const expIndex = questionnaireSelectRef.current.selectedIndex;
    const compress = compressRef.current.checked;

    if (expIndex === 0) {
      setMsg("Please, select a features");
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
    if (qs === "All") {
      for (let i = 0; i < features.length; i++) {
        const res = await get_generic("measurements", {
          filter: JSON.stringify({ feature: features[i]._id }),
          limit: 0,
        });
        const numDocs = res.totalDocs;
        if (numDocs === 0) {
          myLogs.PushLog({
            type: "info",
            msg: "The feature " + features[i]._id + " has no records\n",
          });
          setNow(((i + 1) / features.length) * 100);
          continue;
        }

        const f = await downloadMeasurements(
          features[i]._id,
          csvSep,
          arrSep,
          floatSep,
          -1,
          undefined,
          ["thing", "device", "feature", "samples"],
          compress
        );
        files.push(f);
        setNow(((i + 1) / features.length) * 100);
      }
    } else {
      const res = await get_generic("measurements", {
        filter: JSON.stringify({ feature: qs }),
        limit: 0,
      });
      const numDocs = res.totalDocs;
      if (numDocs === 0) {
        myLogs.PushLog({
          type: "info",
          msg: "The selected feature type (" + qs + ") has no records\n",
        });
        myLogs.PushLog({
          type: "info",
          msg:
            "-------End Download Operation " + operationindex + "-------\n\n",
        });
        setOperationIndex((prev) => prev + 1);
        setNow(100);
        return;
      }

      const f = await downloadMeasurements(
        qs,
        csvSep,
        arrSep,
        floatSep,
        -1,
        ["thing", "device", "feature", "samples"],
        compress
      );
      files.push(f);
    }
    if (compress === true) {
      const content = await downloadZip(files).blob();
      saveAs(content, "measurements.zip");
      myLogs.PushLog({
        type: "info",
        msg: "Files compressed into measurements.zip archive\n",
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
      <header className="page-header">Download Measurements</header>
      <main className="page-content">
        <Container fluid>
          <Row>
            <Col>
              <b>Select Feature</b>
            </Col>
          </Row>
          <Row>
            <Col sm={3}>
              {features.length === 0 && "No Features present in database"}
              {features.length !== 0 && (
                <Form.Select
                  aria-label={locale().select + " feature"}
                  ref={questionnaireSelectRef}
                >
                  <option>{locale().select} feature</option>
                  <option>All</option>
                  {React.Children.toArray(
                    features.map((e) => {
                      return <option value={e["_id"]}>{e["_id"]}</option>;
                    })
                  )}
                </Form.Select>
              )}
            </Col>
          </Row>

          <Row>
            <Col>
              {features.length !== 0 && (
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
                  {features.length !== 0 && <b>Define CSV separators</b>}
                </Col>
              </Row>{" "}
              {features.length !== 0 && (
                <Row style={{ paddingTop: 10 + "px" }}>
                  <Col xxl={1} xl={2} lg={4} sm={3}>
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
                  <Col xxl={1} xl={2} lg={4} sm={3}>
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
                  <Col xxl={1} xl={2} lg={4} sm={3}>
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
                  {features.length !== 0 && (
                    <Button
                      variant="primary"
                      onClick={downloadMeasurementsHandler}
                    >
                      Download Measurements
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
