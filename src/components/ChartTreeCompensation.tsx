import { useEffect, useRef, useState, use, memo, useMemo } from "react";
import { treeCompensationLayer } from "../layers";
import { cp_f, treem_status_f, treem_status_q } from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { queryDefinitionExpression } from "../queryDefinition";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
import { fieldStatistic, thousands_separators } from "../query";

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

      const baseArgs = {
        layer: treeCompensationLayer,
        statisticField: "OBJECTID",
        statisticType: "count" as const,
      };

      const [chartData, totalTrees] = await Promise.all([
        await new ChartPieSeries({
          ...baseArgs,
          where: `${query.queryExpression()} AND ${treem_status_f} >= 1`,
          statusList: treem_status_q,
          statusField: treem_status_f,
        }).pieSeries(),

        fieldStatistic({
          ...baseArgs,
          where: `${query.queryExpression()} AND ${treem_status_f} >= 1`,
        }),
      ]);

      return { chartData, totalTrees };
    },
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

const ChartTreeCompensation = memo(() => {
  const { cpackage } = use(MyContext);

  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [_chartPanelwidth, setChartPanelwidth] = useState<any>();

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
  const totalTrees = thousands_separators(data?.totalTrees ?? 0);

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const renderRef = useRef<ChartPieSeriesRender | null>(null);
  const chartRef = useRef<unknown | any | undefined>({});
  const chartID = "chart-tree-compensation";

  const seriesScale = 220;
  const innerValueFontSize = "0.75rem";
  const innerLabelFontSize = "0.45em";

  //--- Keep click-handler-relevant values fresh without rebuilding the
  //    chart. view lives here too (not passed statically to the
  //    renderer) since arcgis-scene's view may not be ready on first
  //    mount.
  const configRef = useRef({
    qChart: q1,
    q2Expression: undefined,
    status_field: treem_status_f,
    view: arcgisScene?.view,
  });

  useEffect(() => {
    configRef.current = {
      qChart: q1,
      q2Expression: undefined,
      status_field: treem_status_f,
      view: arcgisScene?.view,
    };
  }, [data, treem_status_f, arcgisScene]);

  //--- Pie Chart Renderer - created ONCE (mount only)
  useEffect(() => {
    const root = rootSetter({ chartID: chartID });
    const chart = chartSetter({ root: root, centerY: 25, y: 10 });
    chartRef.current = chart;
    const pieSeries = seriesSetter({
      chart: chart,
      root: root,
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
      chart: chart,
      root: root,
      centerX: 50,
      x: 50,
      marginTop: -15,
    });
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    //--- NOTE: no `view` here — it's read live from configRef.current
    //    inside chartrender.ts, since arcgis-scene may not have a
    //    ready `.view` yet at this point.
    const renderer = new ChartPieSeriesRender({
      chart,
      pieSeries,
      legend,
      root,
      configRef,
      updateChartPanelwidth: setChartPanelwidth,
      data: [],
      seriesScale,
      innerValue: totalTrees,
      innerLabel: "TREES",
      innerLabelFontSize,
      innerValueFontSize,
      layer: treeCompensationLayer,
      statusArray: treem_status_q,
      bkg_color_switch: false,
      seriesFillHash: undefined,
    });
    renderRef.current = renderer;
    renderRef.current.chartDataRenderer();

    return () => {
      root.dispose();
      renderRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-once — do not add dependencies here

  //--- Push new data / inner value / affected-area figures into the
  //    already-mounted chart. No dispose, no rebuild -> no blink.
  //    NOTE: affectedAreaValue is NOT called here directly — it's
  //    registered once inside chartrender.ts and reads live data via
  //    closures, which updateData() keeps in sync. Calling it here on
  //    every render would both miss the first paint and stack
  //    duplicate adapters.
  useEffect(() => {
    if (!renderRef.current) return;
    renderRef.current.updateData(chartData, totalTrees, treem_status_q);
  }, [chartData, totalTrees, treem_status_q]);

  return (
    <div
      id={chartID}
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
