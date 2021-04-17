import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

import { Popup } from "../popup/popup.comp";
import {
  IConfigInputField,
  IConfigGetSingleMethod,
  IConfigPostMethod,
  IConfigPutMethod,
  ICustomLabels,
  IQueryParam,
} from "../../common/models/config.model";
import { FormRow } from "../formRow/formRow.comp";
import { Button } from "../button/button.comp";
import { Loader } from "../loader/loader.comp";
import { dataHelpers } from "../../helpers/data.helpers";
import { fileHelpers } from "../../helpers/file.helpers";
import { IAppContext } from "../app.context";
import { withAppContext } from "../withContext/withContext.comp";
import locale from "../../common/locale";

import "./formPopup.scss";

const unflatten = require("flat").unflatten;

interface ILoadedFields {
  fieldName: string;
  values: Array<string>;
}

interface IProps {
  context: IAppContext;
  title: string;
  fields: IConfigInputField[];
  loadedFields: ILoadedFields[];
  type: string;
  rawData?: any;
  getSingleConfig?: IConfigGetSingleMethod;
  methodConfig: IConfigPostMethod | IConfigPutMethod;
  closeCallback: (reloadData: boolean) => void;
  submitCallback: (
    body: any,
    containFiles: boolean,
    queryParams: IQueryParam[]
  ) => void;
}

interface IDeleteFields {
  fieldName: string;
  value: string;
}

export const FormPopup = withAppContext(
  ({
    context,
    title,
    fields,
    loadedFields,
    rawData,
    type,
    getSingleConfig,
    methodConfig,
    submitCallback,
    closeCallback,
  }: IProps) => {
    const fieldsCopy: IConfigInputField[] = JSON.parse(JSON.stringify(fields));
    const { httpService, activePage, config } = context;
    const [loading, setLoading] = useState<boolean>(true);
    const [formFields, setFormFields] = useState<IConfigInputField[]>([]);
    const [deleteValues, setDeleteValues] = useState<IDeleteFields[]>([]);
    const [finalRawData, setFinalRawData] = useState<any>(null);
    const pageHeaders: any = activePage?.requestHeaders || {};
    const customLabels: ICustomLabels | undefined = {
      ...config?.customLabels,
      ...activePage?.customLabels,
    };

    async function initFormFields() {
      let finalRawData: any = rawData || {};

      if (getSingleConfig && getSingleConfig.url) {
        try {
          const {
            url,
            requestHeaders,
            actualMethod,
            dataPath,
            queryParams,
            responseType,
            dataTransform,
          } = getSingleConfig;
          const result = await httpService.fetch({
            method: actualMethod || "get",
            origUrl: url,
            queryParams,
            headers: Object.assign({}, pageHeaders, requestHeaders || {}),
            rawData,
            responseType,
          });

          let extractedData = dataHelpers.extractDataByDataPath(
            result,
            dataPath
          );

          if (typeof dataTransform === "function") {
            extractedData = await dataTransform(extractedData);
          }

          if (
            extractedData &&
            (typeof extractedData === "object" ||
              typeof extractedData === "string")
          ) {
            finalRawData = extractedData;
          }
        } catch (e) {
          console.error("Could not load single item's data.", e);
          toast.error("Could not load single item's data.", {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      }

      setFinalRawData(finalRawData); // Store the raw data for later.

      setFormFields(
        fieldsCopy.map((field) => {
          let key = field.name;

          field.originalName = field.name;

          let dataPathSplit: string[] = [];

          if (field.dataPath) {
            dataPathSplit = field.dataPath.split(".");
            key = `${field.dataPath}.${field.name}`;
          }

          const lookup = () => {
            let objToLookIn = finalRawData;
            for (const pathElem of dataPathSplit) {
              if (
                objToLookIn[pathElem] !== undefined &&
                objToLookIn[pathElem] !== null
              ) {
                objToLookIn = objToLookIn[pathElem];
              } else {
                return undefined;
              }
            }
            return objToLookIn[field.name];
          };

          const lookupValue = lookup();

          // Changing field name to include datapath
          // This will use us later for unflatten the final object
          field.name = key;

          if (dataHelpers.checkIfFieldIsObject(field)) {
            if (lookupValue || field.value) {
              field.value =
                JSON.stringify(lookupValue || field.value, null, "  ") || "";
            }
            return field;
          }

          if (field.type === "array") {
            field.value = lookupValue || field.value || [];
            return field;
          }

          if (typeof lookupValue !== "undefined") {
            field.value = lookupValue;
          } else {
            // important in order to prevent controlled / uncontrolled components error
            field.value = typeof field.value === "undefined" ? "" : field.value;
          }

          if (
            (field.type === "long-text" || field.type === "text") &&
            typeof finalRawData === "string"
          ) {
            field.value = finalRawData;
          }

          return field;
        })
      );

      setLoading(false);
    }

    async function submitForm(e: any) {
      e.preventDefault();

      const finalObject: any = (methodConfig as IConfigPutMethod)
        .includeOriginalFields
        ? Object.assign({}, finalRawData)
        : {};
      const formData = new FormData();
      const containFiles: boolean = fileHelpers.isMultipartForm(formFields);
      let validationError = null;

      var queryParams: IQueryParam[] = [];

      formFields.forEach((field) => {
        if (field.type === "file") {
          const fileInput: any = document.querySelector(
            `input[name="${field.name || "file"}"]`
          ) as HTMLInputElement;

          if (fileInput.files.length > 0) {
            const firstFile = fileInput.files[0];
            formData.append(field.name || "file", firstFile, firstFile.name);
          }
          return;
        }

        finalObject[field.name] = field.value;

        if (containFiles && !field.useInUrl) {
          formData.append(field.name, field.value);
        }

        // eslint-disable-next-line eqeqeq
        if (
          field.required &&
          field.type !== "boolean" &&
          !field.value &&
          field.value != 0
        ) {
          validationError = "Please fill up all required fields.";
        }

        if (dataHelpers.checkIfFieldIsObject(field) && field.value) {
          try {
            finalObject[field.name] = JSON.parse(field.value);
          } catch (e) {
            validationError = `Invalid JSON for field "${field.name}".`;
          }
        }

        if (field.disabled === true) {
          delete finalObject[field.name];
          console.log(finalObject);
        }

        if (field.type === "boolean") {
          finalObject[field.name] = field.value || false;
        }

        if (
          type !== "add" &&
          field.type === "array" &&
          field.arrayType === "text"
        ) {
          var temp = "{";

          var rmVal = deleteValues.filter((e) => e.fieldName === field.name);
          rmVal = rmVal.filter((e) => e.value !== "");

          console.log(rmVal);

          if (field.value.length !== 0) {
            temp += ` "add": ["` + field.value.join('" , "') + `"]`;
          }
          if (field.value.length !== 0 && rmVal.length !== 0) {
            temp += ",";
          }
          if (rmVal.length !== 0) {
            temp +=
              `"remove": ["` + rmVal.map((e) => e.value).join('" , "') + `"]`;
          }
          temp += "}";

          finalObject[field.name] = JSON.parse(temp);
        }

        if (field.type === "encode") {
          finalObject[field.name] = encodeURIComponent(field.value);
        }

        if (field.useInUrl) {
          queryParams.push({ name: field.name, value: field.value });
        }
      });

      if (validationError) {
        toast.error(validationError, {
          position: toast.POSITION.TOP_CENTER,
        });
        return;
      }

      setLoading(true);

      try {
        const body = containFiles ? formData : unflatten(finalObject);

        await submitCallback(body, containFiles, queryParams);

        toast.success("Great Success!", {
          position: toast.POSITION.TOP_CENTER,
        });

        closeCallback(true);
      } catch (e) {
        toast.error(e.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      }

      setLoading(false);
    }

    function formChanged(fieldName: string, value: any) {
      let updatedFormFields: IConfigInputField[] = JSON.parse(
        JSON.stringify(formFields)
      );

      updatedFormFields = updatedFormFields.map((field: IConfigInputField) => {
        if (field.name === fieldName) {
          field.value = value;
        }

        return field;
      });

      setFormFields(updatedFormFields);
    }

    function saveRemovedValues(fieldName: string, value: string) {
      var delVal = [...deleteValues];
      delVal.push({ fieldName: fieldName, value: value });

      setDeleteValues(delVal);
    }
    useEffect(() => {
      initFormFields();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Popup
        show={true}
        className="form-popup"
        closeCallback={() => closeCallback(false)}
        customLabels={customLabels}
      >
        <React.Fragment>
          <h2>{title}</h2>
          <section>
            {loading ? (
              <Loader />
            ) : (
              <form onSubmit={submitForm}>
                {formFields.map((field, idx) => {
                  return (
                    <div>
                      <FormRow
                        key={`field_${idx}`}
                        field={field}
                        loadedFields={loadedFields}
                        onChange={formChanged}
                        onRemove={saveRemovedValues}
                        showReset={!field.type || field.type === "text"}
                      />
                      <br />
                      <hr />
                    </div>
                  );
                })}
                <div className="buttons-wrapper center">
                  <Button type="submit" onClick={submitForm} color="green">
                    {locale().submit}
                  </Button>
                </div>
              </form>
            )}
          </section>
          <ToastContainer />
        </React.Fragment>
      </Popup>
    );
  }
);
