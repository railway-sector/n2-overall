import { useEffect, useRef, useState, use, memo, useMemo } from "react";
import { utilityPointLayer, utilityPointLayer1 } from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { dateUpdate, thousands_separators } from "../query";
import {
  cp_f,
  primaryLabelColor,
  util_status_f,
  util_status_q,
  util_type_f,
  util_types,
  valueLabelColor,
  viastatus_q,
} from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { queryDefinitionExpression } from "../queryDefinition";
import { legendSetter, rootSetter } from "../chartSetter";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import ChartStackColumnRender from "chart-stack-column-render";
import ChartStackColumns from "chart-stack-column";
import QueryExpressionLayers from "query-layers-expression";

const chartID = "utility-point-bar";

// Static chart layout — doesn't depend on props/state, so keep it out of the component
const CHART_LAYOUT = {
  marginTop: 0,
  marginLeft: 0,
  marginRight: 0,
  marginBottom: 0,
  paddingTop: 10,
  paddingLeft: 5,
  paddingRight: 5,
  paddingBottom: 0,
} as const;

const CHART_BORDER_COLOR = "#00c5ff";
const CHART_BORDER_WIDTH = 0.4;
const CHART_ICON_POSITION_X = undefined;
const CHART_PADDING_RIGHT_ICON_LABEL = 25;

//-----------------------//
//     usetUtilityData   //
//-----------------------//
function useUtilityData(cpackage: string, query: any) {
  return useQuery<ChartResponse | any>({
    queryKey: [
      cpackage,
      utilityPointLayer,
      utilityPointLayer1,
      util_status_f,
      query,
    ],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: query.queryExpression(),
        featureLayer: [utilityPointLayer, utilityPointLayer1],
      });

      //--- chart data
      const chartData = await new ChartStackColumns({
        where: query,
        categoryTypes: util_types,
        categoryTypeField: util_type_f,
        layers: [utilityPointLayer],
        statusField: util_status_f,
        statusState: [0, 2, 3, 1],
      }).chartDataStackColumns();

      return { chartData };
    },
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Draw chart
const ChartUtilityPoint = memo(() => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const { cpackage, utilityLinestats } = use(MyContext);

  //--- As of date
  const { data: date } = useQuery({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate("Utility Relocation"),
    staleTime: Infinity,
  });
  const asofdate = date ?? "";

  //--- Query Expression
  const q1 = useMemo(
    () =>
      new QueryExpressionLayers({
        qFields: [cp_f],
        qValues: [cpackage === "All" ? undefined : cpackage],
      }),
    [cpackage],
  );

  const { data, isLoading } = useUtilityData(cpackage, q1);
  const chartData = data?.chartData?.[0] ?? [];

  //--- Progress stats
  const { totalComp, percComp } = useMemo(() => {
    if (!data?.chartData) return { totalComp: 0, percComp: 0 };
    const totalComp = data.chartData[3] + utilityLinestats[3];
    const totaln = data.chartData[1] + utilityLinestats[1];
    return {
      totalComp,
      percComp: ((totalComp / totaln) * 100).toFixed(0),
    };
  }, [data, utilityLinestats]);

  const legendRef = useRef<unknown | any | undefined>({});
  const rendererRef = useRef<ChartStackColumnRender | null>(null);
  const chartRef = useRef<unknown | any | undefined>({});

  const fontSize = chartPanelwidth / 20;
  const valueSize = fontSize * 1.55;
  const chartIconSize = chartPanelwidth * 0.06;
  const axisFontSize = chartPanelwidth * 0.03;
  const asofDateSize = chartPanelwidth * 0.03;

  //--- Keep click-handler-relevant values fresh without rebuilding the
  //    chart. view lives here too (not passed statically to the
  //    renderer) since arcgis-scene's view may not be ready on first
  //    mount.
  const configBaseArgs = {
    revit: false,
    layers: [utilityPointLayer, utilityPointLayer1],
    buildingLayer: undefined,
    chartCategoryTypeField: util_type_f,
    where: q1,
    status_field: util_status_f,
    view: arcgisScene?.view,
  };

  const configRef = useRef({ ...configBaseArgs });
  useEffect(() => {
    configRef.current = { ...configBaseArgs };
  }, [data, util_status_f, arcgisScene]);

  //---  Column Chart Renderer — created ONCE (mount only)
  useEffect(() => {
    const root = rootSetter({ chartID: chartID });
    root.setThemes([]);
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        ...CHART_LAYOUT,
        scale: 1,
        height: am5.percent(100),
      }),
    );
    chartRef.current = chart;

    const legend = legendSetter({
      chart: chart,
      root: root,
      centerX: 50,
      centerY: 50,
      x: 60,
      y: 97,
      marginTop: 20,
      layout: root.horizontalLayout,
    });
    legendRef.current = legend;
    legend.set("forceHidden", true);

    //--- NOTE: no `view` here — it's read live from configRef.current
    //    inside chartrender.ts, since arcgis-scene may not have a
    //    ready `.view` yet at this point.
    const renderer = new ChartStackColumnRender({
      root,
      chart,
      data: [],
      configRef,
      chartCategoryTypes: util_types,
      statusTypename: ["Completed", "To be Constructed"], //["Completed", "To be Constructed", "Under Construction"],
      statusStatename: ["comp", "incomp"], //["comp", "incomp", "ongoing"],
      statusArray: util_status_q,
      seriesStatusColor: viastatus_q.map((c: any) => c.color),
      strokeColor: CHART_BORDER_COLOR,
      strokeWidth: CHART_BORDER_WIDTH,
      chartIconSize,
      axisFontSize,
      chartIconPositionX: CHART_ICON_POSITION_X,
      chartPaddingRightIconLabel: CHART_PADDING_RIGHT_ICON_LABEL,
      legend,
      updateChartPanelwidth: setChartPanelwidth,
    });
    rendererRef.current = renderer;
    renderer.chartRendererColumn();

    return () => {
      root.dispose();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //--- Push new data / inner value / affected-area figures into the
  //    already-mounted chart. No dispose, no rebuild -> no blink.
  //    NOTE: affectedAreaValue is NOT called here directly — it's
  //    registered once inside chartrender.ts and reads live data via
  //    closures, which updateData() keeps in sync. Calling it here on
  //    every render would both miss the first paint and stack
  //    duplicate adapters.
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !chartPanelwidth) return; // wait for a real width

    //--- Sizes are captured at construction, so refresh them here
    renderer.chartIconSize = chartIconSize;
    renderer.axisFontSize = axisFontSize;

    renderer.updateData(chartData);
  }, [chartData, chartPanelwidth]);

  return (
    <>
      <div
        style={{
          display: "flex",
          marginLeft: "15px",
          marginRight: "15px",
          justifyContent: "space-between",
        }}
      >
        <img
          src="https://EijiGorilla.github.io/Symbols/Utility_Logo.png"
          alt="Land Logo"
          height={`65px`}
          width={`65px`}
          style={{ paddingTop: "3px", paddingLeft: "15px" }}
        />
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{
              color: primaryLabelColor,
              fontSize: `${fontSize}px`,
              marginRight: "35px",
            }}
          >
            TOTAL PROGRESS
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
            {thousands_separators(percComp)} %{" "}
          </dd>
          <div>({thousands_separators(totalComp)})</div>
        </dl>
      </div>

      <div
        style={{
          color: "gray",
          fontSize: `${asofDateSize}px`,
          float: "right",
          marginRight: "15px",
        }}
      >
        {asofdate ? `As of ${asofdate}` : `As of `}
      </div>

      <div
        id="utilityPointChartTitle"
        style={{ marginTop: "10px", marginLeft: "15px" }}
      >
        POINT FEATURE:
      </div>
      <div
        id={chartID}
        style={{
          height: "30vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginRight: "20px",
          marginLeft: "15px",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>
    </>
  );
});

export default ChartUtilityPoint;
