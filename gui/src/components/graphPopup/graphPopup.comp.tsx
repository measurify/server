import React, { useState, useEffect } from "react";

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
    const [showGraph, setShowGraph] = useState<boolean>(false);
    const [titleState, setTitleState] = useState<String>(title);
    const [formFields, setFormFields] = useState<IConfigInputField[]>(
      fieldsCopy
    );
    const [graphData, setGraphData] = useState<IGraphData[] | null>();
    const [prevGraphData, setPrevGraphData] = useState<IGraphData[] | null>();
    const [nextGraphData, setNextGraphData] = useState<IGraphData[] | null>();

    const [next, setNext] = useState<boolean>();
    const [prev, setPrev] = useState<boolean>();
    const [zoomIn, setZoomIn] = useState<boolean>();
    const [zoomOut, setZoomOut] = useState<boolean>(true);
    const [pageNum, setPageNum] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [error, setError] = useState<string>();

    const [fetchedData, setFetchedData] = useState<null | any>(null);
    const [fetchedFeature, setFetchedFeature] = useState<null | any>(null);

    const [totalDocs, setTotalDocs] = useState<number>(0);
    const [limit, setLimit] = useState<number>(0);

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

    async function fetchFeatureData(fetchFeatureData: boolean = false) {
      //get the data for the selected feature
      const resultsData = await httpService.fetch({
        method: "get",
        origUrl: graphConfig.url,
        queryParams: formFields,
        exactMatch: true,
        headers: { "content-type": "application/json" },
      });

      let fF = fetchedFeature;
      if (fetchFeatureData === true) {
        let queryFeature = "";

        //get the name of the selected feature
        formFields.map((f) =>
          f.name === "feature" ? (queryFeature = f.value) : {}
        );

        //fetch the feature
        const resultsFeature = await httpService.fetch({
          method: "get",
          origUrl: "/features/",
          queryParams: formFields.filter((obj) => {
            return obj.name === "feature" && (obj.name = "_id");
          }),
          exactMatch: true,
          headers: { "content-type": "application/json" },
        });

        formFields.filter((obj) => {
          return obj.name === "_id" && (obj.name = "feature");
        });

        //extract the data for the feature
        fF = dataHelpers.extractDataByDataPath(resultsFeature, "docs");
      }

      const pG = resultsData["page"];

      const tP = resultsData["totalPages"];

      const tD = resultsData["totalDocs"];

      const limit = resultsData["limit"];

      //extract the data for the measurements
      const fD = dataHelpers.extractDataByDataPath(
        resultsData,
        graphConfig.dataPath
      );

      //return data
      return {
        fetchedData: fD,
        fetchedFeature: fF,
        pageNum: pG,
        totalPages: tP,
        totalDocs: tD,
        limit: limit,
      };
    }

    function buildData(fetchedData: any, fetchedFeature: any) {
      let goodFeatures = new Array();
      let dataFeatName = new Array<string>();
      let dataFeatUnit = new Array<string>();

      fetchedFeature.map((ft: any) =>
        ft.items.map((comp: any, index: number) => {
          if (comp.dimension === 0 && comp.type === "number") {
            goodFeatures.push(index);
            dataFeatName.push(comp.name);
            dataFeatUnit.push(comp.unit);
          } else return null;
        })
      );

      if (goodFeatures.length === 0) {
        setLoading(false);
        return null;
      }

      let dataStruct = new Array(goodFeatures.length);

      for (let i = 0; i < dataStruct.length; i++) {
        dataStruct[i] = new Array();
      }

      fetchedData.map((data: any) =>
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

      let finalData = Array<IGraphData>();
      for (let i = 0; i < dataFeatName.length; i++) {
        finalData[i] = {
          nameStruct: dataFeatName[i],
          dataStruct: dataStruct[i].reverse(),
          unitMeasure: dataFeatUnit[i],
        };
      }

      return finalData;
    }

    async function buildPrev(
      formFields: IConfigInputField[],
      fetchedFeature: any
    ) {
      let tempField = formFields;
      tempField.filter((obj) => {
        return (
          obj.name === "page" && (obj.value = 1 + parseInt(obj.value) + "")
        );
      });

      const resultsData = await httpService.fetch({
        method: "get",
        origUrl: graphConfig.url,
        queryParams: tempField,
        exactMatch: true,
        headers: { "content-type": "application/json" },
      });
      const prData = dataHelpers.extractDataByDataPath(
        resultsData,
        graphConfig.dataPath
      );

      tempField.filter((obj) => {
        return (
          obj.name === "page" && (obj.value = parseInt(obj.value) - 1 + "")
        );
      });

      const pPage = buildData(prData, fetchedFeature);
      return pPage;
    }
    async function buildNext(
      formFields: IConfigInputField[],
      fetchedFeature: any
    ) {
      let tempField = formFields;
      tempField.filter((obj) => {
        return (
          obj.name === "page" && (obj.value = parseInt(obj.value) - 1 + "")
        );
      });

      const resultsData = await httpService.fetch({
        method: "get",
        origUrl: graphConfig.url,
        queryParams: tempField,
        exactMatch: true,
        headers: { "content-type": "application/json" },
      });
      const nxData = dataHelpers.extractDataByDataPath(
        resultsData,
        graphConfig.dataPath
      );

      tempField.filter((obj) => {
        return (
          obj.name === "page" && (obj.value = parseInt(obj.value) + 1 + "")
        );
      });

      const nPage = buildData(nxData, fetchedFeature);
      return nPage;
    }
    async function submitGraph() {
      setLoading(true);
      setDoneQuery(true);

      const {
        fetchedData,
        fetchedFeature,
        pageNum,
        totalPages,
        totalDocs,
        limit,
      } = await fetchFeatureData(true);

      setFetchedData(fetchedData);
      setFetchedFeature(fetchedFeature);
      setPageNum(pageNum);
      setTotalPages(totalPages);
      setTotalDocs(totalDocs);
      setLimit(limit);

      const finalData = buildData(fetchedData, fetchedFeature);

      if (finalData === null) {
        setError(locale().wrong_feature_error);
        return;
      }

      if (finalData[0].dataStruct.length === 0) {
        setError(locale().no_data_error);
        setLoading(false);
        return;
      }
      setGraphData(finalData);

      const next = pageNum > 1;
      const prev = pageNum < totalPages;

      const zoomIn = limit > 3;
      const zoomOut = limit < totalDocs;

      setNext(next);
      setPrev(prev);

      setZoomIn(zoomIn);
      setZoomOut(zoomOut);

      setShowGraph(true);

      setTitleState(locale().graph + " " + fetchedFeature[0]._id);

      setLoading(false);

      let pPage = null;
      let nPage = null;
      if (prev === true) {
        pPage = await buildPrev(formFields, fetchedFeature);
      }
      if (next === true) {
        nPage = await buildNext(formFields, fetchedFeature);
      }
      setPrevGraphData(pPage);
      setNextGraphData(nPage);
    }

    async function buildMain() {
      const {
        fetchedData,
        pageNum,
        totalPages,
        totalDocs,
        limit,
      } = await fetchFeatureData();

      setLoading(true);

      setPageNum(pageNum);
      setTotalPages(totalPages);

      const finalData = buildData(fetchedData, fetchedFeature);

      if (finalData === null) {
        setError(locale().wrong_feature_error);
        return;
      }

      if (finalData[0].dataStruct.length === 0) {
        setError(locale().no_data_error);
        setLoading(false);
        return;
      }
      setGraphData(finalData);

      const next = pageNum > 1;
      const prev = pageNum < totalPages;

      const zoomIn = limit > 3;
      const zoomOut = limit < totalDocs;

      setNext(next);
      setPrev(prev);

      setZoomIn(zoomIn);
      setZoomOut(zoomOut);

      setTotalDocs(totalDocs);
      setLimit(limit);

      setLoading(false);

      let pPage = null;
      let nPage = null;
      if (prev === true) {
        pPage = await buildPrev(formFields, fetchedFeature);
      }
      if (next === true) {
        nPage = await buildNext(formFields, fetchedFeature);
      }
      setPrevGraphData(pPage);
      setNextGraphData(nPage);
    }

    async function prevShifting() {
      setLoading(true);

      setNextGraphData(graphData);
      setGraphData(prevGraphData);

      setLoading(false);

      setPrev(pageNum + 1 < totalPages);
      setNext(pageNum + 1 > 1);
      setPageNum(pageNum + 1);
      const prPage = await buildPrev(formFields, fetchedFeature);

      setPrevGraphData(prPage);
    }

    async function nextShifting() {
      setLoading(true);

      setPrevGraphData(graphData);
      setGraphData(nextGraphData);
      setPrev(pageNum - 1 < totalPages);
      setNext(pageNum - 1 > 1);
      setPageNum(pageNum - 1);
      const nxPage = await buildNext(formFields, fetchedFeature);

      setNextGraphData(nxPage);
    }

    async function increaseSamples() {
      setLoading(true);

      let tempField = formFields;

      tempField.filter((obj) => {
        return obj.name === "limit" && (obj.value = 2 + limit + "");
      });

      setFormFields(tempField);
      buildMain();
      setLoading(false);
    }

    async function decreaseSamples() {
      setLoading(true);

      let tempField = formFields;

      tempField.filter((obj) => {
        return obj.name === "limit" && (obj.value = limit - 2 + "");
      });

      setFormFields(tempField);
      buildMain();
      setLoading(false);
    }

    useEffect(() => {
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
              <h5>{locale().graph}</h5>
              <form onSubmit={submitGraph}>
                {formFields.map((queryParam, idx) => {
                  if (queryParam.name == "page") return "";
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
                  {locale().submit}
                </Button>
              </form>
            </section>
          ) : showGraph ? (
            <GraphHolder
              dataMat={graphData}
              prev={prev}
              prevCallback={prevShifting}
              next={next}
              nextCallback={nextShifting}
              zoomIn={zoomIn}
              zoomInCallback={decreaseSamples}
              zoomOut={zoomOut}
              zoomOutCallback={increaseSamples}
            />
          ) : (
            <h1>{error}</h1>
          )}
        </React.Fragment>
      </Popup>
    );
  }
);
