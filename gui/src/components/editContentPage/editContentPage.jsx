import React, { useEffect, useState } from "react";
import locale from "../../common/locale";
import { get_generic, put_generic } from "../../services/http_operations";
import { useParams } from "react-router-dom";
import {
  areEqual,
  isDefault,
  removeDefaultElements,
} from "../../services/misc_functions";

import {
  editFields,
  editFieldsSpecifier,
  fetchedPageTypes,
} from "../../config";
import { fetchedData } from "../../fetchedData";

import { useNavigate } from "react-router-dom";

import { FormManager } from "../formManager/formManager";

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
  const [mounted, setMounted] = useState(false);
  //max indexes
  const maxIndexes = React.useRef({});

  //useeffect to get resource if required
  useEffect(() => {
    const fetchData = async (qs = {}) => {
      // get the data from the api
      const response = await get_generic(resource, qs);

      const data = response.docs[0];
      let tmpValues = cloneDeep(values);

      //order objects inside arrays
      const entr = Object.entries(data);
      for (let i = 0; i < entr.length; i++) {
        //check if value is array of obj
        if (Array.isArray(entr[i][1])) {
          if (entr[i][1].length === 0) continue;
          if (entr[i][1][0].constructor === Object) {
            for (let j = 0; j < entr[i][1].length; j++) {
              if (editFields[resource][entr[i][0]][0] === undefined) continue;
              const target = { ...editFields[resource][entr[i][0]][0] };
              Object.assign(target, entr[i][1][j]);
              entr[i][1][j] = target;
            }
          } else {
            for (let j = 0; j < entr[i][1].length; j++) {
              if (
                editFields[resource][entr[i][0]] === undefined ||
                editFields[resource][entr[i][0]][0] === undefined
              )
                continue;

              entr[i][1][j] = entr[i][1][j];
            }
          }
        }
      }

      //order main obj
      Object.assign(tmpValues, data);

      //delete non-requested keys
      const keys = Object.keys(tmpValues);
      const requestedKeys = Object.keys(editFields[resource]);
      console.log({ keys, requestedKeys });
      for (let i = 0; i < keys.length; i++) {
        if (!requestedKeys.includes(keys[i])) {
          delete tmpValues[keys[i]];
        } else {
          if (editFields[resource][keys[i]].constructor === Object) {
          }
          //remove undesidered keys for objects inside arrays
          else if (
            Array.isArray(editFields[resource][keys[i]]) &&
            editFields[resource][keys[i]][0].constructor === Object
          ) {
            const objKeys = Object.keys(editFields[resource][keys[i]][0]);
            const valObjKeys = Object.keys(tmpValues[keys[i]][0]);
            for (let k = 0; k < tmpValues[keys[i]].length; k++) {
              for (let j = 0; j < valObjKeys.length; j++) {
                if (!objKeys.includes(valObjKeys[j])) {
                  delete tmpValues[keys[i]][k][valObjKeys[j]];
                }
              }
            }
          }
        }
      }

      const evaluateSpecifiers = async () => {
        if (editFieldsSpecifier[resource] === undefined) {
          setDisabledFields({});

          const keys = Object.keys(tmpValues);
          for (let i = 0; i < keys.length; i++) {
            const _key = keys[i];

            tmpValues = maintainEmptyElement(tmpValues, [_key]);
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

          if (tmpValues[key] === undefined) continue;

          if (value.type === "disable") {
            const resp = await value.policy(id);

            disabled[key] = resp;
          }
        }

        const keys = Object.keys(tmpValues);
        for (let i = 0; i < keys.length; i++) {
          const _key = keys[i];

          if (disabled[_key] === undefined || disabled[_key] === false) {
            tmpValues = maintainEmptyElement(tmpValues, [_key]);
          }
        }

        setDisabledFields(disabled);

        setValues(tmpValues);
        //deep copy and set state
        setOriginal(cloneDeep(tmpValues));
      };

      evaluateSpecifiers();
    };

    const fst = { _id: id };
    const qs = { filter: JSON.stringify(fst) };
    fetchData(qs);
    setMounted(true);
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
    val = maintainEmptyElement(val, path.slice(0, i), item);

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

  const maintainEmptyElement = (original, path, item = undefined) => {
    let tmp = cloneDeep(original);
    let tmpPtr = tmp;
    let editFldTmp = cloneDeep(editFields[resource]);
    const tmpPath = [...path];

    //get more nested array
    for (let i = 0; i < tmpPath.length; i++) {
      if (path[i] === undefined) break;
      tmpPtr = tmpPtr[path[i]];
    }

    //get the appropriate item, if possible
    for (let i = 0; i < tmpPath.length; i++) {
      if (path[i] === undefined) break;
      if (editFldTmp === undefined) break;
      //ignore indexes for addFldTmp
      if (typeof path[i] === "number") editFldTmp = editFldTmp[0];
      else editFldTmp = editFldTmp[path[i]];
    }

    //non array case
    if (!Array.isArray(editFldTmp)) return tmp;

    //add item according to addfield dictionary
    if (editFldTmp !== undefined) {
      //0-length array
      if (tmpPtr.length === 0) {
        if (editFldTmp[0].constructor === Object) {
          tmpPtr.push({
            ...editFldTmp[0],
          });
        } else {
          tmpPtr.push("");
        }
      }
      //else 0-length array
      else {
        if (tmpPtr[0].constructor === Object) {
          //check if there are no default elements in array
          if (tmpPtr.filter((e) => isDefault(e)).length === 0) {
            tmpPtr.push({
              ...editFldTmp[0],
            });
          }
        } else {
          if (!tmpPtr.includes("")) {
            tmpPtr.push("");
          }
        }
      }
    }

    //add item according to params
    if (item !== undefined && editFldTmp === undefined) {
      if (tmpPtr.length === 0) {
        if (item.constructor === Object) {
          tmpPtr.push({ ...item });
        } else {
          tmpPtr.push(item);
        }
      }
      //else 0-length array
      else {
        if (tmpPtr.filter((e) => isDefault(e)).length === 0) {
          if (item.constructor === Object) {
            tmpPtr.push({ ...item });
          } else {
            tmpPtr.push(item);
          }
        }
      }
    }
    return tmp;
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

    //end da fare

    let res;
    try {
      const resp = await put_generic(resource, toSend, id);
      res = resp.response;
      setMsg(res.statusText);
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
        Edit &nbsp;<b>{resource}</b>&nbsp;of id:&nbsp;<b>{id}</b>&nbsp;from:
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
