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

import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  LineMarkSeries,
  Hint,
} from "react-vis";
import "react-vis/dist/style.css";

import "./graphPopup.scss";
import { QueryParams } from "../queryParams/queryParams.comp";
import "../queryParams/queryParams.scss";
import { IFetchParams } from "../../services/http.service";
import { createEmitAndSemanticDiagnosticsBuilderProgram } from "typescript";

import fontawesome from "@fortawesome/fontawesome";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {
  faBackward,
  faForward,
  faSearchPlus,
  faSearchMinus,
} from "@fortawesome/fontawesome-free-solid";

fontawesome.library.add(faBackward, faForward, faSearchPlus, faSearchMinus);

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

interface IHintData {
  x: string;
  y: string;
}

export const GraphPopup = withAppContext(
  ({ context, title, fields, graphConfig, closeCallback }: IProps) => {
    const fieldsCopy: IConfigInputField[] = JSON.parse(JSON.stringify(fields));
    const { httpService, activePage, config } = context;
    const [loading, setLoading] = useState<boolean>(true);
    const [doneQuery, setDoneQuery] = useState<boolean>(true);
    const [showGraph, setShowGraph] = useState<boolean>(false);
    const [titleState, setTitleState] = useState<String>(title);
    const [formFields, setFormFields] =
      useState<IConfigInputField[]>(fieldsCopy);
    const [graphData, setGraphData] = useState<IGraphData[]>();

    const [head, setHead] = useState<number>(0);
    const [tail, setTail] = useState<number>(10);

    const [pageNum, setPageNum] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [error, setError] = useState<string>();

    const [loadedDocSize, setLoadedDocSize] = useState<number>(0);
    //const [fetchedData, setFetchedData] = useState<null | any>(null);
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

    /*

    This function will get the selected feature (graph building form) and fetch it from the features page
    The fetchFeatureData boolean will make the function fetch the informations about the selected features
    The pageoffset let you choose data from a different page from the current one

    */
    async function fetchFeatureData(
      fetchFeatureData: boolean = false,
      pageOffset: number = 0
    ) {
      //set page offset
      let tempField = [...formFields];
      tempField.filter((obj) => {
        return obj.name === "page" && (obj.value = pageNum + pageOffset + "");
      });

      //get the data for the selected feature
      const resultsData = await httpService.fetch({
        method: "get",
        origUrl: graphConfig.url,
        queryParams: tempField,
        exactMatch: true,
        headers: { "content-type": "application/json" },
      });

      let fF = fetchedFeature;
      if (fetchFeatureData === true) {
        //fetch the feature
        const resultsFeature = await httpService.fetch({
          method: "get",
          origUrl: "/features/",
          queryParams: tempField.filter((obj) => {
            return obj.name === "feature" && (obj.name = "_id");
          }),
          exactMatch: true,
          headers: { "content-type": "application/json" },
        });

        tempField.filter((obj) => {
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
      let compatibleComponents = new Array();
      let dataFeatureName = new Array<string>();
      let dataFeatureUnit = new Array<string>();

      fetchedFeature.map((ft: any) =>
        ft.items.map((comp: any, index: number) => {
          if (comp.dimension === 0 && comp.type === "number") {
            compatibleComponents.push(index);
            dataFeatureName.push(comp.name);
            dataFeatureUnit.push(comp.unit);
          } else return null;
        })
      );

      if (compatibleComponents.length === 0) {
        setLoading(false);
        return null;
      }

      let dataStruct = new Array(compatibleComponents.length);

      for (let i = 0; i < dataStruct.length; i++) {
        dataStruct[i] = new Array();
      }

      fetchedData.map((data: any) =>
        data["samples"].map((sample: any) =>
          sample["values"].map((feature: any, indexFeat: number) => {
            if (compatibleComponents.includes(indexFeat))
              dataStruct[compatibleComponents.indexOf(indexFeat)].push({
                x: Date.parse(data["startDate"]),
                y: feature,
              });
          })
        )
      );

      let finalData = Array<IGraphData>();
      for (let i = 0; i < dataFeatureName.length; i++) {
        finalData[i] = {
          nameStruct: dataFeatureName[i],
          dataStruct: dataStruct[i], //.reverse() will be applied to the subset
          unitMeasure: dataFeatureUnit[i],
        };
      }

      return finalData;
    }

    async function submitGraph() {
      setLoading(true);
      setDoneQuery(true);
      setHead(0);
      setTail(10);

      const {
        fetchedData,
        fetchedFeature,
        pageNum,
        totalPages,
        totalDocs,
        limit,
      } = await fetchFeatureData(true);

      //setFetchedData(fetchedData);
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
      // inserire parte con i cursori qua

      setGraphData(finalData);
      const updatedDocSize = loadedDocSize + finalData[0].dataStruct.length;
      setLoadedDocSize(updatedDocSize);

      setShowGraph(true);

      setTitleState(locale().plot + " " + fetchedFeature[0]._id);

      setLoading(false);
    }

    ///////////////////////////////
    //graph functions
    function CalculateButtons() {
      const prev: boolean = tail < totalDocs;
      const next: boolean = head > 0;
      const zoomIn: boolean = tail - head > 3;
      const zoomOut: boolean = tail - head <= totalDocs;

      return { prev, next, zoomIn, zoomOut };
    }

    async function TravelPlot(act: "prev" | "next" | "zoomIn" | "zoomOut") {
      let newHead: number = head;
      let newTail: number = tail;
      const diff = tail - head;
      const zoomFactor = 1;

      //move head and tail
      switch (act) {
        case "prev":
          newHead = newHead + diff;
          newTail = newTail + diff;
          break;
        case "next":
          newHead = newHead - diff;
          newTail = newTail - diff;
          break;
        case "zoomIn":
          newHead = newHead + zoomFactor;
          newTail = newTail - zoomFactor;
          break;
        case "zoomOut":
          newHead = newHead - zoomFactor;
          newTail = newTail + zoomFactor;
          break;
      }

      //constraints
      if (newHead <= 0) {
        //if possible keep the same amount of data in the plot shifting the tail
        newTail = newTail - newHead;
        newHead = 0;
      }
      if (newTail > totalDocs) {
        newTail = totalDocs;
      }

      //load data before required
      if (
        (newTail + diff > loadedDocSize ||
          newTail + zoomFactor > loadedDocSize) &&
        loadedDocSize < totalDocs
      ) {
        const { fetchedData, pageNum } = await fetchFeatureData(false, 1);

        setPageNum(pageNum);

        const newData = buildData(fetchedData, fetchedFeature);

        if (newData === null) {
          setError(locale().wrong_feature_error);
          return;
        }

        let finalData: IGraphData[];
        if (graphData !== undefined) {
          finalData = [...graphData];
          for (let i = 0; i < newData.length; i++) {
            finalData[i].nameStruct = graphData[i].nameStruct;
            finalData[i].unitMeasure = graphData[i].unitMeasure;
            finalData[i].dataStruct = graphData[i].dataStruct.concat(
              newData[i].dataStruct
            );
          }

          setGraphData(finalData);
          const updatedDocSize = finalData[0].dataStruct.length;
          setLoadedDocSize(updatedDocSize);
        }
      }

      //set head and tail
      setHead(newHead);
      setTail(newTail);
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
              <h5>{locale().plot}</h5>
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
              head={head}
              tail={tail}
              prevCallback={() => {
                TravelPlot("prev");
              }}
              nextCallback={() => {
                TravelPlot("next");
              }}
              zoomInCallback={() => {
                TravelPlot("zoomIn");
              }}
              zoomOutCallback={() => {
                TravelPlot("zoomOut");
              }}
              zoomIn={CalculateButtons().zoomIn}
              zoomOut={CalculateButtons().zoomOut}
              prev={CalculateButtons().prev}
              next={CalculateButtons().next}
            />
          ) : (
            <h1>{error}</h1>
          )}
        </React.Fragment>
      </Popup>
    );
  }
);
