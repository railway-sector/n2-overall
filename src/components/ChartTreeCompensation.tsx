import { useEffect, useRef, useState, use, memo, useMemo } from "react";
import { treeCompensationLayer } from "../layers";
import { cp_f, treem_status_f, treem_status_q } from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { queryDefinitionExpression } from "../queryDefinition";
import { useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import {
  chartSetter,
  legendSetter,
  rootSetter,
  seriesSetter,
} from "../chartSetter";
import ChartPieSeriesRender from "chart-pie-series-render";
import ChartPieSeries from "chart-pie-series";
import QueryExpressionLayers from "query-layers-expression";

const CHART_ID = "pie-compen";
const SERIES_SCALE = 220;
const INNER_VALUE_FONT_SIZE = "0.75rem";
const INNER_LABEL_FONT_SIZE = "0.45em";

//--------------------------//
//      useTreeData         //
//--------------------------//
function useTreeData(cpackage: any, query: any) {
  return useQuery<ChartResponse | any>({
    queryKey: [cpackage, treem_status_q, treeCompensationLayer],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: query.queryExpression(),
        featureLayer: [treeCompensationLayer],
      });

      const chartData = await new ChartPieSeries({
        layer: treeCompensationLayer,
        statisticField: "OBJECTID",
        statisticType: "count" as const,
        where: `${query.queryExpression()} AND ${treem_status_f} >= 1`,
        statusList: treem_status_q,
        statusField: treem_status_f,
      }).pieSeries();

      return { chartData };
    },
  });
}

const ChartTreeCompensation = memo(() => {
  const [, setChartPanelwidth] = useState<any>();
  const { cpackage } = use(MyContext);

  const q1 = useMemo(
    () =>
      new QueryExpressionLayers({
        qFields: [cp_f],
        qValues: [cpackage === "All" ? undefined : cpackage],
      }),
    [cpackage],
  );

  const { data, isLoading } = useTreeData(cpackage, q1);
  const chartData = data?.chartData ?? [];

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});

  useEffect(() => {
    const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
    const root = rootSetter({ chartID: CHART_ID });
    const chart = chartSetter({ root });
    chartRef.current = chart;

    const pieSeries = seriesSetter({
      chart,
      root,
      categoryField: "category",
      valueField: "value",
      legendLabelText: "{category}",
      legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
      radius: 45,
      innerRadius: 28,
      scale: 2,
    });
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    const legend = legendSetter({
      chart,
      root,
      centerX: 50,
      x: 50,
      marginTop: -15,
    });
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    new ChartPieSeriesRender({
      chart,
      pieSeries,
      legend,
      root,
      qChart: q1,
      q2Expression: undefined,
      status_field: treem_status_f,
      view: arcgisScene?.view,
      updateChartPanelwidth: setChartPanelwidth,
      data: chartData,
      seriesScale: SERIES_SCALE,
      innerLabel: "TREES",
      innerLabelFontSize: INNER_LABEL_FONT_SIZE,
      innerValueFontSize: INNER_VALUE_FONT_SIZE,
      layer: treeCompensationLayer,
      statusArray: treem_status_q,
      bkg_color_switch: false,
      seriesFillHash: undefined,
    }).chartDataRenderer();

    pieSeries.data.setAll(chartData);
    legend.data.setAll(pieSeries.dataItems);

    return () => root.dispose();
  }, [chartData]);

  return (
    <div
      id={CHART_ID}
      style={{
        height: "34vh",
        backgroundColor: "rgb(0,0,0,0)",
        color: "white",
        opacity: isLoading ? 0 : 1,
      }}
    ></div>
  );
});

export default ChartTreeCompensation;
