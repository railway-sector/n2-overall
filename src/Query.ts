/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unsafe-optional-chaining */

import { dateTable } from "./layers";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import { lot_ho_f, cp_f, lot_status_f } from "./uniqueValues";
import type { statisticsType } from "./interfaceKeys";
import Query from "@arcgis/core/rest/support/Query";
import QueryExpressionLayers from "query-layers-expression";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";

//---------------------------------------------------------//
//                 Add Layers to Map                      //
//---------------------------------------------------------//
export function addLayersToMap(map: any, layersList: any[]) {
  layersList.forEach((layer: any) => {
    map.add(layer);
  });
}

//--------------------------------//
//    As of Date function         //
//--------------------------------//
export function yearMonthDay(date: Date) {
  return {
    year: date?.getFullYear() ?? 0,
    month: date?.getMonth() + 1,
    day: date?.getDate(),
  };
}

export function toAsofdate(date: Date) {
  //--- Return displayed date: (as of date)
  const { year, day } = yearMonthDay(date);
  const cmonth = date?.toLocaleString("en-US", { month: "long" });

  return year <= 1970 ? "" : `${cmonth} ${day}, ${year}`;
}

export async function dateUpdate(category: string) {
  //--- Only executed during an initial render
  const query = dateTable.createQuery();
  query.where = `project = 'N2' AND category = '${category}'`;

  const { features } = await dateTable.queryFeatures(query);
  return features.map(({ attributes }: any) => {
    const date = new Date(attributes.date);
    const asofdate = toAsofdate(date);

    return asofdate;
  });
}

//---------------------------------------------//
//               Pie chart                     //
//---------------------------------------------//
// 'piechart' = constant declared from class ChartPieSeries in layers.ts
interface pieChartDataType {
  piechart: any;
  qChart: any;
  layer: any;
  statusList: any;
  statusField: any;
  statisticField: any;
  statisticType: "sum" | "count";
}
export async function pieChartData({
  piechart,
  qChart,
  layer,
  statusList,
  statusField,
  statisticField,
  statisticType,
}: pieChartDataType) {
  piechart.qChart = qChart.queryExpression();
  piechart.layer = layer;
  piechart.statusList = statusList;
  piechart.statusField = statusField;
  piechart.statisticField = statisticField;
  piechart.statisticType = statisticType;

  return await piechart.chartDataPieSeries();
}

interface fieldStatisticType {
  qChart: any;
  layer: any;
  statisticField: any;
  statisticType: statisticsType;
}

export async function fieldStatistic({
  qChart,
  layer,
  statisticField,
  statisticType,
}: fieldStatisticType) {
  const statsCollect = new StatisticDefinition({
    onStatisticField: statisticField,
    outStatisticFieldName: "statsCollect",
    statisticType: statisticType,
  });

  //--- Query
  const query = new Query();
  query.outStatistics = [statsCollect];
  query.where = qChart;

  return layer?.queryFeatures(query).then((response: any) => {
    return response.features[0].attributes.statsCollect;
  });
}

//--- Chart Render helper function
// `pieChartRender` function helps to assign parameter names to class `ChartPieSeriesRender`
interface PieChartRenderType {
  render: any | null; // the first instance of new ChartPieSeriesRender
  chart: any; // amChart
  pieSeries: any;
  legend: any;
  root: any;
  qChart: any;
  q2Expression?: any;
  status_field: any;
  view: any;
  updateChartPanelwidth: any;
  data: any;
  seriesScale: any;
  innerLabel?: any;
  innerLabelFontSize?: any;
  innerValueFontSize?: any;
  layer: FeatureLayer | any;
  statusArray: StatusQueryItem[];
  bkg_color_switch?: boolean;
  seriesFillHash?: boolean;
}

interface StatusQueryItem {
  category: string;
  value: number | string;
  color: string;
}

export async function PieChartRenderType({
  render,
  chart,
  pieSeries,
  legend,
  root,
  qChart,
  q2Expression,
  status_field,
  view,
  updateChartPanelwidth,
  data,
  seriesScale,
  innerLabel,
  innerLabelFontSize,
  innerValueFontSize,
  layer,
  statusArray,
  bkg_color_switch,
  seriesFillHash,
}: PieChartRenderType) {
  render.chart = chart;
  render.pieSeries = pieSeries;
  render.legend = legend;
  render.root = root;
  render.qChart = qChart;
  render.q2Expression = q2Expression;
  render.status_field = status_field;
  render.view = view;
  render.updateChartPanelwidth = updateChartPanelwidth;
  render.data = data;
  render.seriesScale = seriesScale;
  render.innerLabel = innerLabel;
  render.innerLabelFontSize = innerLabelFontSize;
  render.innerValueFontSize = innerValueFontSize;
  render.layer = layer;
  render.statusArray = statusArray;
  render.bkg_color_switch = bkg_color_switch;
  render.seriesFillHash = seriesFillHash;

  return await render.chartDataRenderer();
}

//--- Returns query expression
export const makeQuery = (
  qValues: string[],
  qFields: string[],
  qExpression?: string,
  q2Expression?: string,
) => {
  const q = new QueryExpressionLayers();
  q.qValues = qValues;
  q.qFields = qFields;
  if (qExpression) q.qExpression = qExpression;
  if (q2Expression) q.q2Expression = q2Expression;
  return q;
};

//---------------------------------------------//
//               Stack Columns                 //
//---------------------------------------------//
interface StackColumnChartDataType {
  colchart: any;
  qChart: any;
  categoryTypes: any;
  categoryTypeField: any;
  layers: any;
  statusField: any;
  statusState: any;
}

export async function stackColumnChartData({
  colchart,
  qChart,
  categoryTypes,
  categoryTypeField,
  layers,
  statusField,
  statusState,
}: StackColumnChartDataType) {
  colchart.qChart = qChart.queryExpression();
  colchart.categoryTypes = categoryTypes;
  colchart.categoryTypeField = categoryTypeField;
  colchart.layers = layers;
  colchart.statusField = statusField;
  colchart.statusState = statusState;

  return await colchart.chartDataStackColumns();
}

type StatusTypeNamesType =
  | "To be Constructed"
  | "Under Construction"
  | "delayed"
  | "Completed"
  | "Exceeded"
  | "Normal";

type StatusStateType =
  | "comp"
  | "incomp"
  | "ongoing"
  | "delayed"
  | "exceeded"
  | "normal";

interface ChartStackColumnRender {
  render: any;
  revit: boolean;
  layers: any;
  root: any;
  chart: any;
  data: any;
  buildingLayer?: any;
  qChart: any;
  chartCategoryTypes: any;
  chartCategoryTypeField: any;
  statusTypename: StatusTypeNamesType[];
  statusStatename: StatusStateType[];
  statusArray: any;
  statusField: any;
  seriesStatusColor: any;
  strokeColor: any;
  strokeWidth: any;
  view: any;
  setLayerViewFilter?: any;
  new_chartIconSize: any;
  new_axisFontSize: any;
  chartIconPositionX?: any;
  chartPaddingRightIconLabel: any;
  legend: any;
  updateChartPanelwidth: any;
}

export async function stackColumnChartRender({
  render,
  revit,
  layers,
  root,
  chart,
  data,
  buildingLayer,
  qChart,
  chartCategoryTypes,
  chartCategoryTypeField,
  statusTypename,
  statusStatename,
  statusArray,
  statusField,
  seriesStatusColor,
  strokeColor,
  strokeWidth,
  view,
  setLayerViewFilter,
  new_chartIconSize,
  new_axisFontSize,
  chartIconPositionX,
  chartPaddingRightIconLabel,
  legend,
  updateChartPanelwidth,
}: ChartStackColumnRender) {
  render.revit = revit;
  render.layers = layers;
  render.root = root;
  render.chart = chart;
  render.data = data;
  render.buildingLayer = buildingLayer;
  render.qChart = qChart;
  render.chartCategoryTypes = chartCategoryTypes;
  render.chartCategoryTypeField = chartCategoryTypeField;
  render.statusTypename = statusTypename;
  render.statusStatename = statusStatename;
  render.statusArray = statusArray;
  render.statusField = statusField;
  render.seriesStatusColor = seriesStatusColor;
  render.strokeColor = strokeColor;
  render.strokeWidth = strokeWidth;
  render.view = view;
  render.setLayerViewFilter = setLayerViewFilter;
  render.new_chartIconSize = new_chartIconSize;
  render.new_axisFontSize = new_axisFontSize;
  render.chartIconPositionX = chartIconPositionX;
  render.chartPaddingRightIconLabel = chartPaddingRightIconLabel;
  render.legend = legend;
  render.updateChartPanelwidth = updateChartPanelwidth;

  return await render.chartRendererColumn();
}

//---------------------------------------------//
//           Lot (handed over area)            //
//---------------------------------------------//
interface HandedOverArea {
  aa_field: any;
  hoa_field: any;
  cp_list: any;
  layer: any;
}
export async function handedOverAreaByContractp({
  aa_field,
  hoa_field,
  cp_list,
  layer,
}: HandedOverArea) {
  return await Promise.all(
    cp_list.map(async (cp: any) => {
      const aa = new StatisticDefinition({
        onStatisticField: aa_field,
        outStatisticFieldName: "aa",
        statisticType: "sum",
      });

      const hoa = new StatisticDefinition({
        onStatisticField: hoa_field,
        outStatisticFieldName: "hoa",
        statisticType: "sum",
      });

      const query = layer.createQuery();
      query.where = `CP = '${cp}' AND ${cp_f} IS NOT NULL`;
      query.outStatistics = [aa, hoa];

      const response = await layer?.queryFeatures(query);
      const attributes = response.features[0].attributes;
      const perc = ((attributes.hoa / attributes.aa) * 100).toFixed(0);

      return {
        category: cp,
        value: perc ?? 0,
      };
    }),
  );
}

//---------------------------------------------//
//                  Highlight Lot              //
//---------------------------------------------//
let highlight: any;
export async function highlightLot(layer: any, view: any) {
  const query = layer.createQuery();

  const layerView = await view?.whenLayerView(layer);
  const results = await layer?.queryObjectIds(query);

  if (highlight) {
    highlight.remove();
  }
  highlight = layerView?.highlight(results);
}

export function highlightRemove() {
  if (highlight) {
    highlight.remove();
  }
}

export async function highlightHandedOverLot(layer: any, view: any) {
  const query = layer.createQuery();
  query.where = `${lot_ho_f} = 1 AND ${lot_status_f} <> 8`;

  const layerView = view?.whenLayerView(layer);
  const results = await layer?.queryObjectIds(query);

  if (highlight) {
    highlight.remove();
  }
  highlight = layerView.highlight(results);
}

//---------------------------------------------//
//                  Other Tools                //
//---------------------------------------------//
export function thousands_separators(num: any) {
  if (num) {
    const num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  } else {
    return 0;
  }
}

//--- Zoom to Layer
// const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
export function zoomToLayer(layer: any, view: any) {
  return layer.queryExtent().then((response: any) => {
    view?.goTo(response.extent, { speedFactor: 2 }).catch((error: any) => {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    });
  });
}

//--- Zoom to fullExtet
export function zoomToFullExtent(layer: any, view: any) {
  layer.fullExtent &&
    view?.goTo(layer.fullExtent).catch((error: any) => {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    });
}
