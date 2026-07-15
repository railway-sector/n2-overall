/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useRef, useState, useEffect, memo, use } from "react";
import {
  dateUpdate,
  makeQuery,
  pieChartData,
  PieChartRenderType,
  thousands_separators,
} from "../query";
import {
  nlo_status_f,
  primaryLabelColor,
  nlo_status_q,
  valueLabelColor,
  cp_f,
} from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { nloLayer } from "../layers";
import { useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import {
  chartSetter,
  legendSetter,
  maybeDisposeRoot,
  rootSetter,
  seriesSetter,
} from "../chartSetter";
import ChartPieSeriesRender from "chart-pie-series-render";
import { MyContext } from "../contexts/MyContext";
import ChartPieSeries from "chart-pie-series";
import { queryDefinitionExpression } from "../queryDefinition";
//--------------------------------------------//
//              Chart Component                //
//--------------------------------------------//

//--- memo prevents re-rendering the Component when the parent Component
//--- (ChartMain) is rendered.
const ChartNlo = memo(() => {
  const { cpackage } = use(MyContext);

  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();

  //--- As of date
  const { data: date } = useQuery<any>({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate("Viaduct"),
    staleTime: Infinity,
  });
  const asofdate = date ?? "";

  //--- Chart parameters
  const new_fontSize = chartPanelwidth / 22.3;
  const new_valueSize = new_fontSize * 1.55;
  const new_imageSize = chartPanelwidth * 0.028;
  const new_pieSeriesScale = 280;
  const new_asofDateSize = chartPanelwidth * 0.032;
  const new_pieInnerValueFontSize = "1.3rem";
  const new_pieInnerLabelFontSize = "0.45em";

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartID = "nlo-chart";

  //--- Generat Chart Data
  const qV = [cpackage === "All" ? undefined : cpackage];
  const qF = [cp_f];
  const queryc_nlo = makeQuery(qV, qF, `${nlo_status_f} >= 1`);

  const { data, isLoading } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, nlo_status_f, nloLayer],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: queryc_nlo.queryExpression(),
        featureLayer: [nloLayer],
      });

      //--- Pie chart data
      const chartData = await pieChartData({
        piechart: new ChartPieSeries(),
        qChart: queryc_nlo,
        layer: nloLayer,
        statusList: nlo_status_q,
        statusField: nlo_status_f,
        statisticField: nlo_status_f,
        statisticType: "count",
      });

      return {
        chartData: chartData[0] || [],
        totalNumber: chartData[1],
      };
    },
    staleTime: Infinity,
  });

  //--- Call chart data
  const chartData = data?.chartData || [];
  const totalNumber = data?.totalNumber || 0;

  useEffect(() => {
    maybeDisposeRoot(chartID);
    const root = rootSetter({ chartID: chartID });
    const chart = chartSetter({ root: root, y: -10 });

    const pieSeries = seriesSetter({
      chart: chart,
      root: root,
      categoryField: "category",
      valueField: "value",
      legendLabelText: "{category}",
      legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
      radius: 45,
      innerRadius: 28,
      // scale: 1.7,
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
    PieChartRenderType({
      render: new ChartPieSeriesRender(),
      chart,
      pieSeries: pieSeries,
      legend,
      root,
      qChart: queryc_nlo,
      q2Expression: undefined,
      status_field: nlo_status_f,
      view: arcgisScene?.view,
      updateChartPanelwidth: setChartPanelwidth,
      data: chartData,
      seriesScale: new_pieSeriesScale,
      innerLabel: "HOUSEHOLDS",
      innerLabelFontSize: new_pieInnerLabelFontSize,
      innerValueFontSize: new_pieInnerValueFontSize,
      layer: nloLayer,
      statusArray: nlo_status_q,
      bkg_color_switch: false,
      seriesFillHash: undefined,
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
          style={{
            paddingTop: "5px",
            paddingLeft: "5px",
            opacity: isLoading ? 0 : 1,
          }}
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
              opacity: isLoading ? 0 : 1,
            }}
          >
            {thousands_separators(totalNumber)}
          </dd>
        </dl>
      </div>
      <div
        style={{
          color: "gray",
          fontSize: `${new_asofDateSize}px`,
          float: "right",
          marginRight: "5px",
        }}
      >
        {asofdate ? `As of ${asofdate}` : `As of `}
      </div>
      <div
        id={chartID}
        style={{
          height: "70vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>
    </>
  );
}); // End of lotChartgs

export default ChartNlo;
