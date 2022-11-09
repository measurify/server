import React, { useEffect, useState, useContext } from "react";
import locale from "../../common/locale";
import { addFields, addTypes } from "../../config";
import {
  post_generic,
  get_generic,
  getBigDataCloudLocation,
} from "../../services/http_operations";
import {
  isDefault,
  removeDefaultElements,
} from "../../services/misc_functions";
import { useSearchParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import AppContext from "../../context";
import { fetchedPageData } from "../../config";

import fontawesome from "@fortawesome/fontawesome";
import { faMapPin } from "@fortawesome/fontawesome-free-solid";
import { SamplesForm } from "./samplesForm";
fontawesome.library.add(faMapPin);

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

//hardcoded part for "Pensaci Prima" project

const _feature = "controllo";
const _device = "think-before-device";
const _thing = "Genova";
const _tags = [];

export default function AddMeasurementsPage(props) {
  //get resource and id from url params
  const resource = "measurements";
  //get from attribute from search param

  const [searchParams, setSearchParams] = useSearchParams();
  const [samples, setSamples] = useState([]);
  const [items, setItems] = useState([]);
  //addr msg
  const [addrMsg, setAddrMsg] = useState("");

  //redirect hook
  const navigate = useNavigate();
  //message for user
  const [msg, setMsg] = useState("");
  //formValues
  const [formValues, setFormValues] = useState({});

  //file upload state
  const [file, setFile] = useState(undefined);

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
    //handle changes to selected feature
    const fetchFeature = async () => {
      const fst = { _id: _feature };
      const qs = { filter: JSON.stringify(fst) };

      try {
        const res = await get_generic("features", qs);
        const feature = res.docs[0];

        const items = feature.items;

        const samples = [];
        let tmp = addSample(samples, items);
        tmp = updateAddress(tmp);
        setSamples(tmp);
        setItems(items);
      } catch (error) {
        console.log(error);
      }
      return;
    };

    fetchFeature();
  }, [props, searchParams]);

  //return if page shouldn't be rendered
  if (addFields[resource] === undefined)
    return <div>This entity cannot be posted</div>;

  //handle changes
  const handleChanges = (val, path) => {
    let tmpSamples = cloneDeep(samples);
    let samplesPtr = tmpSamples;
    let i;
    let lastIndexNumber = -1;
    for (i = 0; i < path.length - 1; i++) {
      samplesPtr = samplesPtr[path[i]];
      if (typeof path[i] === "number") lastIndexNumber = i;
    }
    if (typeof path[i] === "number") lastIndexNumber = i;
    samplesPtr[path[i]] = val;
    //check if an array is present
    setSamples(tmpSamples);
  };

  const handleDeleteSample = (path) => {
    let val = cloneDeep(samples);

    let tmpPtr = val;

    let i;
    for (i = 0; i < path.length - 1; i++) {
      if (path[i] === undefined) break;
      tmpPtr = tmpPtr[path[i]];
    }
    if (tmpPtr.length === 1) {
      return;
    }

    tmpPtr.splice(path[i], 1);
    setSamples(val);
  };
  const addSample = (samples, items) => {
    const values = [];
    const tmpSample = cloneDeep(samples);
    if (tmpSample.length > 0) {
      tmpSample.push({ ...tmpSample[tmpSample.length - 1] });
    } else {
      items.forEach((item) => {
        if (item.type === "number") {
          if (item.dimension === 0)
            values.push({ name: item.name, value: NaN, type: item.type });
          else values.push([{ name: item.name, value: NaN, type: item.type }]);
        } else if (item.type === "text") {
          if (item.dimension === 0) {
            values.push({ name: item.name, value: "", type: item.type });
          } else {
            values.push([{ name: item.name, value: "", type: item.type }]);
          }
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
    }

    setSamples(tmpSample);
    return tmpSample;
  };

  //post the body for forms
  const postBody = async (e) => {
    e.preventDefault();
    //deep clone formValues
    let token = undefined;
    let body = cloneDeep(formValues);
    let tmpSamples = samples.map((sample) => {
      return { values: sample.values.map((v) => v.value) };
    });
    if (body.token !== undefined) {
      token = body.token;
      delete body.token;
    }
    removeDefaultElements(body);
    body["feature"] = _feature;
    body["samples"] = tmpSamples;
    body["tags"] = _tags;
    body["feature"] = _feature;
    body["thing"] = _thing;
    body["device"] = _device;
    //let tmpformValues = cloneDeep(body);

    let res;
    try {
      const resp = await post_generic(resource, JSON.stringify(body), token);
      res = resp.response;
      setMsg(res.statusText);
    } catch (error) {
      console.log(error);
      res = error.error.response;
      //add details
      setMsg(
        error.error.response.data.message +
          " : " +
          error.error.response.data.details
      );
    }

    if (res.status === 200) {
      if (window.confirm("Back to resource page?") === true) {
        if (resource === "tenants") navigate("/");
        else navigate("/" + resource);
      } else {
      }
    }
  };

  const back = (e) => {
    e.preventDefault();
    navigate(-1);
  };

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
          const tmp = updateAddress();
          setSamples(tmp);
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

  const updateAddress = (smpls = undefined) => {
    let tmpSample = smpls !== undefined ? smpls : cloneDeep(samples);
    tmpSample = tmpSample.map((sample) => {
      sample.values = sample.values.map((value) => {
        const tmp = { ...value };
        if (tmp.name === "address" || tmp.name === "indirizzo") {
          tmp.value = getAddress();
        }
        return tmp;
      });
      const newSample = { values: sample.values };
      return newSample;
    });
    return tmpSample;
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
        Add resource &nbsp;
        <b>{resource}</b>
      </header>
      <main>
        <SamplesForm
          samples={samples}
          items={items}
          submitFunction={postBody}
          backFunction={back}
          getAddress={getAddress}
          msg={msg}
          handleAddSample={addSample}
          handleDeleteSample={handleDeleteSample}
          handleChanges={handleChanges}
          refreshLocation={refreshLocation}
          addrMsg={addrMsg}
        />
      </main>
    </div>
  );
}
