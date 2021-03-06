import React, { Component, useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  LineSeries,
} from "react-vis";

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

interface IGraphData {
  nameStruct: string;
  unitMeasure: string;
  dataStruct: any;
}

interface IProps {
  dataMat: IGraphData[];
}

export const GraphHolder = withAppContext(({ dataMat }: IProps) => {
  useEffect(() => {
    console.log(dataMat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="graphHolder">
      <br />
      <hr />
      <br />
      {dataMat.map((data) => {
        return (
          <div>
            <h2>{data.nameStruct}</h2>
            <br />
            <XYPlot width={1400} height={600} xType="ordinal">
              <VerticalGridLines />
              <HorizontalGridLines />
              <XAxis
                title="t"
                tickFormat={function tickFormat(d) {
                  console.log(d);
                  const date = new Date(+d);
                  console.log(date);
                  return date.toString().substr(4, 20);
                }}
              />
              <YAxis title={data.unitMeasure} />
              <LineSeries data={data.dataStruct} />
            </XYPlot>
            <br />
            <hr />
            <br />
          </div>
        );
      })}
    </div>
  );
});
//style={{ fill: "none" }}
