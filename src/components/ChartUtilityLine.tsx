import { useEffect, useRef, useState, use, memo, useMemo } from "react";
import { utilityLineLayer, utilityLineLayer1 } from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { queryDefinitionExpression } from "../queryDefinition";
import { useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import { legendSetter, rootSetter } from "../chartSetter";
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
import QueryExpressionLayers from "query-layers-expression";

const CHART_ID = "utility-line-bar";
const CHART_BORDER_COLOR = "#00c5ff";
const CHART_BORDER_WIDTH = 0.4;
const CHART_ICON_POSITION_X = undefined;
const CHART_PADDING_RIGHT_ICON_LABEL = 25;

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
//     useUtilityData    //
//-----------------------//
function useUtilityData(
  cpackage: string,
  query: any,
  updateUtilityLinestats: any,
) {
  return useQuery<ChartResponse | any>({
    queryKey: [
      cpackage,
      utilityLineLayer,
      utilityLineLayer1,
      util_status_f,
      query,
    ],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: query.queryExpression(),
        featureLayer: [utilityLineLayer, utilityLineLayer1],
      });

      const chartData = await new ChartStackColumns({
        where: query,
        categoryTypes: util_types,
        categoryTypeField: util_type_f,
        layers: [utilityLineLayer],
        statusField: util_status_f,
        statusState: [0, 2, 3, 1],
      }).chartDataStackColumns();

      updateUtilityLinestats(chartData);

      return {
        chartData: chartData[0] || [],
        totaln: chartData[1] || 0,
        perc: chartData[2] || 0,
      };
    },
    staleTime: Infinity,
  });
}

// Draw chart
const ChartUtilityLine = memo(() => {
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const { cpackage, updateUtilityLinestats } = use(MyContext);
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});

  //--- Query Expression
  const q1 = useMemo(
    () =>
      new QueryExpressionLayers({
        qFields: [cp_f],
        qValues: [cpackage === "All" ? undefined : cpackage],
      }),
    [cpackage],
  );

  const { data, isLoading } = useUtilityData(
    cpackage,
    q1,
    updateUtilityLinestats,
  );
  const chartData = data?.chartData ?? [];

  // ************************************
  //  Responsive Chart parameters
  // ***********************************
  const new_chartIconSize = chartPanelwidth ? chartPanelwidth * 0.06 : 0;
  const new_axisFontSize = chartPanelwidth ? chartPanelwidth * 0.03 : 0;

  // Utility line
  useEffect(() => {
    const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
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
      chart,
      root,
      marginTop: 15,
      scale: 0.9,
      layout: root.horizontalLayout,
      centerX: -30,
    });
    legendRef.current = legend;

    new ChartStackColumnRender({
      revit: false,
      layers: [utilityLineLayer, utilityLineLayer1],
      root,
      chart,
      data: chartData,
      buildingLayer: undefined,
      where: q1,
      chartCategoryTypes: util_types,
      chartCategoryTypeField: util_type_f,
      statusTypename: ["Completed", "To be Constructed"],
      statusStatename: ["comp", "incomp"],
      statusArray: util_status_q,
      statusField: util_status_f,
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

    return () => root.dispose();
  }, [chartData, new_chartIconSize]);

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
        id={CHART_ID}
        style={{
          height: "32vh",
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

export default ChartUtilityLine;
