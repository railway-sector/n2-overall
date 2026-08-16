/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unsafe-optional-chaining */

import { dateTable } from "./layers";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import { cp_f } from "./uniqueValues";
import type { statisticsType } from "./interfaceKeys";
import Query from "@arcgis/core/rest/support/Query";

//---------------------------------------------------------//
//                 Add Layers to Map                      //
//---------------------------------------------------------//
export function addLayersToMap(map: any, layersList: any[]) {
  layersList.forEach((layer: any) => {
    map.add(layer);
  });
}

//--- Separate calculation
interface FieldStatisticType {
  where: any;
  layer: any;
  statisticField: any;
  statisticType: statisticsType;
}

export async function fieldStatistic({
  where,
  layer,
  statisticField,
  statisticType,
}: FieldStatisticType) {
  //--- Query
  const query = new Query({
    where: where,
    outStatistics: [
      new StatisticDefinition({
        onStatisticField: statisticField,
        outStatisticFieldName: "statsCollect",
        statisticType,
      }),
    ],
  });

  const response = await layer?.queryFeatures(query);
  return response.features[0].attributes.statsCollect;
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
  const query = new Query({
    where: `project = 'N2' AND category = '${category}'`,
    outFields: ["project", "category", "date"],
  });

  const { features } = await dateTable.queryFeatures(query);
  return features.map(({ attributes }: any) => {
    const asofdate = toAsofdate(new Date(attributes.date));

    return asofdate;
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
  const outStatistics = [
    new StatisticDefinition({
      onStatisticField: aa_field,
      outStatisticFieldName: "aa",
      statisticType: "sum",
    }),
    new StatisticDefinition({
      onStatisticField: hoa_field,
      outStatisticFieldName: "hoa",
      statisticType: "sum",
    }),
  ];
  return await Promise.all(
    cp_list.map(async (cp: any) => {
      const query = new Query({
        where: `CP = '${cp}' AND ${cp_f} IS NOT NULL`,
        outStatistics: outStatistics,
      });

      const response = await layer?.queryFeatures(query);
      const { aa, hoa } = response.features[0].attributes;
      const value = aa ? ((hoa / aa) * 100).toFixed(0) : 0;

      return { category: cp, value };
    }),
  );
}

//---------------------------------------------//
//                  Highlight Lot              //
//---------------------------------------------//
let highlight: any;
export async function highlightLot({
  layer,
  view,
  qe,
}: {
  layer: any;
  view: any;
  qe?: any;
}) {
  const query = new Query({
    where: qe ?? "",
  });

  const [layerView, results] = await Promise.all([
    view?.whenLayerView(layer),
    layer?.queryObjectIds(query),
  ]);

  highlight?.remove();
  highlight = layerView && layerView.highlight(results);
}

export function highlightRemove() {
  highlight?.remove();
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
