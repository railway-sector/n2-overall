/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useRef, useState, useEffect, memo, use, useMemo } from "react";
import { dateUpdate, fieldStatistic, thousands_separators } from "../query";
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
import QueryExpressionLayers from "query-layers-expression";

const CHART_ID = "nlo-chart";
const SERIES_SCALE = 280;
const INNER_VALUE_FONT_SIZE = "1.3rem";
const INNER_LABEL_FONT_SIZE = "0.45em";

//--------------------------//
//        useNloData        //
//--------------------------//
function useNloData(cpackage: string, statusField: string, baseFilter: any) {
  return useQuery<ChartResponse | any>({
    queryKey: [cpackage, statusField, nloLayer],
    queryFn: async () => {
      const q1 = new QueryExpressionLayers({
        ...baseFilter,
        qExpression: `${nlo_status_f} >= 1`,
      });

      queryDefinitionExpression({
        queryExpression: q1.queryExpression(),
        featureLayer: [nloLayer],
      });

      const baseArgs = {
        layer: nloLayer,
        statisticField: "OBJECTID",
        statisticType: "count" as const,
      };

      const [chartData, totalNumber] = await Promise.all([
        new ChartPieSeries({
          ...baseArgs,
          where: q1.queryExpression(),
          statusList: nlo_status_q,
          statusField: nlo_status_f,
        }).pieSeries(),

        fieldStatistic({
          ...baseArgs,
          where: new QueryExpressionLayers({ ...baseFilter }).queryExpression(),
        }),
      ]);

      return { chartData, totalNumber, q1 };
    },
    staleTime: Infinity,
  });
}

//--------------------------------------------//
//              Chart Component                //
//--------------------------------------------//

//--- memo prevents re-rendering the Component when the parent Component
//--- (ChartMain) is rendered.
const ChartNlo = memo(() => {
  const { cpackage } = use(MyContext);
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();

  //--- As of date
  const { data: asofdate = "" } = useQuery({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate("Non Land Owner"),
    staleTime: Infinity,
  });

  //--- Base filter
  const baseFilter = useMemo(
    () => ({
      qFields: [cp_f],
      qValues: [cpackage === "All" ? undefined : cpackage],
    }),
    [cpackage],
  );

  //--- Fetch data
  const { data, isLoading } = useNloData(cpackage, nlo_status_f, baseFilter);
  const chartData = data?.chartData ?? [];
  const totalNumber = data?.totalNumber ?? 0;

  // ************************************
  //  Responsive Chart parameters
  // ***********************************
  const new_fontSize = chartPanelwidth ? chartPanelwidth / 22.3 : 0;
  const new_valueSize = new_fontSize * 1.55;
  const new_imageSize = chartPanelwidth ? chartPanelwidth * 0.028 : 0;
  const new_asofDateSize = chartPanelwidth ? chartPanelwidth * 0.032 : 0;

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});

  useEffect(() => {
    const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
    maybeDisposeRoot(CHART_ID);
    const root = rootSetter({ chartID: CHART_ID });
    const chart = chartSetter({ root, y: -10 });

    const pieSeries = seriesSetter({
      chart,
      root,
      categoryField: "category",
      valueField: "value",
      legendLabelText: "{category}",
      legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
      radius: 45,
      innerRadius: 28,
    });
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    const legend = legendSetter({
      chart,
      root,
      centerX: 50,
      x: 50,
    });
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    new ChartPieSeriesRender({
      chart,
      pieSeries,
      legend,
      root,
      qChart: data?.q1,
      q2Expression: undefined,
      status_field: nlo_status_f,
      view: arcgisScene?.view,
      updateChartPanelwidth: setChartPanelwidth,
      data: chartData,
      seriesScale: SERIES_SCALE,
      innerLabel: "HOUSEHOLDS",
      innerLabelFontSize: INNER_LABEL_FONT_SIZE,
      innerValueFontSize: INNER_VALUE_FONT_SIZE,
      layer: nloLayer,
      statusArray: nlo_status_q,
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
        id={CHART_ID}
        style={{
          height: "70vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>
    </>
  );
});

export default ChartNlo;
