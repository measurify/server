import React, { useEffect, useState, useContext } from "react";
import locale from "../../common/locale";
import { addFields, addTypes } from "../../config";
import {
  post_generic,
  get_generic,
<<<<<<< HEAD
  getBigDataCloudLocation,
=======
  post_file_generic,
>>>>>>> fresta
} from "../../services/http_operations";
import {
  isDefault,
  removeDefaultElements,
} from "../../services/misc_functions";
import { useSearchParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";

<<<<<<< HEAD
import AppContext from "../../context";
import { fetchedPageData } from "../../config";

import fontawesome from "@fortawesome/fontawesome";
import { faMapPin } from "@fortawesome/fontawesome-free-solid";
import { ControlloForm } from "./controlloForm";
fontawesome.library.add(faMapPin);
=======
import {
  Form,
  Nav,
  Container,
  Row,
  Col,
  Button,
  Accordion,
} from "react-bootstrap";
import { FormManager } from "../formManager/formManager";
import { FormFile } from "../formFileComp/formFile";

import AppContext from "../../context";
import { fetchedPageData } from "../../config";
import {
  sortObject,
  maintainEmptyElement,
  maintainEmptyElements,
} from "../../services/objects_manipulation";
>>>>>>> fresta

const cloneDeep = require("clone-deep");
/*
APPUNTI FORM

 <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>
              TEXT
            </Form.Label>
            <Form.Control type="text" placeholder="PLACEHOLDER TEXT" />
            <Form.Text className="text-muted">
              LABEL
            </Form.Text>
          </Form.Group>

tipi consentiti nel form control:
text | number (verifica del numero automatica) | email (verifica email automatica) | file | checkbox

*/

<<<<<<< HEAD
//hardcoded part for "Pensaci Prima" project

const _feature = "controllo";
const _device = "think-before-device";
const _thing = "Genova";
const _tags = [];

const loadedBody = React.createRef();

=======
>>>>>>> fresta
export default function AddMeasurementsPage(props) {
  //get resource and id from url params
  const resource = "measurements";
  //get from attribute from search param
<<<<<<< HEAD
  const [searchParams, setSearchParams] = useSearchParams();
  const [samples, setSamples] = useState([]);
  const [items, setItems] = useState([]);
  const [values, setValues] = useState({});
  //addr msg
  const [addrMsg, setAddrMsg] = useState("");

  //redirect hook
  const navigate = useNavigate();
  //message for user
  const [msg, setMsg] = useState("");
=======

  const [searchParams, setSearchParams] = useSearchParams();
  const [samples, setSamples] = useState([]);
  const [items, setItems] = useState([]);

  //redirect hook
  const navigate = useNavigate();
  //type of input to post resources
  const [postType, setPostType] = useState("form");
  //message for user
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  //formValues
  const [formValues, setFormValues] = useState(cloneDeep(addFields[resource]));
  //disabled
  const [disabledFields, setDisabledFields] = useState({});

  //protocols
  const [features, setFeatures] = useState();
  const [feature, setFeature] = useState("");

  //file upload state
  const [file, setFile] = useState(undefined);
  const [contentHeader, setContentHeader] = useState(null);
  const [contentBody, setContentBody] = useState(null);
  const [contentPlain, setContentPlain] = useState(null);
>>>>>>> fresta

  const context = useContext(AppContext);
  const myFetched = context.fetched;

  /////////////FETCH REQUIRED RESOURCES
  const fetchData = async (res) => {
    if (myFetched.data[res] !== undefined) return;
    // get the data from the api
    try {
      const response = await get_generic(res, { limit: 100 });
      myFetched.UpdateData(
        response.docs.map((e) => e._id),
        res
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (fetchedPageData[resource] !== undefined) {
      Object.values(fetchedPageData[resource]).forEach((e) => fetchData(e));
    }
  }, []);

  //useeffect to get resource if required
  useEffect(() => {
<<<<<<< HEAD
    //handle changes to selected feature
    const fetchFeature = async () => {
      const fst = { _id: _feature };
      const qs = { filter: JSON.stringify(fst) };

      try {
        const res = await get_generic("features", qs);
        const feature = res.docs[0];

        const addr = getAddress();
        const items = feature.items;
        const today = new Date();
        const time =
          today.getHours().toString().padStart(2, "0") +
          ":" +
          today.getMinutes().toString().padStart(2, "0");
        //tmp = updateAddress(tmp);

        //values structure
        const val = {
          indirizzo: addr,
          note: "",
          data: Date.now(),
          ora: time,
          veicolo: "",
          persone: [
            {
              index: 0,
              età: NaN,
              genere: "",
              nazionalità: "",
              risultato: "",
            },
          ],
        };
        setValues(val);
        //setSamples(tmp);
        setItems(items);
      } catch (error) {
        console.log(error);
      }
      return;
    };

    fetchFeature();
  }, [props, searchParams]);

  //get values from the previous form, then reset the prev (useful for failed posts)
  useEffect(() => {
    if (loadedBody.current !== null) {
      setValues(loadedBody.current);
    }
  });

=======
    const fetchData = async (qs = {}) => {
      // get the protocols data from the api
      try {
        const response = await get_generic("features", qs);

        setFeatures(response.docs.map((e) => e._id));
      } catch (error) {
        console.log(error);
      }
    };
    const qs = { limit: 100 };
    fetchData(qs);
  }, [props, searchParams]);

>>>>>>> fresta
  //return if page shouldn't be rendered
  if (addFields[resource] === undefined)
    return <div>This entity cannot be posted</div>;

  //handle changes
  const handleChanges = (val, path) => {
<<<<<<< HEAD
    //reset loaded body
    loadedBody.current = null;
    let tmpValues = cloneDeep(values);
    let valuesPtr = tmpValues;
    let i;
    let lastIndexNumber = -1;
    for (i = 0; i < path.length - 1; i++) {
      valuesPtr = valuesPtr[path[i]];
      if (typeof path[i] === "number") lastIndexNumber = i;
    }
    if (typeof path[i] === "number") lastIndexNumber = i;
    valuesPtr[path[i]] = val;
    //add sostanze array when result is positive
    if (path[i] === "risultato" && val === "positivo") {
      valuesPtr["sostanze"] = [{ sostanza: "", livello: "" }];
    }
    //check if an array is present
    setValues(tmpValues);
  };

  const handleRemoveItemArray = (path) => {
    //reset loaded body
    loadedBody.current = null;
    let val = cloneDeep(values);

=======
    let tmpVals = cloneDeep(formValues);
    let formValuesPtr = tmpVals;

    let i;
    let lastIndexNumber = -1;
    for (i = 0; i < path.length - 1; i++) {
      formValuesPtr = formValuesPtr[path[i]];
      if (typeof path[i] === "number") lastIndexNumber = i;
    }
    if (typeof path[i] === "number") lastIndexNumber = i;
    formValuesPtr[path[i]] = val;
    //check if an array is present
    if (lastIndexNumber !== -1) {
      //only string and numbers are allowed as item, with this version
      const item = typeof val === "number" ? NaN : "";
      tmpVals = maintainEmptyElement(
        tmpVals,
        path.slice(0, lastIndexNumber),
        addFields,
        resource,
        item
      );
    }
    setFormValues(tmpVals);
  };

  const handleDeleteItemArray = (path) => {
    let val = cloneDeep(formValues);
>>>>>>> fresta
    let tmpPtr = val;

    let i;
    for (i = 0; i < path.length - 1; i++) {
      if (path[i] === undefined) break;
      tmpPtr = tmpPtr[path[i]];
    }
<<<<<<< HEAD
    if (tmpPtr.length === 1) {
      return;
    }

    tmpPtr.splice(path[i], 1);
    setValues(val);
  };
  const addItemArray = (path) => {
    //reset loaded body
    loadedBody.current = null;
    const tmpValues = cloneDeep(values);
    let tmpPtr = tmpValues;

    let lastKey = null;
    for (let i = 0; i < path.length - 1; i++) {
      tmpPtr = tmpPtr[path[i]];
      lastKey = path[i];
    }
    if (lastKey === "sostanze") {
      tmpPtr.push({ sostanza: "", livello: "" });
    }
    if (lastKey === "persone") {
      tmpPtr.push({
        index: tmpPtr.length,
        età: NaN,
        genere: "",
        nazionalità: "",
        risultato: "",
      });
    }

    setValues(tmpValues);
  };

  //unroll the data structure into arrays
  const UnrollValues = (obj, vals, smpls) => {
    const tmpVals = [...vals];
    let last = true;
    if (obj.constructor === Object) {
      Object.values(obj).forEach((v) => {
        if (Array.isArray(v)) {
          last = false;
          v.forEach((e) => UnrollValues(e, tmpVals, smpls));
        } else {
          tmpVals.push(v);
        }
      });
    }
    if (last === true) smpls.push(tmpVals);
    return smpls;
=======

    const removed = tmpPtr.splice(path[i], 1);

    const item = typeof removed[0] === "number" ? NaN : "";
    val = maintainEmptyElement(
      val,
      path.slice(0, i),
      addFields,
      resource,
      item
    );
    setFormValues(val);
  };
  //handle way selector to post new entity
  const handleTypeSelect = (eventKey) => {
    setPostType(eventKey);
    setMsg("");
    setIsError(false);
  };

  //handle changes to selected feature
  const handleFeatureChange = async (e) => {
    e.preventDefault();
    const selectedFeature = e.target.value;
    const fst = { _id: selectedFeature };
    const qs = { filter: JSON.stringify(fst) };
    const res = await get_generic("features", qs);
    const feature = res.docs[0];

    const items = feature.items;

    const samples = [];
    const tmp = addSample(samples, items);
    setSamples(tmp);
    setItems(items);
    setFeature(selectedFeature);
    return;
  };

  const addSample = (samples, items) => {
    const values = [];
    const tmpSample = cloneDeep(samples);
    items.forEach((item) => {
      if (item.type === "number") {
        if (item.dimension === 0)
          values.push({ name: item.name, value: NaN, type: item.type });
        else values.push([{ name: item.name, value: NaN, type: item.type }]);
      } else if (item.type === "text") {
        if (item.dimension === 0)
          values.push({ name: item.name, value: "", type: item.type });
        else values.push([{ name: item.name, value: "", type: item.type }]);
      } else if (item.type === "enum") {
        if (item.dimension === 0)
          values.push({
            name: item.name,
            value: "",
            enumValues: item.range,
            type: item.type,
          });
        else
          values.push([
            {
              name: item.name,
              value: "",
              enumValues: item.range,
              type: item.type,
            },
          ]);
      }
    });
    tmpSample.push({ values: values });
    return tmpSample;
>>>>>>> fresta
  };

  //post the body for forms
  const postBody = async (e) => {
    e.preventDefault();
    //deep clone formValues
    let token = undefined;
<<<<<<< HEAD

    const sostanze = items.filter((e) => e.name === "sostanza")[0].range;

    //clone values
    const tmpValues = cloneDeep(values);

    //set values to notes compatible with databases requirements
    if (
      tmpValues["note"] === "" ||
      tmpValues["note"] === undefined ||
      tmpValues["note"] === null
    )
      tmpValues["note"] = "--";

    const wrongAges = tmpValues.persone.filter(
      (pers) => isNaN(pers["età"]) || pers["età"] < 14 || pers["età"] > 150
    );

    if (wrongAges.length > 0) {
      window.alert(
        "Errore, non è stato possibile salvare i dati. Controllare di aver specificato tutte le voci correttamente"
      );
      return;
    }

    //add all the negative controls when required
    tmpValues.persone.forEach((person) => {
      sostanze.forEach((sos) => {
        if (person.sostanze === undefined) person.sostanze = [];
        if (person.sostanze.map((e) => e.sostanza).includes(sos) === false) {
          person.sostanze.push({ sostanze: sos, livello: "nullo" });
        }
      });
    });
    const vals = UnrollValues(tmpValues, [], []);
    const smpls = vals.map((e) => {
      return { values: e };
    });
    let body = {};
    body["feature"] = _feature;
    body["tags"] = _tags;
    body["thing"] = _thing;
    body["device"] = _device;
    body["samples"] = smpls;

    //return;
=======
    let body = cloneDeep(formValues);
    let tmpSamples = samples.map((sample) => {
      return { values: sample.values.map((v) => v.value) };
    });
>>>>>>> fresta
    if (body.token !== undefined) {
      token = body.token;
      delete body.token;
    }
<<<<<<< HEAD
=======
    removeDefaultElements(body);
    body["feature"] = feature;
    body["samples"] = tmpSamples;
    //let tmpformValues = cloneDeep(body);
>>>>>>> fresta

    let res;
    try {
      const resp = await post_generic(resource, JSON.stringify(body), token);
      res = resp.response;
<<<<<<< HEAD
    } catch (error) {
      console.log(error);
      //save values on error to prevent form reset
      loadedBody.current = values;
      res = error.error.response;
      window.alert(
        "Errore, non è stato possibile salvare i dati. Controllare di aver specificato tutte le voci correttamente"
      );
    }
    if (res.status === 200) {
      loadedBody.current = null;
      window.alert("Controllo caricato con successo");

      navigate("/add/measurements");
=======
      setMsg(res.statusText);
      setIsError(false);
    } catch (error) {
      console.log(error);
      res = error.error.response;
      //add details
      setMsg(
        error.error.response.data.message +
          " : " +
          error.error.response.data.details
      );
      setIsError(true);
    }

    if (res.status === 200) {
      window.alert("Measurement successufully posted!");
      navigate("/" + resource);
>>>>>>> fresta
    }
  };

  const back = (e) => {
    e.preventDefault();
    navigate(-1);
  };

<<<<<<< HEAD
  const refreshLocation = async () => {
    if (navigator.geolocation) {
      let latitude;
      let longitude;
      navigator.geolocation.getCurrentPosition(async (position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        try {
          await getBigDataCloudLocation(latitude, longitude);

          //update all the address
          const val = updateAddress();
          setValues(val);
          setAddrMsg(locale().geo_update);
        } catch (error) {
          console.log("Error while connecting to Geolocalization APIs");
          console.log(error);
          setAddrMsg(locale().geo_failed);
        }
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
      setAddrMsg(locale().geo_failed);
    }
  };

  const updateAddress = () => {
    let tmpValues = cloneDeep(values);
    if (tmpValues["indirizzo"] !== undefined) {
      tmpValues["indirizzo"] = getAddress();
    }
    if (tmpValues["address"] !== undefined) {
      tmpValues["address"] = getAddress();
    }
    return tmpValues;
  };

  const getAddress = (complete = false, short = false) => {
    const continent = localStorage.getItem("continent");
    const continentCode = localStorage.getItem("continentCode");
    const country = localStorage.getItem("countryName");
    const countryCode = localStorage.getItem("countryCode");
    const sub = localStorage.getItem("principalSubdivision");
    const city = localStorage.getItem("city");
    const locality = localStorage.getItem("locality");

    if (complete === true) {
      if (short === true) {
        return (
          continentCode +
          " - " +
          countryCode +
          " - " +
          sub +
          " - " +
          city +
          " - " +
          locality
        );
      } else {
        return (
          continent +
          " - " +
          country +
          " - " +
          sub +
          " - " +
          city +
          " - " +
          locality
        );
      }
    }

    return city + " - " + locality;
  };
  return (
    <div className="page">
      <header className="page-header">
        Aggiungi&nbsp;<b>Controllo</b>
      </header>
      <main>
        <ControlloForm
          values={values}
          items={items}
          submitFunction={postBody}
          backFunction={back}
          getAddress={getAddress}
          msg={msg}
          handleAddItemArray={addItemArray}
          handleRemoveItemArray={handleRemoveItemArray}
          handleChanges={handleChanges}
          refreshLocation={refreshLocation}
          addrMsg={addrMsg}
        />
=======
  const postFile = async (e) => {
    e.preventDefault();
    if (file === undefined) {
      setMsg(locale().no_file);
      setIsError(true);
      return;
    }
    let res;
    if (file.name.endsWith(".csv")) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const resp = await post_file_generic(resource, formData);

        res = resp.response;
        setMsg(res.statusText);
        setIsError(false);
      } catch (error) {
        console.log(error);

        res = error.error.response;
        //add details
        setMsg(
          error.error.response.data.message +
            " : " +
            error.error.response.data.details
        );
        setIsError(true);
      }
    }
    if (file.name.endsWith(".json")) {
      try {
        const resp = await post_generic(resource, contentPlain, undefined);
        res = resp.response;
        setMsg(res.statusText);
        setIsError(false);
      } catch (error) {
        console.log(error);
        res = error.error.response;
        //add details
        setMsg(
          error.error.response.data.message +
            " : " +
            error.error.response.data.details
        );
        setIsError(true);
      }
    }

    if (res.status === 200) {
      window.alert("Measurement successufully posted!");
      navigate("/" + resource);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        Add resource &nbsp;
        <b>{resource}</b>
      </header>
      <main className="page-content">
        <Nav
          justify
          variant="tabs"
          className="justify-content-center"
          onSelect={handleTypeSelect}
          defaultActiveKey="form"
        >
          {addTypes[resource].includes("form") && (
            <Nav.Item>
              <Nav.Link eventKey="form">Form</Nav.Link>
            </Nav.Item>
          )}

          {addTypes[resource].includes("file") &&
            searchParams.get("from") === null && (
              <Nav.Item>
                <Nav.Link eventKey="file">File</Nav.Link>
              </Nav.Item>
            )}
        </Nav>
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 2 + "px",
            borderStyle: "solid",
            borderColor: "rgba(18, 54, 81, 0.9)",
            borderWidth: 1 + "px",
            width: 100 + "%",
            height: "fit-content",
          }}
        >
          {postType === "form" && features !== undefined && (
            <div style={{ margin: 5 + "px" }}>
              <Form.Select
                aria-label={locale().select + " feature"}
                onChange={handleFeatureChange}
                value={feature}
              >
                <option>{locale().select} feature</option>
                {React.Children.toArray(
                  features.map((e) => {
                    return <option value={e}>{e}</option>;
                  })
                )}
              </Form.Select>
              <hr />
              <Container fluid>
                <Row>
                  <b>Samples :{samples.length}</b>
                </Row>
                <br />
                {React.Children.toArray(
                  samples.map((sample, i) => {
                    return (
                      <Row
                        style={{
                          padding: 10,
                        }}
                      >
                        <Accordion defaultActiveKey="0">
                          <Accordion.Item eventKey={i}>
                            <Accordion.Header>
                              <b>
                                <i>Sample [{i}]</i>
                              </b>
                            </Accordion.Header>
                            <Accordion.Body>
                              {React.Children.toArray(
                                Object.values(sample.values).map((entr) => {
                                  return (
                                    <Row
                                      style={{
                                        borderBottomStyle: "solid",
                                        borderBottomWidth: 1 + "px",
                                        marginBottom: 5 + "px",
                                        padding: 10,
                                      }}
                                    >
                                      <Col
                                        sm={2}
                                        style={{
                                          borderRightStyle: "dotted",
                                          borderRightWidth: 1 + "px",
                                        }}
                                      >
                                        <b>
                                          <i>{entr.name}</i>
                                        </b>
                                      </Col>
                                      <Col sm={2}>
                                        {entr.type === "enum" ? (
                                          <Form.Select
                                            aria-label={
                                              locale().select + " " + entr.name
                                            }
                                            //value={entr.value}
                                            onChange={(e) => {
                                              e.preventDefault();
                                              entr.value = e.target.value;
                                            }}
                                          >
                                            <option value="">
                                              {locale().select +
                                                " " +
                                                entr.name}
                                            </option>
                                            {React.Children.toArray(
                                              entr.enumValues.map((e) => {
                                                return (
                                                  <option value={e}>{e}</option>
                                                );
                                              })
                                            )}
                                          </Form.Select>
                                        ) : entr.type === "text" ? (
                                          <Form.Control
                                            type="text"
                                            //value={entr.value}
                                            id={entr.name}
                                            onChange={(e) => {
                                              e.preventDefault();
                                              entr.value = e.target.value;
                                            }}
                                            aria-label={
                                              locale().enter + " " + entr.name
                                            }
                                          />
                                        ) : (
                                          <Form.Control
                                            type="number"
                                            id={entr.name}
                                            //value={isNaN(entr.value) ? "" : entr.value}
                                            onChange={(e) => {
                                              e.preventDefault();
                                              entr.value = parseInt(
                                                e.target.value,
                                                10
                                              );
                                            }}
                                            aria-label={
                                              locale().enter + " " + entr.name
                                            }
                                          />
                                        )}
                                      </Col>
                                    </Row>
                                  );
                                })
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Row>
                    );
                  })
                )}
                {samples.length !== 0 && (
                  <Button
                    variant="link"
                    onClick={() => {
                      const sampl = addSample(samples, items);
                      setSamples(sampl);
                    }}
                  >
                    <i
                      className="fa fa-plus-circle"
                      aria-hidden="true"
                      title={"Add sample"}
                      style={{
                        width: 30 + "px",
                        height: 30 + "px",
                        marginRight: 10 + "px",
                        opacity: 0.85,
                      }}
                    ></i>
                  </Button>
                )}
              </Container>
              <hr />
              <br />
              <FormManager
                values={formValues}
                resource={resource}
                functionalFields={addFields}
                disabledFields={disabledFields}
                handleChangesCallback={handleChanges}
                arrayDeleteCallback={handleDeleteItemArray}
                submitFunction={postBody}
                backFunction={back}
              />

              <br />

              <font
                style={{
                  marginLeft: 5 + "px",
                  color: isError ? "red" : "black",
                }}
              >
                {msg}
              </font>
            </div>
          )}
          {postType === "file" && (
            <div style={{ margin: 5 + "px" }}>
              <FormFile
                submitFunction={postFile}
                backFunction={back}
                setContentBody={setContentBody}
                setContentHeader={setContentHeader}
                setContentPlain={setContentPlain}
                setFile={setFile}
                contentPlain={contentPlain}
                contentHeader={contentHeader}
                contentBody={contentBody}
              />
              <font
                style={{
                  marginLeft: 5 + "px",
                  color: isError ? "red" : "black",
                }}
              >
                {msg}
              </font>
            </div>
          )}
        </div>
>>>>>>> fresta
      </main>
    </div>
  );
}
