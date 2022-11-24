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
import { ControlloForm } from "./controlloForm";
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

const loadedBody = React.createRef();

export default function AddMeasurementsPage(props) {
  //get resource and id from url params
  const resource = "measurements";
  //get from attribute from search param
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

  //return if page shouldn't be rendered
  if (addFields[resource] === undefined)
    return <div>This entity cannot be posted</div>;

  //handle changes
  const handleChanges = (val, path) => {
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
  };

  //post the body for forms
  const postBody = async (e) => {
    e.preventDefault();
    //deep clone formValues
    let token = undefined;

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
    if (body.token !== undefined) {
      token = body.token;
      delete body.token;
    }

    let res;
    try {
      const resp = await post_generic(resource, JSON.stringify(body), token);
      res = resp.response;
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
      </main>
    </div>
  );
}
