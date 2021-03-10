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
import { GraphHolder } from "../graphHolder/graphHolder";

import "./graphPopup.scss";
import { QueryParams } from "../queryParams/queryParams.comp";
import "../queryParams/queryParams.scss";
import { IFetchParams } from "../../services/http.service";
import { createEmitAndSemanticDiagnosticsBuilderProgram } from "typescript";

//const unflatten = require("flat").unflatten;

interface IProps {
  context: IAppContext;
  title: string;
  fields: IConfigInputField[];

  graphConfig: IConfigGraphMethod;
  closeCallback: (reloadData: boolean) => void;
}

interface IGraphData {
  nameStruct: string;
  unitMeasure: string;
  dataStruct: any;
}

export const GraphPopup = withAppContext(
  ({ context, title, fields, graphConfig, closeCallback }: IProps) => {
    const fieldsCopy: IConfigInputField[] = JSON.parse(JSON.stringify(fields));
    const { httpService, activePage, config } = context;
    const [loading, setLoading] = useState<boolean>(true);
    const [doneQuery, setDoneQuery] = useState<boolean>(true);
    const [showGraph, setShowGraph] = useState<boolean>(true);
    const [titleState, setTitleState] = useState<String>(title);
    const pageHeaders: any = activePage?.requestHeaders || {};
    const [formFields, setFormFields] = useState<IConfigInputField[]>(
      fieldsCopy
    );
    const [graphData, setGraphData] = useState<IGraphData[]>();

    const customLabels: ICustomLabels | undefined = {
      ...config?.customLabels,
      ...activePage?.customLabels,
    };

    function graphChanged(
      fieldName: string,
      value: any,
      submitAfterChange?: boolean
    ) {
      const updatedQueryParams: IConfigInputField[] = [...formFields].map(
        (formFields) => {
          if (formFields.name === fieldName) {
            formFields.value = value;
          }
          return formFields;
        }
      );
      setFormFields(updatedQueryParams);
      if (submitAfterChange) {
        submitGraph();
      }
    }

    async function submitGraph() {
      console.log(formFields.map((e) => e.value));

      setLoading(true);
      setDoneQuery(true);

      const results = await httpService.fetch({
        method: "get",
        origUrl: graphConfig.url,
        queryParams: formFields,
        headers: pageHeaders,
      });

      let queryFeature = "";

      formFields.map((f) =>
        f.name === "feature" ? (queryFeature = f.value) : {}
      );

      const resultsFeature = await httpService.fetch({
        method: "get",
        origUrl: "/features/",
        queryParams: formFields.filter((obj) => {
          return obj.name === "feature" && (obj.name = "_id");
        }),
        headers: pageHeaders,
      });

      let extractedData = dataHelpers.extractDataByDataPath(
        results,
        graphConfig.dataPath
      );

      let extractedFeature = dataHelpers.extractDataByDataPath(
        resultsFeature,
        "docs"
      );

      console.log(extractedFeature);

      var goodFeatures = new Array();
      var dataFeatName = new Array<string>();
      var dataFeatUnit = new Array<string>();

      console.log(goodFeatures);

      extractedFeature.map((ft: any) =>
        ft.items.map((comp: any, index: number) => {
          if (comp.dimension === 0 && comp.type === "number") {
            goodFeatures.push(index);
            dataFeatName.push(comp.name);
            dataFeatUnit.push(comp.unit);
          } else return;
        })
      );

      if (goodFeatures.length === 0) {
        console.log("No features to plot");
        setLoading(false);
        return;
      }

      console.log("Goodfeatures.lenght : " + goodFeatures.length);

      console.log("Graph Config");
      console.log(graphConfig);

      console.log("Query results");
      console.log(results);

      console.log("Extracted data");
      console.log(extractedData);

      console.log("Extracted feature");
      console.log(extractedFeature);

      var dataStruct = new Array(goodFeatures.length);

      console.log(dataStruct);

      for (var i = 0; i < dataStruct.length; i++) {
        dataStruct[i] = new Array();
      }
      console.log(dataStruct);

      console.log("Samples");
      extractedData.map((data: any) =>
        data["samples"].map((sample: any) =>
          sample["values"].map((feature: any, indexFeat: number) => {
            if (goodFeatures.includes(indexFeat))
              dataStruct[goodFeatures.indexOf(indexFeat)].push({
                x: Date.parse(data["startDate"]),
                y: feature,
              });
          })
        )
      );

      var finalData = Array<IGraphData>();
      for (i = 0; i < dataFeatName.length; i++) {
        finalData[i] = {
          nameStruct: dataFeatName[i],
          dataStruct: dataStruct[i].reverse(),
          unitMeasure: dataFeatUnit[i],
        };
        console.log(finalData[i]);
      }

      setGraphData(finalData);

      console.log(finalData);

      setShowGraph(true);

      setTitleState(locale.graph + " " + extractedFeature[0]._id);

      /*
      const jsonObject = JSON.stringify(extractedData);

      const toCsv = dataHelpers.arrayToCSV(jsonObject);

      console.log("CSV");
      console.log(toCsv);
      */

      setLoading(false);
    }

    useEffect(() => {
      // eslint-disable-next-line react-hooks/exhaustive-deps

      setLoading(false);
      setDoneQuery(false);
      setShowGraph(false);
    }, []);

    return (
      <Popup
        show={true}
        className="graph-popup"
        closeCallback={() => closeCallback(false)}
        customLabels={customLabels}
      >
        <React.Fragment>
          <h2>{titleState}</h2>

          {loading ? (
            <Loader />
          ) : !doneQuery ? (
            <section className="query-params-form">
              <h5>{locale.graph}</h5>
              <form onSubmit={submitGraph}>
                {formFields.map((queryParam, idx) => {
                  return (
                    <FormRow
                      key={`query_param_${idx}`}
                      field={queryParam}
                      onChange={graphChanged}
                      showReset={!queryParam.type || queryParam.type === "text"}
                    />
                  );
                })}
                <Button type="submit" onClick={submitGraph}>
                  {locale.submit}
                </Button>
              </form>
            </section>
          ) : showGraph ? (
            <GraphHolder dataMat={graphData} />
          ) : (
            <h1>{locale.no_graph_error}</h1>
          )}
        </React.Fragment>
      </Popup>
    );
  }
);
