import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { Popup } from "../popup/popup.comp";
import {
  IConfigInputField,
  IConfigGetSingleMethod,
  IConfigPostMethod,
  IConfigPutMethod,
  ICustomLabels,
  IQueryParam,
  IConfigGetAllMethod,
  IConfigGraphMethod,
} from "../../common/models/config.model";
import { FormRow } from "../formRow/formRow.comp";
import { Button } from "../button/button.comp";
import { Loader } from "../loader/loader.comp";
import { dataHelpers } from "../../helpers/data.helpers";
import { fileHelpers } from "../../helpers/file.helpers";
import { IAppContext } from "../app.context";
import { withAppContext } from "../withContext/withContext.comp";
import locale from "../../common/locale";

import "./graphPopup.scss";

const unflatten = require("flat").unflatten;

interface IProps {
  context: IAppContext;
  title: string;
  fields: IConfigInputField[];
  rawData?: any;
  getAllConfig?: IConfigGetAllMethod;
  methodConfig: IConfigGraphMethod;
  closeCallback: (reloadData: boolean) => void;
}

export const GraphPopup = withAppContext(
  ({
    context,
    title,
    fields,
    rawData,
    getAllConfig,
    methodConfig,
    closeCallback,
  }: IProps) => {
    const fieldsCopy: IConfigInputField[] = JSON.parse(JSON.stringify(fields));
    const { httpService, activePage, config } = context;
    const [loading, setLoading] = useState<boolean>(true);
    const [formFields, setFormFields] = useState<IConfigInputField[]>([]);
    const [finalRawData, setFinalRawData] = useState<any>(null);
    const pageHeaders: any = activePage?.requestHeaders || {};
    const customLabels: ICustomLabels | undefined = {
      ...config?.customLabels,
      ...activePage?.customLabels,
    };

    async function initFormFields() {
      let finalRawData: any = rawData || {};

      if (getAllConfig && getAllConfig.url) {
        try {
          const {
            url,
            requestHeaders,
            actualMethod,
            dataPath,
            queryParams,
            dataTransform,
          } = getAllConfig;
          const result = await httpService.fetch({
            method: "get",
            origUrl: url,
            queryParams,
            headers: Object.assign({}, pageHeaders, requestHeaders || {}),
            rawData,
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
          toast.error("Could not load single item's data.");
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

    function submitForm() {}

    useEffect(() => {
      // eslint-disable-next-line react-hooks/exhaustive-deps

      setLoading(false);
    }, []);

    return (
      <Popup
        show={true}
        className="graph-popup"
        closeCallback={() => closeCallback(false)}
        customLabels={customLabels}
      >
        <React.Fragment>
          <h2>{title}</h2>

          {loading ? (
            <Loader />
          ) : (
            <section className="query-params-form">
              <h5>{locale.search}</h5>
              <form onSubmit={submitForm}>
                {fieldsCopy.map((queryParam, idx) => {
                  return (
                    <FormRow
                      key={`query_param_${idx}`}
                      field={queryParam}
                      onChange={formChanged}
                      showReset={!queryParam.type || queryParam.type === "text"}
                    />
                  );
                })}
                <Button type="submit" onClick={submitForm}>
                  {locale.submit}
                </Button>
              </form>
            </section>
          )}
        </React.Fragment>
      </Popup>
    );
  }
);
