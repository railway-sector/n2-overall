import { useEffect, useRef, useState, use, memo, useMemo } from "react";
import { treeCuttingLayer } from "../layers";
import { thousands_separators, dateUpdate, fieldStatistic } from "../query";
import {
  cp_f,
  primaryLabelColor,
  treec_status_f,
  treec_status_q,
  valueLabelColor,
} from "../uniqueValues";
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

//--------------------------//
//      useTreeData         //
//--------------------------//
function useTreeData(cpackage: any, query: any) {
  return useQuery<ChartResponse | any>({
    queryKey: [cpackage, treec_status_f, treeCuttingLayer],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: query.queryExpression(),
        featureLayer: [treeCuttingLayer],
      });

      const baseArgs = {
        layer: treeCuttingLayer,
        statisticField: "OBJECTID",
        statisticType: "count" as const,
      };

      const [chartData, totalNumber, totalTrees] = await Promise.all([
        new ChartPieSeries({
          ...baseArgs,
          where: `${query.queryExpression()} AND ${treec_status_f} >= 1`,
          statusList: treec_status_q,
          statusField: treec_status_f,
        }).pieSeries(),

        fieldStatistic({ ...baseArgs, where: query.queryExpression() }),
        fieldStatistic({
          ...baseArgs,
          where: `${query.queryExpression()} AND ${treec_status_f} >= 1`,
        }),
      ]);

      return { chartData, totalNumber, totalTrees };
    },
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

const ChartTreeCutting = memo(() => {
  const { cpackage } = use(MyContext);

  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();

  //--- As of date
  const { data: asofdate = "" } = useQuery({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate("Trees"),
    staleTime: Infinity,
  });

  //--- Query expression
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
  const totalNumber = data?.totalNumber ?? 0;
  const totalTrees = thousands_separators(data?.totalTrees ?? 0);

  // ************************************
  //  Responsive Chart parameters
  // ***********************************
  const fontSize = chartPanelwidth ? chartPanelwidth / 22.3 : 0;
  const valueSize = chartPanelwidth / 19;
  const imageSize = chartPanelwidth ? chartPanelwidth * 0.03 : 0;
  const asofDateSize = chartPanelwidth ? chartPanelwidth * 0.032 : 0;
  const seriesScale = 220;
  const innerValueFontSize = "0.75rem";
  const innerLabelFontSize = "0.45em";

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const renderRef = useRef<ChartPieSeriesRender | null>(null);
  const chartID = "pie-cut";

  //--- Keep click-handler-relevant values fresh without rebuilding the
  //    chart. view lives here too (not passed statically to the
  //    renderer) since arcgis-scene's view may not be ready on first
  //    mount.
  const configRef = useRef({
    qChart: q1,
    q2Expression: undefined,
    status_field: treec_status_f,
    view: arcgisScene?.view,
  });

  useEffect(() => {
    configRef.current = {
      qChart: q1,
      q2Expression: undefined,
      status_field: treec_status_f,
      view: arcgisScene?.view,
    };
  }, [data, treec_status_f, arcgisScene]);

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
      layer: treeCuttingLayer,
      statusArray: treec_status_q,
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
    renderRef.current.updateData(chartData, totalTrees, treec_status_q);
  }, [chartData, totalTrees, treec_status_q]);

  return (
    <>
      <div
        style={{
          display: "flex",
          marginLeft: "15px",
          marginRight: "15px",
          justifyContent: "space-between",
          marginBottom: "0px",
        }}
      >
        <img
          src="https://EijiGorilla.github.io/Symbols/Tree_Logo.svg"
          alt="Land Logo"
          height={`${imageSize}%`}
          width={`${imageSize}%`}
          style={{ paddingTop: "5px", paddingLeft: "15px" }}
        />
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{
              color: primaryLabelColor,
              fontSize: `${fontSize}px`,
              marginRight: "35px",
            }}
          >
            TOTAL TREES
          </dt>
          <dd
            style={{
              color: valueLabelColor,
              fontSize: `${valueSize}px`,
              fontWeight: "bold",
              fontFamily: "calibri",
              lineHeight: "1.2",
              margin: "auto",
              opacity: isLoading ? 0 : 1,
            }}
          >
            {thousands_separators(totalNumber)}
          </dd>
        </dl>
      </div>

      <div
        style={{
          color: "gray",
          fontSize: `${asofDateSize}px`,
          float: "right",
          marginRight: "5px",
        }}
      >
        {asofdate ? `As of ${asofdate}` : `As of `}
      </div>

      <div
        id={chartID}
        style={{
          height: "35vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>
    </>
  );
});

export default ChartTreeCutting;
