import React, { useState, useContext } from "react";
import { Container, Row, Col, ProgressBar } from "react-bootstrap";
import AppContext from "../../../context";
import "../../page/page.scss";
import UploadMeasurementsFileForm from "./uploadMeasurementsFileForm";
import { postCsvFileWithDescriptionFile } from "../../../services/http_operations";

const arraySepRef = React.createRef();
const floatSepRef = React.createRef();

export default function UploadMeasurementsPage() {
  const [csvContent, setCsvContent] = useState(null);
  const myLogs = useContext(AppContext).logs;
  const [now, setNow] = useState(0);
  const [files, setFiles] = useState(null);
  const [description, setDescription] = useState(null);

  const [operationindex, setOperationIndex] = useState(0);
  //message for user
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [operationFailed, setOperationFailed] = useState(false);

  const [csvSep, setCsvSep] = useState(",");

  const postHistory = async (e) => {
    e.preventDefault();
    const _csvSep = csvSep;
    const arraySep = arraySepRef.current.value;
    const floatSep = floatSepRef.current.value;

    if (_csvSep === "" || arraySep === "" || floatSep === "") {
      setMsg("Please, define all the separators");
      setIsError(true);
      return;
    }
    if (_csvSep === arraySep || _csvSep === floatSep || arraySep === floatSep) {
      setMsg("All the separators should have different values");
      setIsError(true);
      return;
    }
    if (description === null || description === undefined) {
      setMsg("Please, choose description file");
      setIsError(true);
      return;
    }
    if (files === null || files === undefined || files.length === 0) {
      setMsg("Please, choose one measurements file");
      setIsError(true);
      return;
    }

    setMsg("");
    setIsError(false);
    // begin loop on files

    setMsg("");
    setIsError(false);
    setNow(1);
    myLogs.PushLog({
      type: "info",
      msg: "-------Begin Upload Operation " + operationindex + "-------\n",
    });

    setOperationFailed(false);
    console.log("Begin upload: " + Date.now());
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      myLogs.PushLog({
        type: "info",
        msg: "Uploading file " + file.name + "\n",
      });
      console.log({ file, description });
      const response = await postCsvFileWithDescriptionFile(file, description);
      console.log(response);
      if (response.status !== 200) {
        if (response?.data?.message !== undefined)
          myLogs.PushLog({
            type: "error",
            msg: "Error: " + response?.data?.message + "\n",
          });
        setOperationFailed(true);
      }
      setNow((100 * (i + 1)) / files.length);
    }

    console.log("End upload: " + Date.now());
    myLogs.PushLog({
      type: "info",
      msg: "-------End Upload Operation " + operationindex + "-------\n\n",
    });
    setOperationIndex((prev) => prev + 1);
    setNow(100);
  };

  return (
    <div className="page">
      <header className="page-header">Upload Measurements</header>
      <main className="page-content">
        <Container fluid>
          <UploadMeasurementsFileForm
            postHistory={postHistory}
            arraySepRef={arraySepRef}
            csvSep={csvSep}
            setCsvSep={setCsvSep}
            floatSepRef={floatSepRef}
            setCsvContent={setCsvContent}
            setFiles={setFiles}
            files={files}
            setDescription={setDescription}
            description={description}
            csvContent={csvContent}
          />

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
                variant={
                  operationFailed === true
                    ? "danger"
                    : now === 100
                    ? "success"
                    : "info"
                }
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
