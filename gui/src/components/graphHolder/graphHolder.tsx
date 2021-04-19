import React, { Component, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
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

import { FormRow } from "../formRow/formRow.comp";
import { Button } from "../button/button.comp";
import { Loader } from "../loader/loader.comp";
import { dataHelpers } from "../../helpers/data.helpers";
import { fileHelpers } from "../../helpers/file.helpers";
import { IAppContext } from "../app.context";
import { withAppContext } from "../withContext/withContext.comp";

import locale from "../../common/locale";

import "./graphHolder.scss";
//import "../node_modules/react-vis/dist/style.css";

import fontawesome from "@fortawesome/fontawesome";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {
  faBackward,
  faForward,
  faSearchPlus,
  faSearchMinus,
} from "@fortawesome/fontawesome-free-solid";

fontawesome.library.add(faBackward, faForward, faSearchPlus, faSearchMinus);

interface IGraphData {
  nameStruct: string;
  unitMeasure: string;
  dataStruct: any;
}

interface IHintData {
  x: string;
  y: string;
}

interface IProps {
  dataMat: IGraphData[];
  prev: boolean;
  prevCallback: () => void;
  next: boolean;
  nextCallback: () => void;
  zoomIn: boolean;
  zoomInCallback: () => void;
  zoomOut: boolean;
  zoomOutCallback: () => void;
}

export const GraphHolder = withAppContext(
  ({
    dataMat,
    prev,
    prevCallback,
    next,
    nextCallback,
    zoomIn,
    zoomInCallback,
    zoomOut,
    zoomOutCallback,
  }: IProps) => {
    useEffect(() => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setHintData(Array(dataMat.length).fill({ date: "", y: "" }));
      setHoverData(Array(dataMat.length).fill(false));
    }, []);

    const [hoverData, setHoverData] = useState<boolean[]>(Array(1).fill(false));
    const [hintData, setHintData] = useState<IHintData[]>(Array(0));

    function setHoverDataWithIndex(index: number, value: boolean) {
      // 1. Make a shallow copy of the items
      let items = [...hoverData];
      // 2. Make a shallow copy of the item you want to mutate
      let item = items[index];
      // 3. Replace the property you're intested in
      item = value;
      // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
      items[index] = item;
      // 5. Set the state to our new copy
      setHoverData(items);
    }

    function setHintDataWithIndex(index: number, value: IHintData) {
      // 1. Make a shallow copy of the items
      let items = [...hintData];
      // 2. Make a shallow copy of the item you want to mutate
      let item = items[index];
      // 3. Replace the property you're intested in
      item = value;
      // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
      items[index] = item;
      // 5. Set the state to our new copy
      setHintData(items);
    }

    return (
      <div className="graphHolder">
        <br />
        <hr />
        <div>
          <Button
            className="button-margin"
            title={locale().previous_page}
            onClick={() => prevCallback()}
            disabled={!prev}
          >
            <i className="fa fa-backward" aria-hidden="true"></i>
          </Button>

          <Button
            className="button-margin"
            title={locale().next_page}
            onClick={() => nextCallback()}
            disabled={!next}
          >
            <i className="fa fa-forward" aria-hidden="true"></i>
          </Button>

          <Button
            className="button-margin"
            title={locale().zoomIn}
            onClick={() => zoomInCallback()}
            disabled={!zoomIn}
          >
            <i className="fa fa-search-plus" aria-hidden="true"></i>
          </Button>

          <Button
            className="button-margin"
            title={locale().zoomOut}
            onClick={() => zoomOutCallback()}
            disabled={!zoomOut}
          >
            <i className="fa fa-search-minus" aria-hidden="true"></i>
          </Button>
        </div>
        <br />
        {dataMat.map((data, index) => {
          return (
            <div>
              <h2>{data.nameStruct}</h2>
              <br />
              <XYPlot
                width={1600}
                height={600}
                xType="ordinal"
                onMouseLeave={() => setHoverDataWithIndex(index, false)}
              >
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis
                  title="t"
                  tickTotal={7}
                  //tickLabelAngle={-90}
                  tickFormat={function tickFormat(d) {
                    const date = new Date(+d);
                    return date.toString().substr(4, 6);
                  }}
                />
                <YAxis title={data.unitMeasure} />
                <LineMarkSeries
                  data={data.dataStruct}
                  onValueMouseOver={(d) => {
                    setHoverDataWithIndex(index, true);
                    setHintDataWithIndex(index, {
                      x: d.x.toString(),
                      y: d.y.toString(),
                    });
                    console.log(d);
                  }} //
                />
                {hoverData[index] && (
                  <Hint value={hintData[index]}>
                    <div style={{ background: "grey" }}>
                      {"Start time: " + new Date(+hintData[index].x).toString()}
                      <br />
                      {locale().value + ": " + hintData[index].y}
                    </div>
                  </Hint>
                )}
              </XYPlot>
              <br />
              <hr />
              <br />
            </div>
          );
        })}
        <ToastContainer />
      </div>
    );
  }
);
//style={{ fill: "none" }}
