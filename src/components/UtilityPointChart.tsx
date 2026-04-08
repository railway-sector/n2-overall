import { useEffect, useRef, useState, use } from "react";
import { utilityPointLayer, utilityPointLayer1 } from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import {
  chartDataColumnSries,
  chartRendererColumn,
  dateUpdate,
  queryDefinitionExpression,
  queryExpression,
  thousands_separators,
} from "../Query";
import {
  cutoff_days,
  primaryLabelColor,
  updatedDateCategoryNames,
  utility_statusField,
  utility_typeField,
  utilityTypeChart,
  valueLabelColor,
  viaductStatusColorForChart,
} from "../uniqueValues";

import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

// Draw chart
const UtilityPointChart = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const {
    contractpackages,
    updateChartPanelwidth,
    chartPanelwidth,
    utilityLinestats,
  } = use(MyContext);

  // 0. Updated date
  const [asOfDate, setAsOfDate] = useState<undefined | any | unknown>(null);
  const [daysPass, setDaysPass] = useState<boolean>(false);
  useEffect(() => {
    dateUpdate(updatedDateCategoryNames[3]).then((response: any) => {
      setAsOfDate(response[0][0]);
      setDaysPass(response[0][1] >= cutoff_days ? true : false);
    });
  }, []);

  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [chartData, setChartData] = useState([]);
  const chartID = "utility-point-bar";
  const [progress, setProgress] = useState<any>();

  useEffect(() => {
    queryDefinitionExpression({
      queryExpression: queryExpression({
        contractcp: contractpackages,
      }),
      featureLayer: [utilityPointLayer, utilityPointLayer1],
    });

    chartDataColumnSries({
      contractp: contractpackages,
      typeList: utilityTypeChart,
      typeField: utility_typeField,
      layer: utilityPointLayer,
      statusstate: [0, 1],
      statusField: utility_statusField,
      layerName: "utility",
    }).then((result: any) => {
      setChartData(result[0]);

      //--- Calculate total completion and percent compeltion
      const total_comp = utilityLinestats ? result[1] + utilityLinestats[1] : 0;
      const total_count = utilityLinestats
        ? result[2] + utilityLinestats[2]
        : 0;
      const total_percent_comp = ((total_comp / total_count) * 100).toFixed(0);
      setProgress([total_comp, total_percent_comp]);
    });
  }, [contractpackages, utilityLinestats]);

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
    maybeDisposeRoot(chartID);

    const root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
    ]);

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

    const legend = chart.children.push(
      am5.Legend.new(root, {
        marginTop: 15,
        scale: 0.9,
        layout: root.horizontalLayout,
      }),
    );
    legendRef.current = legend;

    chartRendererColumn({
      layer: utilityPointLayer,
      layer2: utilityPointLayer1,
      layerName: "utility",
      root: root,
      chart: chart,
      data: chartData,
      typeArray: utilityTypeChart,
      typeField: utility_typeField,
      contractcp: contractpackages,
      statusTypename: ["Completed", "To be Constructed"],
      statusStatename: ["comp", "incomp"],
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
      updateChartPanelwidth: updateChartPanelwidth,
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
            {progress && thousands_separators(progress[1])} %{" "}
          </dd>
          <div>({progress && thousands_separators(progress[0])})</div>
        </dl>
      </div>

      <div
        style={{
          color: daysPass === true ? "red" : "gray",
          fontSize: `${new_asofDateSize}px`,
          float: "right",
          marginRight: "15px",
        }}
      >
        {!asOfDate ? "" : "As of " + asOfDate}
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
          height: "29vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginRight: "15px",
          marginLeft: "15px",
        }}
      ></div>
    </>
  );
};

export default UtilityPointChart;
