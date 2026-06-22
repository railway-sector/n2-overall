import * as am5 from "@amcharts/amcharts5";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Query from "@arcgis/core/rest/support/Query";
import * as am5xy from "@amcharts/amcharts5/xy";
import { type StatusStateType, type StatusTypenamesType } from "./uniqueValues";

// Dynamic chart size
export function responsiveChart(
  chart: any,
  pieSeries: any,
  legend: any,
  pieSeriesScale: any,
) {
  chart.onPrivate("width", (width: any) => {
    const availableSpace = width * 0.7; // original 0.7
    const new_fontSize = width / 29;
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

type layerViewQueryProps = {
  layer?: any;
  qExpression?: any;
  view: any;
  qChart?: any;
};

export const highlightFilterLayerView = async ({
  layer,
  // qExpression,
  view,
  qChart,
}: layerViewQueryProps) => {
  const query = layer.createQuery();
  const qe = qChart.queryExpression();
  query.where = qe;
  let highlightSelect: any;

  const layerView = await view?.whenLayerView(layer);
  const results = await layer?.queryObjectIds(query);

  const queryExt = new Query({ objectIds: results });
  const qExtResult = await layer?.queryExtent(queryExt);
  if (qExtResult?.extent) {
    view?.goTo(qExtResult.extent);
  }

  highlightSelect && highlightSelect.remove();
  highlightSelect = layerView.highlight(results);

  layerView.filter = new FeatureFilter({ where: qe });
  view?.on("click", () => {
    layerView.filter = new FeatureFilter({
      where: undefined,
    });
    qChart.qExpression = undefined;
    qChart.q2Expression = undefined;
    highlightSelect && highlightSelect.remove();
  });
};

interface chartType {
  chart: any;
  pieSeries: any;
  legend: any;
  root: any;
  qChart: any;
  q1Value?: any;
  q1Field?: any;
  q2Value?: any;
  q2Field?: any;
  q3Value?: any;
  q3Field?: any;
  q2Expression?: any;
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
  qChart,
  q2Expression,
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

    qChart.qExpression = queryField;
    qChart.q2Expression = q2Expression;

    highlightFilterLayerView({
      layer: layer,
      // qExpression: qChart.queryExpression(),
      view: arcgisScene?.view,
      qChart: qChart,
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
//    Column Chart (stacked)     //
//--------------------------------//
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

interface chartColumnType {
  layers: any;
  root: any;
  chart: any;
  data: any;
  qChart: any;
  chartCategoryTypes: any;
  chartCategoryTypeField: any;
  statusTypename: StatusTypenamesType[];
  statusStatename: StatusStateType[];
  statusArray: any;
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
  layers,
  root,
  chart,
  data,
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
      makeSeriesColumn({
        layers: layers,
        root: root,
        chart: chart,
        data: data,
        qChart: qChart,
        chartCategoryTypes: chartCategoryTypes,
        chartCategoryTypeField: chartCategoryTypeField,
        statusTypename: statustype,
        statusStatename: statusStatename[index],
        statusArray: statusArray,
        statusField: statusField,
        xAxis: xAxis,
        yAxis: yAxis,
        legend: legend,
        new_axisFontSize: new_axisFontSize,
        seriesStatusColor: seriesStatusColor,
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
        arcgisScene: arcgisScene,
      });
    });
}

//--- Chart series
interface makeSeriesColumnType {
  layers: any;
  root: any;
  chart: any;
  data: any;
  qChart: any;
  chartCategoryTypes: any;
  chartCategoryTypeField: any;
  statusTypename: any;
  statusStatename: any;
  statusArray: any;
  statusField: any;
  xAxis: any;
  yAxis: any;
  legend: any;
  new_axisFontSize: any;
  seriesStatusColor: any;
  strokeColor: any;
  strokeWidth: any;
  arcgisScene: any;
}

export function makeSeriesColumn({
  layers,
  root,
  chart,
  data,
  qChart,
  chartCategoryTypes,
  chartCategoryTypeField,
  statusTypename,
  statusStatename,
  statusArray,
  statusField,
  xAxis,
  yAxis,
  legend,
  new_axisFontSize,
  seriesStatusColor,
  strokeColor,
  strokeWidth,
  arcgisScene,
}: makeSeriesColumnType) {
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
    layers: layers,
    series: series,
    qChart: qChart,
    statusStatename: statusStatename,
    statusArray: statusArray,
    arcgisScene: arcgisScene,
    chartCategoryTypes: chartCategoryTypes,
    chartCategoryTypeField: chartCategoryTypeField,
    statusField: statusField,
  });

  legend.data.push(series);
}

interface clickSeriesColumnType {
  layers: any;
  series: any;
  qChart: any;
  statusStatename: any;
  statusArray: any;
  arcgisScene: any;
  chartCategoryTypes: any;
  chartCategoryTypeField: any;
  statusField: any;
}

//--- Click event on series
export function clickSeriesColumn({
  layers,
  series,
  qChart,
  statusStatename,
  statusArray,
  arcgisScene,
  chartCategoryTypes, // [{category: 'A', value: 3}]
  chartCategoryTypeField,
  statusField,
}: clickSeriesColumnType) {
  series.columns.template.events.on("click", (ev: any) => {
    const selected: any = ev.target.dataItem?.dataContext;
    const categorySelected = chartCategoryTypes.find(
      (emp: any) => emp.category === selected.category,
    ).value;
    qChart.chartCategory = categorySelected;
    qChart.chartCategoryType = "number";
    qChart.chartCategoryField = chartCategoryTypeField;
    qChart.status = statusArray.find(
      (item: any) => item.status === statusStatename,
    ).value;
    qChart.statusField = statusField;

    for (const layer of layers) {
      highlightFilterLayerView({
        layer: layer,
        view: arcgisScene?.view,
        qChart: qChart,
      });
    }
  });
}
