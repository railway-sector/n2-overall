import { useEffect, useRef, useState, use, memo, useMemo } from "react";
import { treeCuttingLayer } from "../layers";
import { thousands_separators, dateUpdate, fieldStatistic } from "../query";
import {
  cp_f,
  primaryLabelColor,
  treec_status_f,
  treec_status_q,
  valueLabelColor,
} from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { queryDefinitionExpression } from "../queryDefinition";
import { useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import {
  chartSetter,
  legendSetter,
  rootSetter,
  seriesSetter,
} from "../chartSetter";
import ChartPieSeriesRender from "chart-pie-series-render";
import ChartPieSeries from "chart-pie-series";
import QueryExpressionLayers from "query-layers-expression";

const CHART_ID = "pie-cut";
const SERIES_SCALE = 220;
const INNER_VALUE_FONT_SIZE = "0.75rem";
const INNER_LABEL_FONT_SIZE = "0.45em";

//--------------------------//
//      useTreeData         //
//--------------------------//
function useTreeData(cpackage: any, query: any) {
  return useQuery<ChartResponse | any>({
    queryKey: [cpackage, treec_status_f, treeCuttingLayer],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: query.queryExpression(),
        featureLayer: [treeCuttingLayer],
      });

      const baseArgs = {
        layer: treeCuttingLayer,
        statisticField: "OBJECTID",
        statisticType: "count" as const,
      };

      const [chartData, totalNumber] = await Promise.all([
        new ChartPieSeries({
          ...baseArgs,
          where: `${query.queryExpression()} AND ${treec_status_f} >= 1`,
          statusList: treec_status_q,
          statusField: treec_status_f,
        }).pieSeries(),

        fieldStatistic({ ...baseArgs, where: query.queryExpression() }),
      ]);

      return { chartData, totalNumber };
    },
  });
}

const ChartTreeCutting = memo(() => {
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const { cpackage } = use(MyContext);

  //--- As of date
  const { data: asofdate = "" } = useQuery({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate("Trees"),
    staleTime: Infinity,
  });

  //--- Query expression
  const q1 = useMemo(
    () =>
      new QueryExpressionLayers({
        qFields: [cp_f],
        qValues: [cpackage === "All" ? undefined : cpackage],
      }),
    [cpackage],
  );

  const { data, isLoading } = useTreeData(cpackage, q1);
  const chartData = data?.chartData ?? [];
  const totalNumber = data?.totalNumber ?? 0;

  // ************************************
  //  Responsive Chart parameters
  // ***********************************
  const new_fontSize = chartPanelwidth ? chartPanelwidth / 22.3 : 0;
  const new_valueSize = new_fontSize * 1.55;
  const new_imageSize = chartPanelwidth ? chartPanelwidth * 0.03 : 0;
  const new_asofDateSize = chartPanelwidth ? chartPanelwidth * 0.032 : 0;

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});

  useEffect(() => {
    const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
    const root = rootSetter({ chartID: CHART_ID });
    const chart = chartSetter({ root });
    chartRef.current = chart;

    const pieSeries = seriesSetter({
      chart,
      root,
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
      chart,
      root,
      centerX: 50,
      x: 50,
      marginTop: -15,
    });
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    new ChartPieSeriesRender({
      chart,
      pieSeries,
      legend,
      root,
      qChart: q1,
      q2Expression: undefined,
      status_field: treec_status_f,
      view: arcgisScene?.view,
      updateChartPanelwidth: setChartPanelwidth,
      data: chartData,
      seriesScale: SERIES_SCALE,
      innerLabel: "TREES",
      innerLabelFontSize: INNER_LABEL_FONT_SIZE,
      innerValueFontSize: INNER_VALUE_FONT_SIZE,
      layer: treeCuttingLayer,
      statusArray: treec_status_q,
      bkg_color_switch: false,
      seriesFillHash: undefined,
    }).chartDataRenderer();

    pieSeries.data.setAll(chartData);
    legend.data.setAll(pieSeries.dataItems);

    return () => root.dispose();
  }, [chartData]);

  return (
    <>
      <div
        style={{
          display: "flex",
          marginLeft: "15px",
          marginRight: "15px",
          justifyContent: "space-between",
          marginBottom: "0px",
        }}
      >
        <img
          src="https://EijiGorilla.github.io/Symbols/Tree_Logo.svg"
          alt="Land Logo"
          height={`${new_imageSize}%`}
          width={`${new_imageSize}%`}
          style={{ paddingTop: "5px", paddingLeft: "15px" }}
        />
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{
              color: primaryLabelColor,
              fontSize: `${new_fontSize}px`,
              marginRight: "35px",
            }}
          >
            TOTAL TREES
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
        id={CHART_ID}
        style={{
          height: "35vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>
    </>
  );
});

export default ChartTreeCutting;
