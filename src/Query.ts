/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unsafe-optional-chaining */
import type { StatusStateType } from "./uniqueValues";
import type { StatusTypenamesType } from "./uniqueValues";
import type { LayerNameType } from "./uniqueValues";
import { dateTable, lotLayer } from "./layers";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import * as am5 from "@amcharts/amcharts5";
import {
  lotHandedOverAreaField,
  lotHandedOverField,
  affectedAreaField,
  cpField,
} from "./uniqueValues";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Query from "@arcgis/core/rest/support/Query";
import * as am5xy from "@amcharts/amcharts5/xy";
import type SceneLayer from "@arcgis/core/layers/SceneLayer";

//--------------------------------//
//    Chart Parameters            //
//--------------------------------//

//---------- Column Chart (stacked)----//
export function responsiveChartColumn(chart: any, legend: any) {
  chart.onPrivate("width", (width: any) => {
    const availableSpace = width * 0.35; // original 0.7
    const new_fontSize = width / 35;

    legend.labels.template.setAll({
      fill: am5.color("#ffffff"),
      fontSize: new_fontSize,
    });

    legend.itemContainers.template.setAll({
      width: availableSpace,
      marginLeft: 5,
      marginRight: 5,
    });
  });
}

interface clickSeriesColumnType {
  layer: any;
  layer2?: any;
  layerName: any;
  series: any;
  contractcp: any;
  statusStatename: any;
  arcgisScene: any;
  typeArray: any;
  typeField: any;
  statusField: any;
}

//--- Click event on series
export function clickSeriesColumn({
  layer,
  layer2,
  layerName,
  series,
  contractcp,
  statusStatename,
  arcgisScene,
  typeArray, // [{category: 'A', value: 3}]
  typeField,
  statusField,
}: clickSeriesColumnType) {
  series.columns.template.events.on("click", (ev: any) => {
    const selected: any = ev.target.dataItem?.dataContext;
    const categorySelected: string = selected.category;
    const find = typeArray.find(
      (emp: any) => emp.category === categorySelected,
    );
    const typeSelected = find?.value;

    let selectedStatus;
    if (layerName === "utility") {
      selectedStatus = statusStatename === "comp" ? 1 : 0;
    } else {
      statusStatename === "comp"
        ? 4
        : statusStatename === "ongoing"
          ? 2
          : statusStatename === "delayed"
            ? 3
            : 1;
    }

    const expression_layer = queryExpression({
      contractcp: contractcp,
      type: typeSelected,
      typeField: typeField,
      status: selectedStatus,
      statusField: statusField,
    });

    highlightFilterLayerView({
      layer: layer,
      qExpression: expression_layer,
      view: arcgisScene?.view,
    });

    if (layer2) {
      highlightFilterLayerView({
        layer: layer2,
        qExpression: expression_layer,
        view: arcgisScene?.view,
      });
    }
  });
}

//--- Chart series
export function makeSeriesColumn(
  layer: any,
  layer2: any,
  layerName: any,
  root: any,
  chart: any,
  contractcp: any,
  data: any,
  typeArray: any,
  typeField: any,
  statusTypename: any,
  statusStatename: any,
  statusField: any,
  xAxis: any,
  yAxis: any,
  legend: any,
  new_axisFontSize: any,
  seriesStatusColor: any,
  strokeColor: any,
  strokeWidth: any,
  arcgisScene: any,
) {
  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: statusTypename,
      stacked: true,
      xAxis: xAxis,
      yAxis: yAxis,
      baseAxis: yAxis,
      valueXField: statusStatename,
      valueXShow: "valueXTotalPercent",
      categoryYField: "category",
      fill:
        statusStatename === "incomp"
          ? am5.color(seriesStatusColor[0])
          : statusStatename === "comp"
            ? am5.color(seriesStatusColor[3])
            : am5.color(seriesStatusColor[1]),
      stroke: am5.color(strokeColor),
    }),
  );

  series.columns.template.setAll({
    fillOpacity: statusStatename === "comp" ? 1 : 0.5,
    tooltipText: "{name}: {valueX}", // "{categoryY}: {valueX}",
    tooltipY: am5.percent(90),
    strokeWidth: strokeWidth,
  });
  series.data.setAll(data);

  series.appear();

  series.bullets.push(() => {
    return am5.Bullet.new(root, {
      sprite: am5.Label.new(root, {
        text:
          statusStatename === "incomp"
            ? ""
            : "{valueXTotalPercent.formatNumber('#.')}%", //"{valueX}",
        fill: root.interfaceColors.get("alternativeText"),
        opacity: statusStatename === "incomp" ? 0 : 1,
        fontSize: new_axisFontSize,
        centerY: am5.p50,
        centerX: am5.p50,
        populateText: true,
      }),
    });
  });

  // Click series
  clickSeriesColumn({
    layer: layer,
    layer2: layer2,
    layerName: layerName,
    series: series,
    contractcp: contractcp,
    statusStatename: statusStatename,
    arcgisScene: arcgisScene,
    typeArray: typeArray,
    typeField: typeField,
    statusField: statusField,
  });

  legend.data.push(series);
}

interface chartColumnType {
  layer: any;
  layer2?: any;
  layerName: LayerNameType;
  root: any;
  chart: any;
  data: any;
  typeArray: any;
  typeField: any;
  contractcp: any;
  statusTypename: StatusTypenamesType[];
  statusStatename: StatusStateType[];
  statusField: any;
  seriesStatusColor: any;
  strokeColor: any;
  strokeWidth: any;
  arcgisScene: any;
  new_chartIconSize: any;
  new_axisFontSize: any;
  chartIconPositionX: any;
  chartPaddingRightIconLabel: any;
  legend: any;
  updateChartPanelwidth: any;
}
export function chartRendererColumn({
  layer,
  layer2,
  layerName,
  root,
  chart,
  data,
  typeArray,
  typeField,
  contractcp,
  statusTypename,
  statusStatename,
  statusField,
  seriesStatusColor,
  strokeColor,
  strokeWidth,
  arcgisScene,
  new_chartIconSize,
  new_axisFontSize,
  chartIconPositionX,
  chartPaddingRightIconLabel,
  legend,
  updateChartPanelwidth,
}: chartColumnType) {
  // Axis Renderer
  const yRenderer = am5xy.AxisRendererY.new(root, {
    inversed: true,
  });

  //--- yAxix
  const yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "category",
      renderer: yRenderer,
      bullet: function (root: any, _axis: any, dataItem: any) {
        return am5xy.AxisBullet.new(root, {
          location: 0.5,
          sprite: am5.Picture.new(root, {
            width: new_chartIconSize,
            height: new_chartIconSize,
            centerY: am5.p50,
            centerX: am5.p50,
            x: chartIconPositionX,
            src: dataItem.dataContext.icon,
          }),
        });
      },
      tooltip: am5.Tooltip.new(root, {}),
    }),
  );

  yRenderer.labels.template.setAll({
    paddingRight: chartPaddingRightIconLabel,
  });

  yRenderer.grid.template.setAll({
    location: 1,
  });

  yAxis.get("renderer").labels.template.setAll({
    oversizedBehavior: "wrap",
    textAlign: "center",
    fill: am5.color("#ffffff"),
    //maxWidth: 150,
    fontSize: new_axisFontSize,
  });
  yAxis.data.setAll(data);

  //--- xAxix
  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      max: 100,
      strictMinMax: true,
      numberFormat: "#'%'",
      calculateTotals: true,
      renderer: am5xy.AxisRendererX.new(root, {
        strokeOpacity: 0,
        strokeWidth: 1,
        stroke: am5.color("#ffffff"),
      }),
    }),
  );

  xAxis.get("renderer").labels.template.setAll({
    //oversizedBehavior: "wrap",
    textAlign: "center",
    fill: am5.color("#ffffff"),
    //maxWidth: 150,
    fontSize: new_axisFontSize,
  });

  //--- Responsive Chart
  responsiveChartColumn(chart, legend);
  chart.onPrivate("width", (width: any) => {
    updateChartPanelwidth(width);
  });

  //--- Make Series
  statusTypename &&
    statusTypename.map((statustype: any, index: any) => {
      makeSeriesColumn(
        layer,
        layer2,
        layerName,
        root,
        chart,
        contractcp,
        data,
        typeArray,
        typeField,
        statustype,
        statusStatename[index],
        statusField,
        xAxis,
        yAxis,
        legend,
        new_axisFontSize,
        seriesStatusColor,
        strokeColor,
        strokeWidth,
        arcgisScene,
      );
    });
}

//---------- Pier Chart -----------//
// Dynamic chart size
export function responsiveChart(
  chart: any,
  pieSeries: any,
  legend: any,
  pieSeriesScale: any,
) {
  chart.onPrivate("width", (width: any) => {
    const availableSpace = width * 0.7; // original 0.7
    const new_fontSize = width / 32;
    const new_pieSeries_scale = width / pieSeriesScale;
    const new_legendMarkerSize = width * 0.045;

    legend.labels.template.setAll({
      width: availableSpace,
      maxWidth: availableSpace,
      fontSize: new_fontSize,
    });

    legend.valueLabels.template.setAll({
      fontSize: new_fontSize,
    });

    legend.markers.template.setAll({
      width: new_legendMarkerSize,
      height: new_legendMarkerSize,
    });

    pieSeries.animate({
      key: "scale",
      to: new_pieSeries_scale,
      duration: 100,
    });
  });
}

interface layerViewQueryType {
  layer?: [FeatureLayer?, FeatureLayer?, SceneLayer?] | any;
  qExpression?: any;
  view: any;
}

export const highlightFilterLayerView = ({
  layer,
  qExpression,
  view,
}: layerViewQueryType) => {
  const query = layer.createQuery();
  query.where = qExpression;
  let highlightSelect: any;

  view?.whenLayerView(layer).then((layerView: any) => {
    layer?.queryObjectIds(query).then((results: any) => {
      const objID = results;

      const queryExt = new Query({
        objectIds: objID,
      });
      layer?.queryExtent(queryExt).then((result: any) => {
        if (result?.extent) {
          view?.goTo(result.extent);
        }
      });

      highlightSelect && highlightSelect.remove();
      highlightSelect = layerView.highlight(objID);
    });

    layerView.filter = new FeatureFilter({
      where: qExpression,
    });

    // For initial state, we need to add this
    view?.on("click", () => {
      layerView.filter = new FeatureFilter({
        where: undefined,
      });
      highlightSelect && highlightSelect.remove();
    });
  });
};

interface chartType {
  chart: any;
  pieSeries: any;
  legend: any;
  root: any;
  contractcp: any;
  status_field: any;
  arcgisScene: any;
  updateChartPanelwidth: any;
  data: any;
  pieSeriesScale: any;
  pieInnerLabel?: any;
  pieInnerLabelFontSize?: any;
  pieInnerValueFontSize?: any;
  layer: FeatureLayer;
  statusArray: any;
}
export function chartRenderer({
  chart,
  pieSeries,
  legend,
  root,
  contractcp,
  status_field,
  arcgisScene,
  updateChartPanelwidth,
  data,
  pieSeriesScale,
  pieInnerLabel,
  pieInnerLabelFontSize,
  pieInnerValueFontSize,
  layer,
  statusArray,
}: chartType) {
  // values inside a donut
  let inner_label = pieSeries.children.push(
    am5.Label.new(root, {
      text: `[#ffffff]{valueSum}[/]\n[fontSize: ${pieInnerLabelFontSize}; #d3d3d3; verticalAlign: super]${pieInnerLabel}[/]`,
      // text: "[#ffffff]{valueSum}[/]\n[fontSize: 0.45em; #d3d3d3; verticalAlign: super]PRIVATE LOTS[/]",
      fontSize: `${pieInnerValueFontSize}`,
      centerX: am5.percent(50),
      centerY: am5.percent(40),
      populateText: true,
      oversizedBehavior: "fit",
      textAlign: "center",
    }),
  );

  pieSeries.onPrivate("width", (width: any) => {
    inner_label.set("maxWidth", width * 0.7);
  });

  // Set slice opacity and stroke color
  pieSeries.slices.template.setAll({
    toggleKey: "none",
    fillOpacity: 0.9,
    stroke: am5.color("#ffffff"),
    strokeWidth: 0.5,
    strokeOpacity: 1,
    templateField: "sliceSettings",
    tooltipText: '{category}: {valuePercentTotal.formatNumber("#.")}%',
  });

  // Disabling labels and ticksll
  pieSeries.labels.template.set("visible", false);
  pieSeries.ticks.template.set("visible", false);

  // EventDispatcher is disposed at SpriteEventDispatcher...
  // It looks like this error results from clicking events
  pieSeries.slices.template.events.on("click", (ev: any) => {
    const Selected: any = ev.target.dataItem?.dataContext;
    const Category = Selected.category;
    const find = statusArray.find((emp: any) => emp.category === Category);
    const statusSelected = find?.value;
    const isStringOrNumber = typeof statusSelected === "number";
    const queryField = isStringOrNumber
      ? `${status_field} = ${statusSelected}`
      : `${status_field} = '${statusSelected}'`;

    const qExpression = queryExpression({
      contractcp: contractcp,
      queryField: queryField,
    });

    highlightFilterLayerView({
      layer: layer,
      qExpression: qExpression,
      view: arcgisScene?.view,
    });
  });

  pieSeries.data.setAll(data);

  // Disabling labels and ticksll
  pieSeries.labels.template.setAll({
    visible: false,
    scale: 0,
  });

  // pieSeries.labels.template.set('visible', true);
  pieSeries.ticks.template.setAll({
    visible: false,
    scale: 0,
  });

  // Legend
  // Change the size of legend markers
  legend.markers.template.setAll({
    width: 17,
    height: 17,
  });

  // Change the marker shape
  legend.markerRectangles.template.setAll({
    cornerRadiusTL: 10,
    cornerRadiusTR: 10,
    cornerRadiusBL: 10,
    cornerRadiusBR: 10,
  });

  responsiveChart(chart, pieSeries, legend, pieSeriesScale);
  chart.onPrivate("width", (width: any) => {
    updateChartPanelwidth(width);
  });

  // Change legend labelling properties
  // To have responsive font size, do not set font size
  legend.labels.template.setAll({
    oversizedBehavior: "truncate",
    fill: am5.color("#ffffff"),
  });

  legend.valueLabels.template.setAll({
    textAlign: "right",
    fill: am5.color("#ffffff"),
  });

  legend.itemContainers.template.setAll({
    paddingTop: 3,
    paddingBottom: 1,
  });

  pieSeries.appear(1000, 100);
}

//--------------------------------//
//    queryExpression             //
//--------------------------------//
interface queryExpressionType {
  contractcp: string;
  type?: number;
  typeField?: any;
  status?: number;
  statusField?: any;
  queryField?: any;
}
export function queryExpression({
  contractcp,
  type,
  typeField,
  status,
  statusField,
  queryField,
}: queryExpressionType) {
  const cp_query = `${cpField} = '${contractcp}'`;
  const type_query = `${typeField} = ${type}`;
  const status_query = `${statusField} = ${status}`;

  // With queryField
  const cptypeQuery = `${cp_query} AND ${type_query} AND ${queryField}`;
  const cptypestatusQuery = `${cp_query} AND ${type_query} AND ${status_query} AND ${queryField}`;

  // Without queryField
  const cptype = `${cp_query} AND ${type_query}`;
  const cptypestatus = `${cp_query} AND ${type_query} AND ${status_query}`;

  let expression = "";

  if (queryField) {
    if (contractcp === "All" && !type && !status) {
      expression = "1=1" + " AND " + queryField;
    } else if (contractcp && !type && !status) {
      expression = cp_query + " AND " + queryField;
    } else if (contractcp && type && !status) {
      expression = cptypeQuery;
    } else if (contractcp && type && status) {
      expression = cptypestatusQuery;
    }
  } else {
    if (contractcp === "All" && !type && !status) {
      expression = "1=1";
    } else if (contractcp && !type && !status) {
      expression = cp_query;
    } else if (contractcp && type && !status) {
      expression = cptype;
    } else if (contractcp && type && status) {
      expression = cptypestatus;
    }
  }
  return expression;
}

//---------------------------------------------------------//
//    Definition Expression using queryExpression          //
//---------------------------------------------------------//
interface queryDefinitionExpressionType {
  queryExpression?: string;
  featureLayer?:
    | [FeatureLayer, FeatureLayer?, FeatureLayer?, FeatureLayer?, FeatureLayer?]
    | any;
}

export function queryDefinitionExpression({
  queryExpression,
  featureLayer,
}: queryDefinitionExpressionType) {
  if (queryExpression) {
    if (featureLayer) {
      if (Array.isArray(featureLayer)) {
        featureLayer.forEach((layer) => {
          if (layer) {
            layer.definitionExpression = queryExpression;
          }
        });
      } else {
        featureLayer.definitionExpression = queryExpression;
      }
    }
  }
}

//---------------------------------------------//
//           Pie Chart Data Generation         //
//---------------------------------------------//
interface pieChartStatusDataType {
  contractcp: string;
  layer: any;
  statusList?: any;
  statusColor?: any;
  statusField?: any;
  idField?: any;
  valueSumField?: any;
  queryField?: any;
}
export async function pieChartStatusData({
  contractcp,
  layer,
  statusList,
  statusColor,
  statusField,
}: pieChartStatusDataType) {
  //--- Main statistics
  const statsCollect = new StatisticDefinition({
    onStatisticField: statusField,
    outStatisticFieldName: "statsCollect",
    statisticType: "count",
  });

  //--- Query
  const query = new Query();
  query.outStatistics = [statsCollect];

  const expression = queryExpression({
    contractcp: contractcp,
  });
  query.where = expression;
  queryDefinitionExpression({
    queryExpression: expression,
    featureLayer: [layer],
  });
  query.orderByFields = [statusField];
  query.groupByFieldsForStatistics = [statusField];

  //--- Query features using statistics definitions
  let total_count = 0;
  return layer?.queryFeatures(query).then(async (response: any) => {
    const stats = response.features;
    const data = stats.map((result: any) => {
      const attributes = result.attributes;
      total_count += attributes.statsCollect;
      const statusName = attributes[statusField];

      //--- Check if attributes[statusField] is numeric or string
      //--- This correctly accounts for a case where status in the attribute table is not number,
      const isStringOrNumber = typeof statusName === "number";

      return Object.assign({
        category: isStringOrNumber ? statusList[statusName - 1] : statusName,
        value: attributes.statsCollect,
      });
    });

    //--- Account for zero count
    const data0 = statusList.map((status: any, index: any) => {
      const find = data.find((emp: any) => emp.category === status);
      const value = find === undefined ? 0 : find?.value;
      return Object.assign({
        category: status,
        value: value,
        sliceSettings: {
          fill: am5.color(statusColor[index]),
        },
      });
    });
    return [data0, total_count];
  });
}

export async function totalFieldCount({
  contractcp,
  layer,
  idField,
  queryField,
}: pieChartStatusDataType) {
  const statsCollect = new StatisticDefinition({
    onStatisticField: idField,
    outStatisticFieldName: "statsCollect",
    statisticType: "count",
  });

  //--- Query
  const query = new Query();
  query.outStatistics = [statsCollect];
  query.where = queryExpression({
    contractcp: contractcp,
    queryField: queryField,
  });

  return layer?.queryFeatures(query).then((response: any) => {
    return response.features[0].attributes.statsCollect;
  });
}

export async function totalFieldSum({
  contractcp,
  layer,
  valueSumField,
  queryField,
}: pieChartStatusDataType) {
  const statsCollect = new StatisticDefinition({
    onStatisticField: valueSumField,
    outStatisticFieldName: "statsCollect",
    statisticType: "sum",
  });

  //--- Query
  const query = new Query();
  query.outStatistics = [statsCollect];
  query.where = queryExpression({
    contractcp: contractcp,
    queryField: queryField,
  });

  return layer?.queryFeatures(query).then((response: any) => {
    return response.features[0].attributes.statsCollect;
  });
}

//---------------------------------------------//
//     Column Serie Chart Data Generation      //
//---------------------------------------------//
interface chartDataColumnSeriesType {
  contractp: any;
  typeList: any;
  typeField: any;
  layer: any;
  statusstate: any;
  statusField: any;
  layerName: LayerNameType;
}
export async function chartDataColumnSries({
  contractp,
  typeList,
  typeField,
  layer,
  statusstate,
  statusField,
  layerName,
}: chartDataColumnSeriesType) {
  //--- types: include 'others'. Each main type may have others (types = 0)
  const compile: any = [];

  //--- Main statistics
  typeList.map((type: any) => {
    statusstate.map((status: any) => {
      const temp = new StatisticDefinition({
        onStatisticField: `CASE WHEN (${typeField} = ${type.value} and ${statusField} = ${status}) THEN 1 ELSE 0 END`,
        outStatisticFieldName: `stats${type.value}${status}`,
        statisticType: "sum",
      });
      compile.push(temp);
    });
  });

  //--- Query
  const query = new Query();
  query.outStatistics = compile;

  const expression = queryExpression({
    contractcp: contractp,
  });
  query.where = expression;
  queryDefinitionExpression({
    queryExpression: expression,
    featureLayer: [layer],
  });

  //--- Query features using statistics definitions
  let total_comp = 0;
  let total_all = 0;
  const qStats = layer?.queryFeatures(query).then(async (response: any) => {
    const stats = response.features;
    return typeList.map((type: any, index: any) => {
      if (layerName === "utility") {
        const comp = stats[0].attributes[`stats${type.value}${1}`];
        const incomp = stats[0].attributes[`stats${type.value}${0}`];

        total_comp += comp; //
        total_all += comp + incomp;

        return Object.assign({
          category: typeList[index].category,
          comp: comp,
          incomp: incomp,
          icon: typeList[index].icon,
        });
      } else if (layerName === "viaduct") {
        const comp = stats[0].attributes[`stats${type.value}${4}`];
        const incomp = stats[0].attributes[`stats${type.value}${1}`];
        const ongoing = stats[0].attributes[`stats${type.value}${2}`];

        total_comp += comp; //
        total_all += comp + incomp;

        return Object.assign({
          category: typeList[index].category,
          comp: comp,
          incomp: incomp,
          ongoing: ongoing,
          icon: typeList[index].icon,
        });
      }
    });
  });
  const data = await qStats;
  const percent_comp = ((total_comp / total_all) * 100).toFixed(0);

  return [data, total_comp, total_all, percent_comp];
}

//--------------------------------//
//    As of Date function         //
//--------------------------------//
// get last date of month
export function lastDateOfMonth(date: Date) {
  const old_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const year = old_date.getFullYear();
  const month = old_date.getMonth() + 1;
  const day = old_date.getDate();
  const final_date = `${year}-${month}-${day}`;

  return final_date;
}

// Updat date
export async function dateUpdate(category: any) {
  const query = dateTable.createQuery();
  const queryExpression =
    "project = 'N2'" + " AND " + "category = '" + category + "'";
  query.where = queryExpression; // "project = 'N2'" + ' AND ' + "category = 'Land Acquisition'";

  return dateTable.queryFeatures(query).then((response: any) => {
    const stats = response.features;
    const dates = stats.map((result: any) => {
      // get today and date recorded in the table
      const today = new Date();
      const date = new Date(result.attributes.date);

      // Calculate the number of days passed since the last update
      const time_passed = today.getTime() - date.getTime();
      const days_passed = Math.round(time_passed / (1000 * 3600 * 24));

      const year = date.getFullYear();
      const month = date.toLocaleString("en-US", {
        month: "long",
      });
      const day = date.getDate();
      const as_of_date = year < 1990 ? "" : `${month} ${day}, ${year}`;
      return [as_of_date, days_passed, date];
    });
    return dates;
  });
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

//---------------------------------------------//
//                  Other Tools                //
//---------------------------------------------//
export function highlightRemove() {
  if (highlight) {
    highlight.remove();
  }
}

// Thousand separators function
export function thousands_separators(num: any) {
  if (num) {
    const num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  } else {
    return 0;
  }
}
// Zoom to Layer
// const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
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
