/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useRef, useState, use, memo, useMemo } from "react";
import { pierAccessLayer, viaductLayer } from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-button";
import { ArcgisScene } from "@arcgis/map-components/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { queryDefinitionExpression } from "../queryDefinition";
import { legendSetter, rootSetter } from "../chartSetter";
import { useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import { dateUpdate } from "../query";
import ChartStackColumnRender from "chart-stack-column-render";
import {
  cp_f,
  via_status_f,
  via_type_f,
  viastatus_q,
  viatypes_q,
} from "../uniqueValues";
import ChartStackColumns from "chart-stack-column";
import QueryExpressionLayers from "query-layers-expression";

const CHART_ID = "viaduct-bar";
const CHART_BORDER_COLOR = "#00c5ff";
const CHART_BORDER_WIDTH = 0.4;
const CHART_ICON_POSITION_X = undefined;
const CHART_PADDING_RIGHT_ICON_LABEL = 15;

// Static chart layout — doesn't depend on props/state
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

//-----------------------//
//     usetViaductData   //
//-----------------------//
function useViaductData(cpackage: string, query: any) {
  return useQuery<ChartResponse | any>({
    queryKey: [cpackage, via_status_f, viaductLayer],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: query.queryExpression(),
        featureLayer: [pierAccessLayer, viaductLayer],
      });

      //--- chart data
      const chartData = await new ChartStackColumns({
        where: query,
        categoryTypes: viatypes_q,
        categoryTypeField: via_type_f,
        layers: [viaductLayer],
        statusField: via_status_f,
        statusState: [1, 2, 3, 4],
      }).chartDataStackColumns();

      return {
        chartData: chartData[0] || [],
        percComp: chartData[2] || 0,
      };
    },
    staleTime: Infinity,
  });
}

// Draw chart
const ChartViaduct = memo(() => {
  const { cpackage } = use(MyContext);
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});

  const { data: date } = useQuery({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate("Viaduct"),
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

  const { data, isLoading } = useViaductData(cpackage, q1);
  const chartData = data?.chartData ?? [];
  const percComp = data?.percComp ?? 0;

  const new_fontSize = chartPanelwidth / 20;
  const new_valueSize = new_fontSize * 1.55;
  const new_chartIconSize = chartPanelwidth * 0.07;
  const new_axisFontSize = chartPanelwidth * 0.036;
  const new_imageSize = chartPanelwidth * 0.035;
  const new_asofDateSize = chartPanelwidth * 0.032;

  useEffect(() => {
    const root = rootSetter({ chartID: CHART_ID });
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
      marginTop: 15,
      scale: 0.9,
      layout: root.horizontalLayout,
    });
    legendRef.current = legend;

    //--- Chart renderer
    new ChartStackColumnRender({
      revit: false,
      layers: [viaductLayer],
      root,
      chart,
      data: chartData,
      buildingLayer: undefined,
      where: q1,
      chartCategoryTypes: viatypes_q,
      chartCategoryTypeField: via_type_f,
      statusTypename: ["Completed", "To be Constructed", "Under Construction"], //["Completed", "To be Constructed", "Under Construction"],
      statusStatename: ["comp", "incomp", "ongoing"], //["comp", "incomp", "ongoing"],
      statusArray: viastatus_q,
      statusField: via_status_f,
      seriesStatusColor: viastatus_q.map((c: any) => c.color),
      strokeColor: CHART_BORDER_COLOR,
      strokeWidth: CHART_BORDER_WIDTH,
      view: arcgisScene?.view,
      new_chartIconSize,
      new_axisFontSize,
      chartIconPositionX: CHART_ICON_POSITION_X,
      chartPaddingRightIconLabel: CHART_PADDING_RIGHT_ICON_LABEL,
      legend,
      updateChartPanelwidth: setChartPanelwidth,
    }).chartRendererColumn();

    return () => {
      root.dispose();
    };
  }, [chartData]);

  const primaryLabelColor = "#9ca3af";
  const valueLabelColor = "#d1d5db";
  return (
    <>
      <div
        style={{
          display: "flex",
          marginTop: "3px",
          marginLeft: "15px",
          marginRight: "15px",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <img
          src="https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_All_Logo.svg"
          alt="Land Logo"
          height={`${new_imageSize}%`}
          width={`${new_imageSize}%`}
          style={{ paddingTop: "20px", paddingLeft: "15px" }}
        />
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{
              color: primaryLabelColor,
              fontSize: `${new_fontSize}px`,
              marginRight: "35px",
            }}
          >
            TOTAL PROGRESS
          </dt>
          <dd
            style={{
              color: valueLabelColor,
              fontSize: `${new_valueSize}px`,
              fontWeight: "bold",
              fontFamily: "calibri",
              lineHeight: "1.2",
              margin: "auto",
              opacity: isLoading ? 0 : 1,
            }}
          >
            {percComp} %
          </dd>
        </dl>
      </div>

      <div
        style={{
          color: "gray",
          fontSize: `${new_asofDateSize}px`,
          float: "right",
          marginRight: "15px",
        }}
      >
        {asofdate ? `As of ${asofdate}` : `As of `}
      </div>

      <div
        id={CHART_ID}
        style={{
          height: "65vh",
          color: "white",
          marginRight: "13px",
          marginLeft: "13px",
          marginTop: "10px",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>
    </>
  );
});

export default ChartViaduct;
