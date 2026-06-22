import { useEffect, useRef, useState, use } from "react";
import { queryc_utill, utilityLineLayer, utilityLineLayer1 } from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import {
  cpField,
  utility_statusField,
  utility_typeField,
  utilityStatusArray,
  utilityTypeChart,
  viaductStatusColorForChart,
} from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { chartDataColumnSries } from "../chartGenerator";
import { chartRendererColumn } from "../chartRenderer";
import { queryDefinitionExpression } from "../queryDefinition";
import { useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import { legendSetter, rootSetter } from "../chartSetter";

// Draw chart
const ChartUtilityLine = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const { cpackage, updateUtilityLinestats } = use(MyContext);

  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const chartID = "utility-line-bar";

  const { data } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, utility_statusField, utilityLineLayer],
    queryFn: async () => {
      queryc_utill.qValues = [cpackage === "All" ? undefined : cpackage];

      queryDefinitionExpression({
        queryExpression: queryc_utill.queryExpression(),
        featureLayer: [utilityLineLayer, utilityLineLayer1],
      });

      //--- chart data
      const chartData = await chartDataColumnSries({
        qChart: queryc_utill.queryExpression(),
        chartCategoryTypes: utilityTypeChart,
        chartCategoryTypeField: utility_typeField,
        layer: utilityLineLayer,
        statusstate: [0, 1],
        statusField: utility_statusField,
        layerName: "utility",
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
  // const totaln = data?.totaln || 0;

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

  // ************************************
  //  Responsive Chart parameters
  // ***********************************
  const new_chartIconSize = chartPanelwidth * 0.07;
  const new_axisFontSize = chartPanelwidth * 0.036;

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

    chartRendererColumn({
      root: root,
      chart: chart,
      data: chartData,
      layers: [utilityLineLayer, utilityLineLayer1],
      qChart: queryc_utill,
      q1Value: cpackage === "All" ? undefined : cpackage,
      q1Field: cpField,
      chartCategoryTypes: utilityTypeChart,
      chartCategoryTypeField: utility_typeField,
      statusTypename: ["Completed", "To be Constructed"],
      statusStatename: ["comp", "incomp"],
      statusArray: utilityStatusArray,
      statusField: utility_statusField,
      seriesStatusColor: viaductStatusColorForChart,
      strokeColor: chartBorderLineColor,
      strokeWidth: chartBorderLineWidth,
      arcgisScene: arcgisScene,
      new_chartIconSize: new_chartIconSize,
      new_axisFontSize: new_axisFontSize,
      chartIconPositionX: chartIconPositionX,
      chartPaddingRightIconLabel: chartPaddingRightIconLabel,
      legend: legend,
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
          height: "30vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginRight: "15px",
          marginLeft: "15px",
        }}
      ></div>
    </>
  );
};

export default ChartUtilityLine;
