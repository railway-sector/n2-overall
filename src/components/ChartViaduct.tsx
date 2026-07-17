/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useRef, useState, use, memo } from "react";
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
import {
  dateUpdate,
  makeQuery,
  stackColumnChartData,
  stackColumnChartRender,
} from "../query";
import ChartStackColumnRender from "chart-stack-column-render";
import {
  cp_f,
  monitorLists,
  via_status_f,
  via_type_f,
  viastatus_q,
  viatypes_q,
} from "../uniqueValues";
import ChartStackColumns from "chart-stack-column";

// Draw chart
const ChartViaduct = memo(() => {
  const { cpackage } = use(MyContext);
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const chartID = "viaduct-bar";

  const { data: date } = useQuery<any>({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate(monitorLists[5]),
    staleTime: Infinity,
  });
  const asofdate = date ?? "";

  //--- Query Expression
  const qV = [cpackage === "All" ? undefined : cpackage];
  const qF = [cp_f];
  const queryc_via = makeQuery(qV, qF);

  const { data, isLoading } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, via_status_f, viaductLayer],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: queryc_via.queryExpression(),
        featureLayer: [pierAccessLayer, viaductLayer],
      });

      //--- chart data
      const chartData = await stackColumnChartData({
        colchart: new ChartStackColumns(),
        qChart: queryc_via,
        categoryTypes: viatypes_q,
        categoryTypeField: via_type_f,
        layers: [viaductLayer],
        statusField: via_status_f,
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

    //--- Chart renderer
    stackColumnChartRender({
      render: new ChartStackColumnRender(),
      revit: false,
      layers: [viaductLayer],
      root,
      chart,
      data: chartData,
      buildingLayer: undefined,
      qChart: queryc_via,
      chartCategoryTypes: viatypes_q,
      chartCategoryTypeField: via_type_f,
      statusTypename: ["Completed", "To be Constructed", "Under Construction"], //["Completed", "To be Constructed", "Under Construction"],
      statusStatename: ["comp", "incomp", "ongoing"], //["comp", "incomp", "ongoing"],
      statusArray: viastatus_q,
      statusField: via_status_f,
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
            {perc_comp} %
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
        id={chartID}
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
