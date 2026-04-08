import { useEffect, useRef, useState, use } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import {
  chartRenderer,
  dateUpdate,
  pieChartStatusData,
  queryDefinitionExpression,
  queryExpression,
  thousands_separators,
  // totalFieldCount,
} from "../Query";
import "../index.css";
import {
  cutoff_days,
  primaryLabelColor,
  structureStatusQuery,
  structureStatusField,
  updatedDateCategoryNames,
  valueLabelColor,
  structureStatusLabel,
  structureStatusColorHex,
  // structurePteField,
} from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { occupancyLayer, structureLayer } from "../layers";

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

/// Draw chart
const StructureChart = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const { contractpackages, chartPanelwidth, updateChartPanelwidth } =
    use(MyContext);

  // 0. Updated date
  const [asOfDate, setAsOfDate] = useState<undefined | any | unknown>(null);
  const [daysPass, setDaysPass] = useState<boolean>(false);
  useEffect(() => {
    dateUpdate(updatedDateCategoryNames[1]).then((response: any) => {
      setAsOfDate(response[0][0]);
      setDaysPass(response[0][1] >= cutoff_days ? true : false);
    });
  }, []);

  // ************************************
  //  Chart
  // ***********************************
  const new_fontSize = chartPanelwidth / 22.3;
  const new_valueSize = new_fontSize * 1.55;
  const new_imageSize = chartPanelwidth * 0.03;
  const new_asofDateSize = chartPanelwidth * 0.032;
  const new_pieSeriesScale = 220;
  const new_pieInnerValueFontSize = "1.2rem";
  const new_pieInnerLabelFontSize = "0.45em";

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [structureData, setStructureData] = useState<any>([]);

  const chartID = "structure-chart";
  const [structureNumber, setStructureNumber] = useState<number>(0);
  // const [pteNumber, setPteNumber] = useState<number>(0);
  // const [ptePercent, setPtePercent] = useState<number>(0);

  // useEffect(() => {
  //   setPtePercent(Number(((pteNumber / structureNumber) * 100).toFixed(0)));
  // }, [structureData, structureNumber]);

  useEffect(() => {
    queryDefinitionExpression({
      queryExpression: queryExpression({ contractcp: contractpackages }),
      featureLayer: [structureLayer, occupancyLayer],
    });

    //--- chart data
    pieChartStatusData({
      contractcp: contractpackages,
      layer: structureLayer,
      statusList: structureStatusLabel,
      statusColor: structureStatusColorHex,
      statusField: structureStatusField,
    }).then((result: any) => {
      setStructureData(result[0]);
      setStructureNumber(result[1]);
    });

    //--- total number of pte
    // totalFieldCount({
    //   contractcp: contractpackages,
    //   layer: structureLayer,
    //   idField: structurePteField,
    //   queryField: `${structurePteField} = 1`,
    // }).then((result: any) => {
    //   setPteNumber(result);
    // });
  }, [contractpackages]);

  useEffect(() => {
    maybeDisposeRoot(chartID);

    const root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themes
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
        //legendLabelText: "[{fill}]{category}[/]",
        legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
        radius: am5.percent(45), // outer radius
        innerRadius: am5.percent(28),
      }),
    );
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    // Legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
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
      status_field: structureStatusField,
      arcgisScene: arcgisScene,
      updateChartPanelwidth: updateChartPanelwidth,
      data: structureData,
      pieSeriesScale: new_pieSeriesScale,
      pieInnerLabel: "STRUCTURES",
      pieInnerLabelFontSize: new_pieInnerLabelFontSize,
      pieInnerValueFontSize: new_pieInnerValueFontSize,
      layer: structureLayer,
      statusArray: structureStatusQuery,
    });

    return () => {
      root.dispose();
    };
  }, [chartID, structureData]);

  useEffect(() => {
    pieSeriesRef.current?.data.setAll(structureData);
    legendRef.current?.data.setAll(pieSeriesRef.current.dataItems);
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          marginLeft: "15px",
          marginRight: "15px",
          justifyContent: "space-between",
        }}
      >
        <img
          src="https://EijiGorilla.github.io/Symbols/House_Logo.svg"
          alt="Structure Logo"
          height={`${new_imageSize}%`}
          width={`${new_imageSize}%`}
          style={{ paddingTop: "2px" }}
        />
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{
              color: primaryLabelColor,
              fontSize: `${new_fontSize}px`,
              marginRight: "25px",
            }}
          >
            TOTAL STRUCTURES
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
            {thousands_separators(structureNumber)}
          </dd>
        </dl>
      </div>

      <div
        style={{
          color: daysPass === true ? "red" : "gray",
          fontSize: `${new_asofDateSize}px`,
          float: "right",
          marginRight: "5px",
        }}
      >
        {!asOfDate ? "" : "As of " + asOfDate}
      </div>

      {/* Structure Chart */}
      <div
        id={chartID}
        style={{
          height: "57vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginBottom: "5%",
        }}
      ></div>

      {/* Permit-to-Enter */}
      {/* <div
        style={{
          display: "flex",
          // marginTop: "3px",
          marginLeft: "15px",
          marginRight: "15px",
          justifyContent: "space-between",
        }}
      >
        <dl style={{ alignItems: "center", marginLeft: "15px" }}>
          <dt
            style={{
              color: primaryLabelColor,
              fontSize: `${new_fontSize}px`,
            }}
          >
            PERMIT-TO-ENTER
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
            {pteNumber === 0 ? (
              <span>{ptePercent}% (0)</span>
            ) : (
              <span>
                {ptePercent}% (
                {thousands_separators(pteNumber)})
              </span>
            )}
          </dd>
        </dl>
        <img
          src="https://EijiGorilla.github.io/Symbols/Permit-To-Enter.png"
          alt="Structure Logo"
          height={`${new_imageSize}%`}
          width={`${new_imageSize}%`}
        />
      </div> */}
    </>
  );
}; // End of lotChartgs

export default StructureChart;
