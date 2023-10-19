import React, { useEffect, useState, useContext } from "react";
import { get_generic, put_generic } from "../../services/http_operations";
import { useParams } from "react-router-dom";
import {
  areEqual,
  isDefault,
  removeDefaultElements,
  FormatDate,
} from "../../services/misc_functions";

import {
  editFields,
  editFieldsSpecifier,
  fetchedPageData,
} from "../../configManager";

import { useNavigate } from "react-router-dom";

import { FormManager } from "../formManager/formManager";

import AppContext from "../../context";
import {
  sortObject,
  maintainEmptyElement,
  maintainEmptyElements,
} from "../../services/objects_manipulation";
import locale from "../../common/locale";

const cloneDeep = require("clone-deep");

export default function EditContentPage(props) {
  //get resource and id from url params
  const { resource, id } = useParams();

  const [original, setOriginal] = useState();
  //message for user
  const [msg, setMsg] = useState("");
  //redirect hook
  const navigate = useNavigate();

  //deep copy editOption dictionary without any references
  const [values, setValues] = useState(cloneDeep(editFields[resource]));

  //keep trace of deleted elements
  const [deleted, setDeleted] = useState({});

  const [disabledFields, setDisabledFields] = useState(undefined);
  //const [mounted, setMounted] = useState(false);

  const context = useContext(AppContext);
  const myFetched = context.fetched;
  /////////////FETCH REQUIRED RESOURCES
  const fetchRequiredData = async (res) => {
    if (myFetched.data[res] !== undefined) return;
    // get the data from the api
    try {
      const response = await get_generic(res, {
        limit: 100,
        select: ["_id", "username", "name"],
      });
      myFetched.UpdateData(
        response.docs.map((e) => {
          return {
            _id: e._id,
            optionalLabel:
              e.name !== undefined
                ? e.name
                : e.username !== undefined
                ? e.username
                : undefined,
          };
        }),
        res
      );
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (fetchedPageData[resource] !== undefined) {
      Object.values(fetchedPageData[resource]).forEach((e) =>
        fetchRequiredData(e)
      );
    }
  }, []);

  //useeffect to get resource if required
  useEffect(() => {
    const fetchData = async (qs = {}) => {
      try {
        const response = await get_generic(resource, qs);

        const data = response.docs[0];
        let tmpValues = cloneDeep(values);

        tmpValues = sortObject(data, tmpValues);

        Object.entries(tmpValues).forEach((e) => {
          if (e[0].toLowerCase().includes("date")) {
            tmpValues[e[0]] = FormatDate(e[1]);
          }
        });

        //this function evaluate if a field should be disabled or not
        const evaluateSpecifiers = async () => {
          if (editFieldsSpecifier[resource] === undefined) {
            setDisabledFields({});

            const keys = Object.keys(tmpValues);
            for (let i = 0; i < keys.length; i++) {
              const _key = keys[i];

              tmpValues = maintainEmptyElement(
                tmpValues,
                [_key],
                editFields,
                resource
              );
            }

            setValues(tmpValues);
            //deep copy and set state
            setOriginal(cloneDeep(tmpValues));
            return;
          }

          let disabled = {};
          if (disabledFields !== undefined) disabled = disabledFields;

          const specsEntries = Object.entries(editFieldsSpecifier[resource]);

          for (let i = 0; i < specsEntries.length; i++) {
            const key = specsEntries[i][0]; //key
            const value = specsEntries[i][1]; //value

            //check if key is in values
            if (tmpValues[key] === undefined) continue;
            //check if value contains the type
            if (value._type !== undefined && value._type === "disable") {
              const resp = await value.policy(id);

              disabled[key] = resp;
            }
            //check if the disable specification is inside the nested object
            else {
              const entr = Object.entries(value);
              for (let j = 0; j < entr.length; j++) {
                //check if the subkey is in values, in case of array i trust the configuration
                if (
                  Array.isArray(tmpValues[key]) === false &&
                  tmpValues[key][entr[j][0]] === undefined
                )
                  continue;
                if (
                  entr[j][1]._type !== undefined &&
                  entr[j][1]._type === "disable"
                ) {
                  const resp = await entr[j][1].policy(id);

                  disabled[key] = { [entr[j][0]]: resp };
                }
              }
            }
          }
          const keys = Object.keys(tmpValues);
          for (let i = 0; i < keys.length; i++) {
            const _key = keys[i];

            if (disabled[_key] === undefined || disabled[_key] === false) {
              tmpValues = maintainEmptyElement(
                tmpValues,
                [_key],
                editFields,
                resource
              );
            }
          }

          setDisabledFields(disabled);

          setValues(tmpValues);
          //deep copy and set state
          setOriginal(cloneDeep(tmpValues));
        };

        evaluateSpecifiers();
      } catch (error) {
        console.error(error);
      }
      // get the data from the api
    };

    const fst = { _id: id };
    const qs = { filter: JSON.stringify(fst) };
    fetchData(qs);
  }, []);

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
        editFields,
        resource,
        item
      );
    }

    setValues(tmpVals);
  };

  const back = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const handleDeleteItemArray = (path) => {
    let val = cloneDeep(values);
    let tmpPtr = val;

    let i;
    for (i = 0; i < path.length - 1; i++) {
      if (path[i] === undefined) break;
      tmpPtr = tmpPtr[path[i]];
    }

    const removed = tmpPtr.splice(path[i], 1);

    const item = typeof removed[0] === "number" ? NaN : "";
    val = maintainEmptyElement(
      val,
      path.slice(0, i),
      editFields,
      resource,
      item
    );

    //save removed element into appropriate structure
    //do this only when array is on first layer of object
    if (i === 1) {
      if (deleted[path[0]] === undefined)
        deleted[path[0]] = { indexes: [], elements: [], minDel: Infinity };

      //ignore default
      if (!isDefault(removed[0])) {
        //save element (maybe not required anymore)
        deleted[path[0]].elements.push(removed[0]);
        //save index of deletion (considering the original ones)

        deleted[path[0]].indexes.push(
          path[i] >= deleted[path[0]].minDel
            ? path[i] +
                deleted[[path[0]]].indexes.filter((e) => e >= path[i]).length
            : path[i]
        );

        if (path[i] < deleted[path[0]].minDel)
          deleted[path[0]].minDel = path[i];
      }
    }

    setValues(val);
  };

  const submit = async (e) => {
    e.preventDefault();

    //da fare
    let tmpValues = cloneDeep(values);
    let tmpOrig = cloneDeep(original);
    removeDefaultElements(tmpValues);
    removeDefaultElements(tmpOrig);
    let toSend = {};

    const entr = Object.entries(tmpValues);
    for (let i = 0; i < entr.length; i++) {
      const k = entr[i][0];
      const v = entr[i][1];

      //value is array
      if (Array.isArray(v)) {
        //prepare add/update/remove elements
        if (toSend[k] === undefined)
          toSend[k] = { add: [], remove: [], update: [] };

        //get original length of that array
        const origArr = [...tmpOrig[k]];
        //add removed elements (from original elements)
        if (deleted[k] !== undefined) {
          for (let i = 0; i < deleted[k].indexes.length; i++) {
            const removed = origArr.splice(deleted[k].indexes[i][0], 1)[0];
            if (removed.constructor === Object) {
              const key = Object.keys(removed)[0];
              toSend[k].remove.push(removed[key]);
            } else {
              toSend[k].remove.push(removed);
            }
          }
        }
        //check other elements
        for (let j = 0; j < tmpValues[k].length; j++) {
          if (j < origArr.length && !areEqual(tmpValues[k][j], origArr[j])) {
            //update management

            //object case
            if (tmpValues[k][j].constructor === Object) {
              const key = Object.keys(origArr[j])[0];
              toSend[k].update.push({
                [key]: origArr[j][key],
                new: tmpValues[k][j],
              });
            }
            //non object case (i.e., strings)
            else {
              //remove the old value and add the new one
              toSend[k].add.push(tmpValues[k][j]);
              toSend[k].remove.push(origArr[j]);
            }
          }
          if (j >= origArr.length) toSend[k].add.push(tmpValues[k][j]);
        }
        if (areEqual(toSend[k], { add: [], remove: [], update: [] }))
          delete toSend[k];
      }
      //value is obj
      else if (v.constructor === Object) {
        //compare both obj
      }
      //single valued prop
      else {
        //update when values are different
        if (v !== original[k]) toSend[k] = v;
      }
    }

    //no changes found, so do not send request
    if (Object.keys(toSend).length === 0) {
      setMsg(locale().no_changes_found);
      return;
    }
    let res;
    try {
      const resp = await put_generic(resource, toSend, id);
      res = resp.response;
      window.alert(locale().resource_successfully_edited);
      navigate("/" + resource);
    } catch (error) {
      res = error.error.response;
      //add details
      setMsg(
        error.error.response.data.message +
          " : " +
          error.error.response.data.details
      );
    }
  };
  return (
    <div className="page">
      <header className="page-header">
        Edit &nbsp;<b>{resource}</b>&nbsp;of id:&nbsp;<b>{id}</b>&nbsp;
      </header>
      <main className="page-content">
        <FormManager
          values={values}
          resource={resource}
          functionalFields={editFields}
          disabledFields={disabledFields}
          handleChangesCallback={handleChanges}
          arrayDeleteCallback={handleDeleteItemArray}
          submitFunction={submit}
          backFunction={back}
        />
        <br />
        <font style={{ marginLeft: 5 + "px" }}>{msg}</font>
      </main>
    </div>
  );
}
