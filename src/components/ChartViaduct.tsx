/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useRef, useState, use } from "react";
import {
  chartstack_via,
  pierAccessLayer,
  queryc_via,
  viaductLayer,
} from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-button";
import { ArcgisScene } from "@arcgis/map-components/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import {
  status_field,
  type_field,
  updatedDateCategoryNames,
  viaductStatusColorForChart,
  viaStatusArray,
  viatypes,
} from "../uniqueValues";
import { chartRendererColumn } from "../chartRenderer";
import { queryDefinitionExpression } from "../queryDefinition";
import { legendSetter, rootSetter } from "../chartSetter";
import { dateDisplayKeys } from "../interfaceKeys";
import { useQuery } from "@tanstack/react-query";
import type { DisplayDates, ChartResponse } from "../interfaceKeys";
import { dateUpdate, stackColumnsChartData } from "../query";

// Draw chart
const ChartViaduct = () => {
  const { cpackage } = use(MyContext);

  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const chartID = "viaduct-bar";

  // --- 0. As of date
  const { data: dates } = useQuery<DisplayDates | any>({
    queryKey: [dateDisplayKeys.selected, updatedDateCategoryNames[5]],
    queryFn: () => dateUpdate(updatedDateCategoryNames[5]),
    select: (response) => {
      return {
        asOfDate: response[0][0],
        daysPass: response[0][1],
      };
    },
    staleTime: Infinity,
  });

  const { data } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, status_field, viaductLayer],
    queryFn: async () => {
      queryc_via.qValues = [cpackage === "All" ? undefined : cpackage];

      queryDefinitionExpression({
        queryExpression: queryc_via.queryExpression(),
        featureLayer: [pierAccessLayer, viaductLayer],
      });

      //--- chart data
      const chartData = await stackColumnsChartData({
        stackchart: chartstack_via,
        qChart: queryc_via,
        categoryTypes: viatypes,
        categoryTypeField: type_field,
        layers: [viaductLayer],
        statusField: status_field,
        statusState: [1, 2, 3, 4],
      });

      return {
        chartData: chartData[0] || [],
        perc_comp: chartData[2] || 0,
      };
    },
    staleTime: Infinity,
  });
  const chartData = data?.chartData || [];
  const perc_comp = data?.perc_comp || 0;

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
  const new_fontSize = chartPanelwidth / 20;
  const new_valueSize = new_fontSize * 1.55;
  const new_chartIconSize = chartPanelwidth * 0.07;
  const new_axisFontSize = chartPanelwidth * 0.036;
  const new_imageSize = chartPanelwidth * 0.035;
  const new_asofDateSize = chartPanelwidth * 0.032;
  // const new_resetfiler_buttonSize = chartPanelwidth * 0.05;

  // Utility Chart
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
    });
    legendRef.current = legend;

    chartRendererColumn({
      root: root,
      chart: chart,
      data: chartData,
      layers: [viaductLayer],
      qChart: queryc_via,
      chartCategoryTypes: viatypes,
      chartCategoryTypeField: type_field,
      statusTypename: ["Completed", "To be Constructed", "Under Construction"],
      statusStatename: ["comp", "incomp", "ongoing"],
      statusArray: viaStatusArray,
      statusField: status_field,
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
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  });

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
            }}
          >
            {perc_comp} %
          </dd>
        </dl>
      </div>
      <div
        style={{
          color: dates?.daysPass === true ? "red" : "gray",
          fontSize: `${new_asofDateSize}px`,
          float: "right",
          marginRight: "15px",
        }}
      >
        {!dates?.asOfDate ? "" : "As of " + dates?.asOfDate}
      </div>
      <div
        id={chartID}
        style={{
          height: "67vh",
          color: "white",
          marginRight: "13px",
          marginLeft: "13px",
          marginTop: "20px",
        }}
      ></div>
    </>
  );
};

export default ChartViaduct;
