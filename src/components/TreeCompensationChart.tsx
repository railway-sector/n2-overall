import { useEffect, useRef, useState, use } from "react";
import { treeCompensationLayer } from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import { chartRenderer, pieChartStatusData } from "../Query";
import {
  colorsCompen,
  statusTreeCompensation,
  statusTreeCompensationChart,
  treeCompen_status_field,
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

const TreeCompensationChart = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const { contractpackages, updateChartPanelwidth } = use(MyContext);

  //---- Parameters
  const new_pieSeriesScale = 220;
  const new_pieInnerValueFontSize = "0.75rem";
  const new_pieInnerLabelFontSize = "0.45em";

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [treeData, setTreeData] = useState([]);
  const chartid = "pie-compen";

  useEffect(() => {
    pieChartStatusData({
      contractcp: contractpackages,
      layer: treeCompensationLayer,
      statusList: statusTreeCompensation,
      statusColor: colorsCompen,
      statusField: treeCompen_status_field,
    }).then((result: any) => {
      setTreeData(result[0]);
    });
  }, [contractpackages]);

  useEffect(() => {
    maybeDisposeRoot(chartid);

    const root = am5.Root.new(chartid);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
    ]);

    // Create chart
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      }),
    );

    chartRef.current = chart;

    // Create series
    const pieSeries = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: "Series",
        categoryField: "category",
        valueField: "value",
        legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
        radius: am5.percent(45), // outer radius
        innerRadius: am5.percent(28),
        scale: 2,
      }),
    );
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    // Legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: -15,
      }),
    );
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    // Render chart
    chartRenderer({
      chart: chart,
      pieSeries: pieSeries,
      legend: legend,
      root: root,
      contractcp: contractpackages,
      status_field: treeCompen_status_field,
      arcgisScene: arcgisScene,
      updateChartPanelwidth: updateChartPanelwidth,
      data: treeData,
      pieSeriesScale: new_pieSeriesScale,
      pieInnerLabel: "TREES",
      pieInnerLabelFontSize: new_pieInnerLabelFontSize,
      pieInnerValueFontSize: new_pieInnerValueFontSize,
      layer: treeCompensationLayer,
      statusArray: statusTreeCompensationChart,
    });

    return () => {
      root.dispose();
    };
  }, [chartid, treeData]);

  useEffect(() => {
    pieSeriesRef.current?.data.setAll(treeData);
    legendRef.current?.data.setAll(pieSeriesRef.current.dataItems);
  });

  return (
    <>
      <div
        id={chartid}
        style={{
          height: "34vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
        }}
      ></div>
    </>
  );
};

export default TreeCompensationChart;
