import { useEffect, useRef, useState, use } from "react";
import { utilityLineLayer, utilityLineLayer1 } from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import {
  chartDataColumnSries,
  chartRendererColumn,
  queryDefinitionExpression,
  queryExpression,
} from "../Query";
import {
  utility_statusField,
  utility_typeField,
  utilityTypeChart,
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
const UtilityLineChart = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const {
    contractpackages,
    updateChartPanelwidth,
    chartPanelwidth,
    updateUtilityLinestats,
  } = use(MyContext);

  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [chartData, setChartData] = useState([]);
  const chartID = "utility-line-bar";

  useEffect(() => {
    queryDefinitionExpression({
      queryExpression: queryExpression({
        contractcp: contractpackages,
      }),
      featureLayer: [utilityLineLayer, utilityLineLayer1],
    });

    chartDataColumnSries({
      contractp: contractpackages,
      typeList: utilityTypeChart,
      typeField: utility_typeField,
      layer: utilityLineLayer,
      statusstate: [0, 1],
      statusField: utility_statusField,
      layerName: "utility",
    }).then((result: any) => {
      setChartData(result[0]);
      updateUtilityLinestats(result);
    });
  }, [contractpackages]);

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
        forceHidden: true,
      }),
    );
    legendRef.current = legend;

    chartRendererColumn({
      layer: utilityLineLayer,
      layer2: utilityLineLayer1,
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

export default UtilityLineChart;
