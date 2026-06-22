import { useEffect, useRef, useState, use } from "react";
import { dateUpdate, thousands_separators } from "../query";
import "../index.css";
import {
  primaryLabelColor,
  structureStatusQuery,
  structureStatusField,
  updatedDateCategoryNames,
  valueLabelColor,
  structureStatusColorHex,
} from "../uniqueValues";
import { MyContext } from "../contexts/MyContext";
import { occupancyLayer, queryc_struc, structureLayer } from "../layers";
import { pieChartStatusData } from "../chartGenerator";
import { chartRenderer } from "../chartRenderer";
import { queryDefinitionExpression } from "../queryDefinition";
import { dateDisplayKeys } from "../interfaceKeys";
import { useQuery } from "@tanstack/react-query";
import type { DisplayDates, ChartResponse } from "../interfaceKeys";
import {
  chartSetter,
  legendSetter,
  // maybeDisposeRoot,
  rootSetter,
  seriesSetter,
} from "../chartSetter";

/// Draw chart
const ChartStructure = () => {
  const arcgisScene = document.querySelector("arcgis-scene");
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const { cpackage } = use(MyContext);

  //--- 0. As of date
  const { data: dates } = useQuery<DisplayDates | any>({
    queryKey: [dateDisplayKeys.selected, updatedDateCategoryNames[1]],
    queryFn: () => dateUpdate(updatedDateCategoryNames[1]),
    select: (response) => {
      return {
        asOfDate: response[0][0],
        daysPass: response[0][1],
      };
    },
    staleTime: Infinity,
  });

  const { data } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, structureStatusField, structureLayer],
    queryFn: async () => {
      queryc_struc.qValues = [cpackage === "All" ? undefined : cpackage];

      queryDefinitionExpression({
        queryExpression: queryc_struc.queryExpression(),
        featureLayer: [structureLayer, occupancyLayer],
      });

      //--- chart data
      const chartData = await pieChartStatusData({
        qChart: queryc_struc.queryExpression(),
        layer: structureLayer,
        statusList: structureStatusQuery,
        statusColor: structureStatusColorHex,
        statusField: structureStatusField,
        statisticField: structureStatusField,
        statisticType: "count",
      });

      return {
        chartData: chartData[0] || [],
        totaln: chartData[1] || 0,
      };
    },
    staleTime: Infinity,
  });
  const chartData = data?.chartData || [];
  const totaln = data?.totaln;

  //------------------------------------------------------------//
  //              Pie chart rendering declaration               //
  //------------------------------------------------------------//
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
  const chartID = "structure-chart";

  useEffect(() => {
    // maybeDisposeRoot(chartID);
    const root = rootSetter({ chartID: chartID });
    const chart = chartSetter(root);
    chartRef.current = chart;

    const pieSeries = seriesSetter({
      chart: chart,
      root: root,
      categoryField: "category",
      valueField: "value",
      legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
      radius: 40,
      innerRadius: 28,
      // scale: 0.5,
    });
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    const legend = legendSetter({
      chart: chart,
      root: root,
      centerX: 50,
      x: 50,
    });
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    // Render chart
    chartRenderer({
      chart: chart,
      pieSeries: pieSeries,
      legend: legend,
      root: root,
      qChart: queryc_struc,
      status_field: structureStatusField,
      arcgisScene: arcgisScene,
      updateChartPanelwidth: setChartPanelwidth,
      data: chartData,
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
  }, [chartID, chartData]);

  useEffect(() => {
    pieSeriesRef.current?.data.setAll(chartData);
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
            {thousands_separators(totaln)}
          </dd>
        </dl>
      </div>

      <div
        style={{
          color: dates?.daysPass === true ? "red" : "gray",
          fontSize: `${new_asofDateSize}px`,
          float: "right",
          marginRight: "5px",
        }}
      >
        {!dates?.asOfDate ? "" : "As of " + dates?.asOfDate}
      </div>

      {/* Structure Chart */}
      <div
        id={chartID}
        style={{
          height: "67vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginTop: "5%",
        }}
      ></div>
    </>
  );
}; // End of lotChartgs

export default ChartStructure;
