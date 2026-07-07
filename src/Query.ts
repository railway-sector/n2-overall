/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unsafe-optional-chaining */
import { dateTable, lotLayer } from "./layers";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import {
  lotHandedOverAreaField,
  lotHandedOverField,
  affectedAreaField,
  cpField,
} from "./uniqueValues";
import Collection from "@arcgis/core/core/Collection";
import ActionButton from "@arcgis/core/support/actions/ActionButton";
import { ngcp_tagged_structureLayer } from "./layers";
import type { ArcgisScene } from "@arcgis/map-components/components/arcgis-scene";
import type { statisticsType } from "./uniqueValues";
import Query from "@arcgis/core/rest/support/Query";

const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;

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
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

// Updat date
export async function dateUpdate(category: any) {
  const query = dateTable.createQuery();
  query.where = `project = 'N2' AND category = '${category}'`; // "project = 'N2'" + ' AND ' + "category = 'Land Acquisition'";

  const response = await dateTable.queryFeatures(query);
  const dates = response.features.map((result: any) => {
    // get today and date recorded in the table
    const today = new Date();
    const date = new Date(result.attributes.date);

    // Calculate the number of days passed since the last update
    const time_passed = today.getTime() - date.getTime();
    const days_passed = Math.round(time_passed / (1000 * 3600 * 24));

    const year = yearMonthDay(date).year;
    const month = date.toLocaleString("en-US", {
      month: "long",
    });
    const day = date.getDate();
    const as_of_date = year < 1990 ? "" : `${month} ${day}, ${year}`;
    return [as_of_date, days_passed, date];
  });
  return dates;
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
      query.where = `CP = '${cp}' AND ${cpField} IS NOT NULL`;
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
//               Stack Columns                 //
//---------------------------------------------//
interface stackColumnsDataType {
  stackchart: any;
  qChart: any;
  categoryTypes: any;
  categoryTypeField: any;
  layers: any;
  statusField: any;
  statusState: any;
}

export async function stackColumnsChartData({
  stackchart,
  qChart,
  categoryTypes,
  categoryTypeField,
  layers,
  statusField,
  statusState,
}: stackColumnsDataType) {
  stackchart.qChart = qChart.queryExpression();
  stackchart.categoryTypes = categoryTypes;
  stackchart.categoryTypeField = categoryTypeField;
  stackchart.layers = layers;
  stackchart.statusField = statusField;
  stackchart.statusState = statusState;

  return await stackchart.chartDataStackColumns();
}

//---------------------------------------------//
//           Land, Structure, NLO              //
//---------------------------------------------//
export async function generateHandedOverAreaData() {
  const total_affected_area = new StatisticDefinition({
    onStatisticField: affectedAreaField,
    outStatisticFieldName: "total_affected_area",
    statisticType: "sum",
  });

  const total_handedover_area = new StatisticDefinition({
    onStatisticField: lotHandedOverAreaField,
    outStatisticFieldName: "total_handedover_area",
    statisticType: "sum",
  });

  const query = lotLayer.createQuery();
  query.where = `${cpField} IS NOT NULL`;
  query.outStatistics = [total_affected_area, total_handedover_area];
  query.orderByFields = [cpField];
  query.groupByFieldsForStatistics = [cpField];

  return lotLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features;
    const data = stats.map((result: any) => {
      const attributes = result.attributes;
      const affected = attributes.total_affected_area;
      const handedOver = attributes.total_handedover_area;
      const cp = attributes.CP;

      const percent = ((handedOver / affected) * 100).toFixed(0);

      return Object.assign(
        {},
        {
          category: cp,
          value: percent,
        },
      );
    });

    return data;
  });
}

export const dateFormat = (inputDate: any, format: any) => {
  //parse the input date
  const date = new Date(inputDate);

  //extract the parts of the date
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  //replace the month
  format = format.replace("MM", month.toString().padStart(2, "0"));

  //replace the year
  if (format.indexOf("yyyy") > -1) {
    format = format.replace("yyyy", year.toString());
  } else if (format.indexOf("yy") > -1) {
    format = format.replace("yy", year.toString().substr(2, 2));
  }

  //replace the day
  format = format.replace("dd", day.toString().padStart(2, "0"));

  return format;
};

//---------------------------------------------//
//                  Other Tools                //
//---------------------------------------------//

// Thousand separators function
export function thousands_separators(num: any) {
  if (num) {
    const num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }
}

export function zoomToLayer(layer: any, view: any) {
  return layer.queryExtent().then((response: any) => {
    view
      ?.goTo(response.extent, {
        //response.extent
        speedFactor: 2,
      })
      .catch((error: any) => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });
  });
}

export function highlightHandedOverLot(layer: any, view: any) {
  view?.whenLayerView(layer).then((urgentLayerView: any) => {
    const query = layer.createQuery();
    query.where = `${lotHandedOverField} = 1`;
    layer.queryFeatures(query).then((results: any) => {
      const length = results.features.length;
      const objID = [];
      for (let i = 0; i < length; i++) {
        const obj = results.features[i].attributes.OBJECTID;
        objID.push(obj);
      }

      if (highlight) {
        highlight.remove();
      }
      highlight = urgentLayerView.highlight(objID);
    });
  });
}

let highlight: any;
export function highlightLot(layer: any, view: any) {
  view?.whenLayerView(layer).then((urgentLayerView: any) => {
    const query = layer.createQuery();
    layer.queryFeatures(query).then((results: any) => {
      const length = results.features.length;
      const objID = [];
      for (let i = 0; i < length; i++) {
        const obj = results.features[i].attributes.OBJECTID;
        objID.push(obj);
      }

      if (highlight) {
        highlight.remove();
      }
      highlight = urgentLayerView.highlight(objID);
    });
  });
}

export function highlightRemove() {
  if (highlight) {
    highlight.remove();
  }
}

export function defineActions(event: any) {
  const { item } = event;
  if (item.title === "Sapang Balen River Realignment") {
    item.actionsSections = new Collection([
      new Collection([
        new ActionButton({
          title: "Zoom to Area",
          icon: "zoom-in-fixed",
          id: "full-extent-sapangbalenriver",
        }),
      ]),
    ]);
  }

  if (item.title === "NGCP Line") {
    item.actionsSections = new Collection([
      new Collection([
        new ActionButton({
          title: "Zoom to Area",
          icon: "zoom-in-fixed",
          id: "full-extent-ngcpline",
        }),
      ]),
    ]);
  }

  if (item.title === "NGCP Pole Relocation Working Area") {
    item.actionsSections = new Collection([
      new Collection([
        new ActionButton({
          title: "Zoom to Area",
          icon: "zoom-in-fixed",
          id: "full-extent-ngcpworkarea",
        }),
      ]),
    ]);
  }

  if (item.title === "NGCP Pole Relocation Tagged Structures") {
    item.actionsSections = new Collection([
      new Collection([
        new ActionButton({
          title: "Zoom to Area",
          icon: "zoom-in-fixed",
          id: "full-extent-taggedstructure",
        }),
      ]),
    ]);

    highlightLot(ngcp_tagged_structureLayer, arcgisScene);
  }

  if (item.layer.type !== "group") {
    item.panel = {
      content: "legend",
      open: true,
    };
  }

  item.title === "Chainage" ||
  item.title === "Temporary Fencing" ||
  item.title === "Permanent Fencing" ||
  item.title === "Maintenance Road" ||
  item.title === "Drainage" ||
  item.title === "Provision for Freight Line" ||
  item.title === "Households" ||
  item.title === "Households Ownership (Structure)" ||
  item.title === "Occupancy (Structure)" ||
  item.title === "Structure" ||
  item.title === "NGCP Pole Relocation Working Area" ||
  item.title === "NGCP Pole Relocation Tagged Structures" ||
  item.title === "Land Acquisition (Endorsed Status)" ||
  item.title === "Super Urgent Lot" ||
  item.title === "Handed-Over (public + private)" ||
  item.title === "Tree Cutting & Compensation" ||
  item.title === "Point (symbol)" ||
  item.title === "Point (status)" ||
  item.title === "Line (symbol)" ||
  item.title === "Line (status)" ||
  item.title === "Pier Head/Column" ||
  item.title === "Viaduct" ||
  item.title === "MERALCO TSS 10" ||
  item.title === "Station Structures"
    ? (item.visible = false)
    : (item.visible = true);
}
