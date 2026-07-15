import { useEffect, useRef, useState, use } from "react";
import { utilityPointLayer, utilityPointLayer1 } from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import {
  dateUpdate,
  makeQuery,
  stackColumnChartData,
  stackColumnChartRender,
  thousands_separators,
} from "../query";
import {
  cp_f,
  monitorLists,
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
import { useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import ChartStackColumnRender from "chart-stack-column-render";
import ChartStackColumns from "chart-stack-column";

// Draw chart
const ChartUtilityPoint = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const { cpackage, utilityLinestats } = use(MyContext);

  //--- As of date
  const { data: date } = useQuery<any>({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate(monitorLists[3]),
    staleTime: Infinity,
  });
  const asofdate = date ?? "";

  //--- Query Expression
  const qV = [cpackage === "All" ? undefined : cpackage];
  const qF = [cp_f];
  const queryc_utilp = makeQuery(qV, qF);

  const { data, isLoading } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, util_status_f, utilityPointLayer, utilityLinestats],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: queryc_utilp.queryExpression(),
        featureLayer: [utilityPointLayer, utilityPointLayer1],
      });

      //--- chart data
      const chartData = await stackColumnChartData({
        colchart: new ChartStackColumns(),
        qChart: queryc_utilp,
        categoryTypes: util_types,
        categoryTypeField: util_type_f,
        layers: [utilityPointLayer],
        statusField: util_status_f,
        statusState: [0, 2, 3, 1],
      });

      //--- total completion number
      const total_comp = utilityLinestats && chartData[3] + utilityLinestats[3];
      const totaln = utilityLinestats && chartData[1] + utilityLinestats[1];
      const perc_comp = ((total_comp / totaln) * 100).toFixed(0);

      return {
        chartData: chartData[0] || [],
        totalComp: total_comp || 0,
        perc_comp: perc_comp || 0,
      };
    },
    staleTime: Infinity,
  });
  const chartData = data?.chartData || [];
  const total_comp = data?.totalComp || 0;
  const perc_comp = data?.perc_comp || 0;

  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const chartID = "utility-point-bar";

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
  const new_chartIconSize = chartPanelwidth * 0.06;
  const new_axisFontSize = chartPanelwidth * 0.03;
  const new_imageSize = chartPanelwidth * 0.04;
  const new_asofDateSize = chartPanelwidth * 0.032;

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
      forceHidden: true,
    });
    legendRef.current = legend;

    stackColumnChartRender({
      render: new ChartStackColumnRender(),
      revit: false,
      layers: [utilityPointLayer, utilityPointLayer1],
      root,
      chart,
      data: chartData,
      buildingLayer: undefined,
      qChart: queryc_utilp,
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
      >
        <img
          src="https://EijiGorilla.github.io/Symbols/Utility_Logo.png"
          alt="Land Logo"
          height={`${new_imageSize}%`}
          width={`${new_imageSize}%`}
          style={{ paddingTop: "3px", paddingLeft: "15px" }}
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
            {perc_comp && thousands_separators(perc_comp)} %{" "}
          </dd>
          <div>({total_comp && thousands_separators(total_comp)})</div>
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
        id="utilityPointChartTitle"
        style={{ marginTop: "10px", marginLeft: "15px" }}
      >
        POINT FEATURE:
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
          opacity: isLoading ? 0 : 1,
        }}
      ></div>
    </>
  );
};

export default ChartUtilityPoint;
