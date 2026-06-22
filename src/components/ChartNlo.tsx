/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useRef, useState, useEffect, memo, use } from "react";
import { dateUpdate, thousands_separators } from "../query";
import {
  nloStatusField,
  primaryLabelColor,
  nloStatusQuery,
  updatedDateCategoryNames,
  valueLabelColor,
  nloStatusColor,
} from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { nloLayer, queryc_nlo } from "../layers";
import { pieChartStatusData } from "../chartGenerator";
import { chartRenderer } from "../chartRenderer";
import { queryDefinitionExpression } from "../queryDefinition";
import {
  chartSetter,
  legendSetter,
  maybeDisposeRoot,
  rootSetter,
  seriesSetter,
} from "../chartSetter";
import { dateDisplayKeys } from "../interfaceKeys";
import { useQuery } from "@tanstack/react-query";
import type { DisplayDates, ChartResponse } from "../interfaceKeys";

/// Draw chart
const ChartNlo = memo(() => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const { cpackage } = use(MyContext);

  //--- 0. As of date
  const { data: dates } = useQuery<DisplayDates | any>({
    queryKey: [dateDisplayKeys.selected, updatedDateCategoryNames[2]],
    queryFn: () => dateUpdate(updatedDateCategoryNames[2]),
    select: (response) => {
      return {
        asOfDate: response[0][0],
        daysPass: response[0][1],
      };
    },
    staleTime: Infinity,
  });

  const { data } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, nloStatusField, nloLayer],
    queryFn: async () => {
      queryc_nlo.qValues = [cpackage === "All" ? undefined : cpackage];
      queryc_nlo.qExpression = `${nloStatusField} >= 1`;

      queryDefinitionExpression({
        queryExpression: queryc_nlo.queryExpression(),
        featureLayer: [nloLayer],
      });

      //--- chart data
      const chartData = await pieChartStatusData({
        qChart: queryc_nlo.queryExpression(),
        layer: nloLayer,
        statusList: nloStatusQuery,
        statusColor: nloStatusColor,
        statusField: nloStatusField,
        statisticField: nloStatusField,
        statisticType: "count",
      });

      return {
        chartData: chartData[0] || [],
        totaln: chartData[1] || 0,
      };
    },
    // structuralSharing: false,
    staleTime: Infinity,
  });
  const chartData = data?.chartData || [];
  const totaln = data?.totaln;

  const new_fontSize = chartPanelwidth / 22.3;
  const new_valueSize = new_fontSize * 1.55;
  const new_imageSize = chartPanelwidth * 0.028;
  const new_pieSeriesScale = 280;
  const new_asofDateSize = chartPanelwidth * 0.032;
  const new_pieInnerValueFontSize = "1.3rem";
  const new_pieInnerLabelFontSize = "0.45em";

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const chartID = "nlo-chart";

  useEffect(() => {
    maybeDisposeRoot(chartID);
    const root = rootSetter({ chartID: chartID });
    const chart = chartSetter(root);
    chartRef.current = chart;

    const pieSeries = seriesSetter({
      chart: chart,
      root: root,
      categoryField: "category",
      valueField: "value",
      legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
      radius: 45,
      innerRadius: 28,
      scale: 1.7,
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
      qChart: queryc_nlo,
      status_field: nloStatusField,
      arcgisScene: arcgisScene,
      updateChartPanelwidth: setChartPanelwidth,
      data: chartData,
      pieSeriesScale: new_pieSeriesScale,
      pieInnerLabel: "HOUSEHOLDS",
      pieInnerLabelFontSize: new_pieInnerLabelFontSize,
      pieInnerValueFontSize: new_pieInnerValueFontSize,
      layer: nloLayer,
      statusArray: nloStatusQuery,
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
          // marginTop: "3px",
          marginLeft: "15px",
          marginRight: "15px",
          justifyContent: "space-between",
        }}
      >
        <img
          src="https://EijiGorilla.github.io/Symbols/NLO_Logo.svg"
          alt="Structure Logo"
          height={`${new_imageSize}%`}
          width={`${new_imageSize}%`}
          style={{ paddingTop: "5px", paddingLeft: "5px" }}
        />
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{
              color: primaryLabelColor,
              fontSize: `${new_fontSize}px`,
              marginRight: "20px",
            }}
          >
            TOTAL HOUSEHOLDS
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
      <div
        id={chartID}
        style={{
          height: "70vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
        }}
      ></div>
    </>
  );
}); // End of lotChartgs

export default ChartNlo;
