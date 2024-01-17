import React, { useEffect, useState } from "react";
import { Form, Container, Row, Col } from "react-bootstrap";
import "../../page/page.scss";
import {
  get_generic,
  get_one_generic,
} from "../../../services/http_operations";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(...registerables);

export default function VisualizeTimeseriesPage() {
  const [measurements, setMeasurements] = useState([]);

  //selected measurement
  const [measurement, setMeasurement] = useState(null);
  const [timeserieData, setTimeserieData] = useState(null);
  const [lineOptions, setLineOptions] = useState(null);
  const [samplesNumber, setSamplesNumber] = useState(20);

  //fetch experiments (limit 100) on load
  useEffect(() => {
    const getMeasurements = async () => {
      try {
        const res = await get_generic("measurements", {
          limit: -1,
          select: ["_id"],
          //sort: JSON.stringify({ timestamp: "asc" }),
        });

        setMeasurements(res.docs.map((m) => m._id));
      } catch (error) {
        console.error(error);
      }
    };
    getMeasurements();
  }, []);

  function transformData(inputData, names = undefined) {
    const timestamps = inputData.map((item) => item.timestamp);

    const values = inputData.reduce((acc, curr) => {
      curr.values.forEach((val, index) => {
        if (!acc[index]) {
          acc[index] = {
            label:
              names !== undefined && names[index] !== undefined
                ? names[index]
                : `Value ${index + 1}`,
            data: [],
          };
        }
        acc[index].data.push(val);
      });
      return acc;
    }, []);

    return { timestamps, values };
  }

  //handleSelectChange
  const handleSelectChange = (e, newValue) => {
    e.preventDefault();
    setMeasurement(newValue);
    submitplot(newValue, "timeserieData");
  };

  const handleNumberChange = (e) => {
    e.preventDefault();
    setSamplesNumber(e.target.value);
    submitplot(e.target.value, "samplesNumber");
  };

  const submitplot = async (value, from) => {
    let _measurement;
    let _samplesNumber;
    if (from === "timeserieData") {
      _measurement = value;
      _samplesNumber = samplesNumber;
    } else {
      _measurement = measurement;
      _samplesNumber = value;
    }
    let resp = await get_one_generic("measurements", _measurement);
    const feature = resp?.response?.data?.feature;

    //get item names for the feature
    resp = await get_one_generic("features", feature);
    const names = resp?.response?.data?.items.map((i) => i.name);

    resp = await get_one_generic(
      "measurements",
      _measurement +
        "/timeserie?limit=" +
        _samplesNumber +
        '&sort={"timestamp":"asc"}'
    );
    const { timestamps, values } = transformData(
      resp?.response?.data?.docs.map((e) => {
        return { timestamp: e.timestamp, values: e.values };
      }),
      names
    );

    setTimeserieData({ labels: timestamps, datasets: values });
    setLineOptions({
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: _measurement,
        },
      },
    });
  };
  return (
    <div className="page">
      <header className="page-header">Visualize Timeseries</header>
      <main className="page-content">
        <Container fluid>
          <Row>
            <Col>
              <b>Select a Measurement to view the corresponding timeserie</b>
            </Col>
          </Row>
          <Row style={{ paddingTop: 5 + "px" }}>
            <Col sm={3}>
              {measurements.length === 0 && "No Measurement in database"}
              {measurements.length !== 0 && (
                <Autocomplete
                  disableClearable
                  onChange={handleSelectChange}
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
            <Col sm={3}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="number"
                  value={samplesNumber}
                  onChange={handleNumberChange}
                  aria-describedby="numSamplesHelper"
                />
                <Form.Text id="numSamplesHelper" muted>
                  How many samples do you want to collect?
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {measurement !== null && timeserieData !== null && (
            <Row style={{ paddingTop: 5 + "px" }}>
              <Col>
                <Line data={timeserieData} options={lineOptions} />
              </Col>
            </Row>
          )}
        </Container>
      </main>
    </div>
  );
}
