import * as am5 from "@amcharts/amcharts5";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import Query from "@arcgis/core/rest/support/Query";
import * as am5xy from "@amcharts/amcharts5/xy";
import { type StatusStateType, type StatusTypenamesType } from "./uniqueValues";

//--- Reset queryc
export function resetQuerc(queryc: any) {
  queryc.qExpression = undefined;
  queryc.q2Expression = undefined;
  queryc.status = undefined;
  queryc.statusField = undefined;
  queryc.chartCategory = undefined;
  queryc.chartCategoryField = undefined;
}

type layerViewQueryProps = {
  layer?: any;
  qExpression?: any;
  view: any;
  qChart?: any;
};

export const highlightFilterLayerView = async ({
  layer,
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

    //-- Reset query properties & remove highlight
    resetQuerc(qChart);
    highlightSelect && highlightSelect.remove();
  });
};

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

//--- Shared ArcGIS/query context
interface BaseQueryContext {
  layers: any;
  qChart: any;
  view: any;
  chartCategoryTypes: any;
  chartCategoryTypeField: any;
  statusArray: any;
  statusField: any;
}

//--- Core amCharts objects
interface ChartCore {
  root: any;
  chart: any;
  data: any;
}

//--- Status name lookups (arrays, used only at the top-level chart)
interface StatusNames {
  statusTypename: StatusTypenamesType[];
  statusStatename: StatusStateType[];
}

//--- Series visual styling
interface SeriesStyle {
  seriesStatusColor: any;
  strokeColor: any;
  strokeWidth: any;
}

//--- Axis/icon layout styling
interface AxisIconStyle {
  new_chartIconSize: any;
  new_axisFontSize: any;
  chartIconPositionX: any;
  chartPaddingRightIconLabel: any;
}

//---------------------------------------------------
// Composed interfaces
//---------------------------------------------------

interface chartColumnType
  extends BaseQueryContext, ChartCore, StatusNames, SeriesStyle, AxisIconStyle {
  legend: any;
  updateChartPanelwidth: any;
}

interface makeSeriesColumnType
  extends BaseQueryContext, ChartCore, SeriesStyle {
  statusType: string;
  statusState: string;
  xAxis: any;
  yAxis: any;
  legend: any;
  new_axisFontSize: any;
}

interface clickSeriesColumnType extends BaseQueryContext {
  series: any;
  statusState: any;
}

interface AxisRenderTypes extends ChartCore, AxisIconStyle {}

async function axisRender({
  root,
  data,
  chart,
  new_chartIconSize,
  chartIconPositionX,
  chartPaddingRightIconLabel,
  new_axisFontSize,
}: AxisRenderTypes) {
  const yRenderer = am5xy.AxisRendererY.new(root, {
    inversed: true,
  });

  //--- yAxis
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
    textAlign: "center",
    fill: am5.color("#ffffff"),
    fontSize: new_axisFontSize,
  });

  return { xAxis, yAxis };
}

export async function chartRendererColumn({
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
  view,
  new_chartIconSize,
  new_axisFontSize,
  chartIconPositionX,
  chartPaddingRightIconLabel,
  legend,
  updateChartPanelwidth,
}: chartColumnType) {
  //--- Axis Renderer
  const xyAxis = await axisRender({
    root,
    data,
    chart,
    new_chartIconSize,
    chartIconPositionX,
    chartPaddingRightIconLabel,
    new_axisFontSize,
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
        layers,
        root,
        chart,
        data,
        qChart,
        chartCategoryTypes,
        chartCategoryTypeField,
        statusType: statustype,
        statusState: statusStatename[index],
        statusArray,
        statusField,
        xAxis: xyAxis.xAxis,
        yAxis: xyAxis.yAxis,
        legend,
        new_axisFontSize,
        seriesStatusColor,
        strokeColor,
        strokeWidth,
        view,
      });
    });
}

//--- Chart series
export function makeSeriesColumn({
  layers,
  root,
  chart,
  data,
  qChart,
  chartCategoryTypes,
  chartCategoryTypeField,
  statusType,
  statusState,
  statusArray,
  statusField,
  xAxis,
  yAxis,
  legend,
  new_axisFontSize,
  seriesStatusColor,
  strokeColor,
  strokeWidth,
  view,
}: makeSeriesColumnType) {
  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: statusType,
      stacked: true,
      xAxis: xAxis,
      yAxis: yAxis,
      baseAxis: yAxis,
      valueXField: statusState,
      valueXShow: "valueXTotalPercent",
      categoryYField: "category",
      fill:
        statusState === "incomp"
          ? am5.color(seriesStatusColor[0])
          : statusState === "comp"
            ? am5.color(seriesStatusColor[3])
            : am5.color(seriesStatusColor[1]),
      stroke: am5.color(strokeColor),
    }),
  );

  series.columns.template.setAll({
    fillOpacity: statusState === "comp" ? 1 : 0.5,
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
          statusState === "incomp"
            ? ""
            : "{valueXTotalPercent.formatNumber('#.')}%", //"{valueX}",
        fill: root.interfaceColors.get("alternativeText"),
        opacity: statusState === "incomp" ? 0 : 1,
        fontSize: new_axisFontSize,
        centerY: am5.p50,
        centerX: am5.p50,
        populateText: true,
      }),
    });
  });

  // Click series
  clickSeriesColumn({
    layers,
    series,
    qChart,
    statusState,
    statusArray,
    view,
    chartCategoryTypes,
    chartCategoryTypeField,
    statusField,
  });

  legend.data.push(series);
}

//--- Click event on series
export function clickSeriesColumn({
  layers,
  series,
  qChart,
  statusState,
  statusArray,
  view,
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
      (item: any) => item.status === statusState,
    ).value;
    qChart.statusField = statusField;

    for (const layer of layers) {
      highlightFilterLayerView({
        layer: layer,
        view: view,
        qChart: qChart,
      });
    }
  });
}
