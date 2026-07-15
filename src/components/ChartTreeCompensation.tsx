import { useEffect, useRef, useState, use } from "react";
import { treeCompensationLayer } from "../layers";
import { cp_f, treem_status_f, treem_status_q } from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { queryDefinitionExpression } from "../queryDefinition";
import { useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import {
  chartSetter,
  legendSetter,
  maybeDisposeRoot,
  rootSetter,
  seriesSetter,
} from "../chartSetter";
import { makeQuery, pieChartData, PieChartRenderType } from "../query";
import ChartPieSeriesRender from "chart-pie-series-render";
import ChartPieSeries from "chart-pie-series";

const ChartTreeCompensation = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [_chartPanelwidth, setChartPanelwidth] = useState<any>();
  const { cpackage } = use(MyContext);

  const qV = [cpackage === "All" ? undefined : cpackage];
  const qF = [cp_f];
  const queryc_treem = makeQuery(qV, qF);

  const { data, isLoading } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, treem_status_f, treeCompensationLayer],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: queryc_treem.queryExpression(),
        featureLayer: [treeCompensationLayer],
      });
      //--- chart data
      const chartData = await pieChartData({
        piechart: new ChartPieSeries(),
        qChart: queryc_treem,
        layer: treeCompensationLayer,
        statusList: treem_status_q,
        statusField: treem_status_f,
        statisticField: treem_status_f,
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

  //---- Parameters
  const new_pieSeriesScale = 220;
  const new_pieInnerValueFontSize = "0.75rem";
  const new_pieInnerLabelFontSize = "0.45em";

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const chartID = "pie-compen";

  useEffect(() => {
    maybeDisposeRoot(chartID);
    const root = rootSetter({ chartID: chartID });
    const chart = chartSetter({ root: root });
    chartRef.current = chart;

    const pieSeries = seriesSetter({
      chart: chart,
      root: root,
      categoryField: "category",
      valueField: "value",
      legendLabelText: "{category}",
      legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
      radius: 45,
      innerRadius: 28,
      scale: 2,
    });
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    const legend = legendSetter({
      chart: chart,
      root: root,
      centerX: 50,
      x: 50,
      marginTop: -15,
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
      qChart: queryc_treem,
      q2Expression: undefined,
      status_field: treem_status_f,
      view: arcgisScene?.view,
      updateChartPanelwidth: setChartPanelwidth,
      data: chartData,
      seriesScale: new_pieSeriesScale,
      innerLabel: "TREES",
      innerLabelFontSize: new_pieInnerLabelFontSize,
      innerValueFontSize: new_pieInnerValueFontSize,
      layer: treeCompensationLayer,
      statusArray: treem_status_q,
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
        id={chartID}
        style={{
          height: "34vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>
    </>
  );
};

export default ChartTreeCompensation;
