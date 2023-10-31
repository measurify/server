import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Form,
  Container,
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";
import { downloadTimeserie } from "../../../services/operation_tool_services";
import AppContext from "../../../context";
import "../../page/page.scss";
import { get_generic } from "../../../services/http_operations";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";

const csvSepRef = React.createRef();
const arraySepRef = React.createRef();
const floatSepRef = React.createRef();

export default function DownloadTimeseriesPage() {
  const myLogs = useContext(AppContext).logs;
  const [now, setNow] = useState(0);

  const [operationindex, setOperationIndex] = useState(0);
  const [measurements, setMeasurements] = useState([]);

  //selected measurement
  const [measurement, setMeasurement] = useState(null);
  //message for user
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  //fetch experiments (limit 100) on load
  useEffect(() => {
    const getMeasurements = async () => {
      try {
        const res = await get_generic("measurements", {
          limit: -1,
          select: ["_id"],
        });

        setMeasurements(res.docs.map((m) => m._id));
      } catch (error) {
        console.error(error);
      }
    };
    getMeasurements();
  }, []);

  //download history as CSV fules
  const downloadTimeserieHandler = async () => {
    const csvSep = csvSepRef.current.value;
    const arrSep = arraySepRef.current.value;
    const floatSep = floatSepRef.current.value;

    if (measurement === null) {
      setMsg("Please, select a Measurement");
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
      msg:
        "-------Begin Download Timeserie Operation " +
        operationindex +
        "-------\n",
    });

    try {
      const res = await get_generic(
        "measurements/" + measurement + "/timeserie/count"
      );

      const numTimeserie = res?.response?.data?.size;
      if (numTimeserie === 0) {
        myLogs.PushLog({
          type: "info",
          msg:
            "The selected measurements ttimeserie (" +
            measurement +
            ") has no records\n",
        });
        myLogs.PushLog({
          type: "info",
          msg:
            "-------End Download Timeserie Operation " +
            operationindex +
            "-------\n\n",
        });
        setOperationIndex((prev) => prev + 1);
        setNow(100);
        return;
      }

      await downloadTimeserie(measurement, csvSep, arrSep, floatSep);
    } catch (error) {
      console.error(error);
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
      <header className="page-header">Download Timeseries</header>
      <main className="page-content">
        <Container fluid>
          <Row>
            <Col>
              <b>
                Select a Measurement to download the corresponding timeserie
              </b>
            </Col>
          </Row>
          <Row style={{ paddingTop: 5 + "px" }}>
            <Col sm={3}>
              {measurements.length === 0 && "No Measurement in database"}
              {measurements.length !== 0 && (
                <Autocomplete
                  disableClearable
                  onChange={(e, newValue) => {
                    e.preventDefault();
                    setMeasurement(newValue);
                  }}
                  value={measurement}
                  disabled={false}
                  options={measurements}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                      {...props}
                    >
                      {option}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label={"Select Measurement"} />
                  )}
                />
              )}
            </Col>
          </Row>

          <Row style={{ paddingTop: 5 + "px" }}>
            <Col>
              <Row>
                <Col>
                  {measurements.length !== 0 && <b>Define CSV separators</b>}
                </Col>
              </Row>{" "}
              {measurements.length !== 0 && (
                <Row style={{ paddingTop: 10 + "px" }}>
                  <Col sm={1}>
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
                  <Col sm={1}>
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
                  <Col sm={1}>
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
                  {measurements.length !== 0 && (
                    <Button
                      variant="primary"
                      onClick={downloadTimeserieHandler}
                    >
                      Download Timeserie
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ paddingTop: 5 + "px" }}>
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
