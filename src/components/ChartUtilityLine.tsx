import { useEffect, useRef, useState, use } from "react";
import { utilityLineLayer, utilityLineLayer1 } from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { queryDefinitionExpression } from "../queryDefinition";
import { useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import { legendSetter, rootSetter } from "../chartSetter";
import {
  makeQuery,
  stackColumnChartData,
  stackColumnChartRender,
} from "../query";
import ChartStackColumnRender from "chart-stack-column-render";
import {
  cp_f,
  util_status_f,
  util_status_q,
  util_type_f,
  util_types,
  viastatus_q,
} from "../uniqueValues";
import ChartStackColumns from "chart-stack-column";

// Draw chart
const ChartUtilityLine = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const { cpackage, updateUtilityLinestats } = use(MyContext);

  //--- Query Expression
  const qV = [cpackage === "All" ? undefined : cpackage];
  const qF = [cp_f];
  const queryc_utill = makeQuery(qV, qF);

  const { data, isLoading } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, util_status_f, utilityLineLayer],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: queryc_utill.queryExpression(),
        featureLayer: [utilityLineLayer, utilityLineLayer1],
      });

      //--- chart data
      const chartData = await stackColumnChartData({
        colchart: new ChartStackColumns(),
        qChart: queryc_utill,
        categoryTypes: util_types,
        categoryTypeField: util_type_f,
        layers: [utilityLineLayer],
        statusField: util_status_f,
        statusState: [0, 2, 3, 1],
      });

      updateUtilityLinestats(chartData);

      return {
        chartData: chartData[0] || [],
        totaln: chartData[1] || 0,
      };
    },
    staleTime: Infinity,
  });
  const chartData = data?.chartData || [];

  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const chartID = "utility-line-bar";

  // Define parameters
  const marginTop = 0;
  const marginLeft = 0;
  const marginRight = 0;
  const marginBottom = 0;
  const paddingTop = 10;
  const paddingLeft = 5;
  const paddingRight = 5;
  const paddingBottom = 0;
  const chartIconPositionX = -21;
  const chartPaddingRightIconLabel = 45;

  const chartBorderLineColor = "#00c5ff";
  const chartBorderLineWidth = 0.4;

  const new_chartIconSize = chartPanelwidth * 0.06;
  const new_axisFontSize = chartPanelwidth * 0.03;

  // Utility point
  useEffect(() => {
    const root = rootSetter({ chartID: chartID });

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        marginTop: marginTop,
        marginLeft: marginLeft,
        marginRight: marginRight,
        marginBottom: marginBottom,
        paddingTop: paddingTop,
        paddingLeft: paddingLeft,
        paddingRight: paddingRight,
        paddingBottom: paddingBottom,
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
      centerX: -30,
      // forceHidden: true,
    });
    legendRef.current = legend;

    // chart renderer
    stackColumnChartRender({
      render: new ChartStackColumnRender(),
      revit: false,
      layers: [utilityLineLayer, utilityLineLayer1],
      root,
      chart,
      data: chartData,
      buildingLayer: undefined,
      qChart: queryc_utill,
      chartCategoryTypes: util_types,
      chartCategoryTypeField: util_type_f,
      statusTypename: ["Completed", "To be Constructed"], //["Completed", "To be Constructed", "Under Construction"],
      statusStatename: ["comp", "incomp"], //["comp", "incomp", "ongoing"],
      statusArray: util_status_q,
      statusField: util_status_f,
      seriesStatusColor: viastatus_q.map((c: any) => c.color),
      strokeColor: chartBorderLineColor,
      strokeWidth: chartBorderLineWidth,
      view: arcgisScene?.view,
      setLayerViewFilter: undefined,
      new_chartIconSize,
      new_axisFontSize,
      chartIconPositionX,
      chartPaddingRightIconLabel,
      legend,
      updateChartPanelwidth: setChartPanelwidth,
    });

    return () => {
      root.dispose();
    };
  });

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
      ></div>
      <div
        id="utilityPointChartTitle"
        style={{ marginTop: "10px", marginLeft: "15px" }}
      >
        LINE FEATURE:
      </div>
      <div
        id={chartID}
        style={{
          // width: "23vw",
          height: "32vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginRight: "15px",
          marginLeft: "15px",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>
    </>
  );
};

export default ChartUtilityLine;
