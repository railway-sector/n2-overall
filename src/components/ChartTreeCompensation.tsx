import { useEffect, useRef, use, useState } from "react";
import {
  piechart_tcomp,
  queryc_treecomp,
  treeCompensationLayer,
} from "../layers";
import {
  statusTreeCompensationChart,
  treeCompen_status_field,
} from "../uniqueValues";
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
import { pieChartData } from "../query";
import ChartPieSeriesRender from "chart-pie-series-render";

const ChartTreeCompensation = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [_chartPanelwidth, setChartPanelwidth] = useState<any>();
  const { cpackage } = use(MyContext);

  const { data, isLoading } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, treeCompen_status_field, treeCompensationLayer],
    queryFn: async () => {
      queryc_treecomp.qValues = [cpackage === "All" ? undefined : cpackage];

      queryDefinitionExpression({
        queryExpression: queryc_treecomp.queryExpression(),
        featureLayer: [treeCompensationLayer],
      });

      //--- chart data
      const chartData = await pieChartData({
        piechart: piechart_tcomp,
        qChart: queryc_treecomp,
        layer: treeCompensationLayer,
        statusList: statusTreeCompensationChart,
        statusField: treeCompen_status_field,
        statisticField: treeCompen_status_field,
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
    const crender = new ChartPieSeriesRender(
      chart,
      pieSeries,
      legend,
      root,
      queryc_treecomp,
      undefined,
      treeCompen_status_field,
      arcgisScene?.view,
      setChartPanelwidth,
      chartData,
      new_pieSeriesScale,
      "TREES",
      new_pieInnerLabelFontSize,
      new_pieInnerValueFontSize,
      treeCompensationLayer,
      statusTreeCompensationChart,
    );
    crender.chartDataRenderer();

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
