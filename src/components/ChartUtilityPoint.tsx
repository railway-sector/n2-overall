import { useEffect, useRef, useState, use } from "react";
import { queryc_utilp, utilityPointLayer, utilityPointLayer1 } from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { dateUpdate, thousands_separators } from "../query";
import {
  cpField,
  primaryLabelColor,
  updatedDateCategoryNames,
  utility_statusField,
  utility_typeField,
  utilityStatusArray,
  utilityTypeChart,
  valueLabelColor,
  viaductStatusColorForChart,
} from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { chartDataColumnSries } from "../chartGenerator";
import { chartRendererColumn } from "../chartRenderer";
import { queryDefinitionExpression } from "../queryDefinition";
import { legendSetter, rootSetter } from "../chartSetter";
import { dateDisplayKeys } from "../interfaceKeys";
import { useQuery } from "@tanstack/react-query";
import type { DisplayDates, ChartResponse } from "../interfaceKeys";

// Draw chart
const ChartUtilityPoint = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const { cpackage, utilityLinestats } = use(MyContext);

  //--- 0. As of date
  const { data: dates } = useQuery<DisplayDates | any>({
    queryKey: [dateDisplayKeys.selected, updatedDateCategoryNames[3]],
    queryFn: () => dateUpdate(updatedDateCategoryNames[3]),
    select: (response) => {
      return {
        asOfDate: response[0][0],
        daysPass: response[0][1],
      };
    },
    staleTime: Infinity,
  });

  const { data } = useQuery<ChartResponse | any>({
    queryKey: [
      cpackage,
      utility_statusField,
      utilityPointLayer,
      utilityLinestats,
    ],
    queryFn: async () => {
      queryc_utilp.qValues = [cpackage === "All" ? undefined : cpackage];

      queryDefinitionExpression({
        queryExpression: queryc_utilp.queryExpression(),
        featureLayer: [utilityPointLayer, utilityPointLayer1],
      });

      //--- chart data
      const chartData = await chartDataColumnSries({
        qChart: queryc_utilp.queryExpression(),
        chartCategoryTypes: utilityTypeChart,
        chartCategoryTypeField: utility_typeField,
        layer: utilityPointLayer,
        statusstate: [0, 1],
        statusField: utility_statusField,
        layerName: "utility",
      });

      //--- total completion number
      const total_comp = utilityLinestats && chartData[1] + utilityLinestats[1];
      const totaln = utilityLinestats && chartData[2] + utilityLinestats[2];
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
  const new_chartIconSize = chartPanelwidth * 0.07;
  const new_axisFontSize = chartPanelwidth * 0.036;
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

    chartRendererColumn({
      root: root,
      chart: chart,
      data: chartData,
      layers: [utilityPointLayer, utilityPointLayer1],
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
            }}
          >
            {perc_comp && thousands_separators(perc_comp)} %{" "}
          </dd>
          <div>({total_comp && thousands_separators(total_comp)})</div>
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
          marginTop: "10px",
        }}
      ></div>
    </>
  );
};

export default ChartUtilityPoint;
