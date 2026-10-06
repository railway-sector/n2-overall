/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useRef, useState, useEffect, memo, use, useMemo } from "react";
import {
  dateUpdate,
  fieldStatistic,
  thousands_separators,
  zoomToLayer,
} from "../query";
import {
  nlo_status_f,
  primaryLabelColor,
  nlo_status_q,
  valueLabelColor,
  cp_f,
  str_occup_f,
} from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { nloLayer, relocatedLayer } from "../layers";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import {
  chartSetter,
  legendSetter,
  rootSetter,
  seriesSetter,
} from "../chartSetter";
import ChartPieSeriesRender from "chart-pie-series-render";
import { MyContext } from "../contexts/MyContext";
import ChartPieSeries from "chart-pie-series";
import { queryDefinitionExpression } from "../queryDefinition";
import QueryExpressionLayers from "query-layers-expression";
import { StatBlock } from "./statBlock";

//--------------------------//
//        useNloData        //
//--------------------------//
function useNloData(cpackage: string, statusField: string, baseFilter: any) {
  return useQuery<ChartResponse | any>({
    queryKey: [cpackage, statusField, nloLayer],
    queryFn: async () => {
      const baseArgs = {
        layer: nloLayer,
        statisticField: "OBJECTID",
        statisticType: "count" as const,
      };

      //-- Households with NLO query
      const q1 = new QueryExpressionLayers({
        ...baseFilter,
        qExpression: `${nlo_status_f} >= 1`,
      });

      queryDefinitionExpression({
        queryExpression: q1.queryExpression(),
        featureLayer: [nloLayer],
      });

      //--- Relocated Households query
      const q2 = new QueryExpressionLayers({
        ...baseFilter,
        qExpression: `${str_occup_f} = 1`,
      });

      queryDefinitionExpression({
        queryExpression: q2.queryExpression(),
        featureLayer: [relocatedLayer],
      });

      const [chartData, totalNumber, totalHouseholds, totalRelocated] =
        await Promise.all([
          new ChartPieSeries({
            ...baseArgs,
            where: q1.queryExpression(),
            statusList: nlo_status_q,
            statusField: nlo_status_f,
          }).pieSeries(),

          fieldStatistic({
            ...baseArgs,
            where: new QueryExpressionLayers({
              ...baseFilter,
            }).queryExpression(),
          }),

          fieldStatistic({ ...baseArgs, where: q1.queryExpression() }),
          fieldStatistic({ ...baseArgs, where: q2.queryExpression() }),
        ]);

      //--- Relocated percent
      const percRelocated = Number(
        ((totalRelocated / totalNumber) * 100).toFixed(0),
      );

      return {
        chartData,
        totalNumber,
        totalHouseholds,
        totalRelocated,
        percRelocated,
        q1,
      };
    },
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

//--------------------------------------------//
//              Chart Component                //
//--------------------------------------------//

//--- memo prevents re-rendering the Component when the parent Component
//--- (ChartMain) is rendered.
const ChartNlo = memo(() => {
  const { cpackage } = use(MyContext);

  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const [relocatedCheckBox, setRelocatedCheckBox] = useState<any>(false);

  //--- As of date
  const { data: asofdate = "" } = useQuery({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate("Non Land Owner"),
    staleTime: Infinity,
  });

  useEffect(() => {
    relocatedLayer.visible = relocatedCheckBox;

    if (!relocatedCheckBox) return;
    zoomToLayer(relocatedLayer, arcgisScene?.view);
  }, [relocatedCheckBox]);

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
  const totalHouseholds = thousands_separators(data?.totalHouseholds ?? 0);
  const totalRelocated = thousands_separators(data?.totalRelocated ?? 0);
  const percRelocated = data?.percRelocated ?? 0;

  // ************************************
  //  Responsive Chart parameters
  // ***********************************
  const fontSize = chartPanelwidth ? chartPanelwidth / 22.3 : 0;
  const valueSize = chartPanelwidth / 19;
  const imageSize = chartPanelwidth ? chartPanelwidth * 0.028 : 0;
  const seriesScale = 220;
  const asofDateSize = chartPanelwidth ? chartPanelwidth * 0.032 : 0;
  const innerValueFontSize = "1.3rem";
  const innerLabelFontSize = "0.7em";

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const renderRef = useRef<ChartPieSeriesRender | null>(null);
  const chartID = "nlo-chart";

  //--- Keep click-handler-relevant values fresh without rebuilding the
  //    chart. view lives here too (not passed statically to the
  //    renderer) since arcgis-scene's view may not be ready on first
  //    mount.
  const configRef = useRef({
    qChart: data?.q1,
    q2Expression: undefined,
    status_field: nlo_status_f,
    view: arcgisScene?.view,
  });

  useEffect(() => {
    configRef.current = {
      qChart: data?.q1,
      q2Expression: undefined,
      status_field: nlo_status_f,
      view: arcgisScene?.view,
    };
  }, [data, nlo_status_f, arcgisScene]);

  //--- Pie Chart Renderer - created ONCE (mount only)
  useEffect(() => {
    const root = rootSetter({ chartID: chartID });
    const chart = chartSetter({ root: root });

    const pieSeries = seriesSetter({
      chart: chart,
      root: root,
      categoryField: "category",
      valueField: "value",
      legendLabelText: "{category}",
      legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
      radius: 40,
      innerRadius: 28,
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
    legend.setAll({ marginBottom: 30 });
    legend.data.setAll(pieSeries.dataItems);

    //--- NOTE: no `view` here — it's read live from configRef.current
    //    inside chartrender.ts, since arcgis-scene may not have a
    //    ready `.view` yet at this point.
    const renderer = new ChartPieSeriesRender({
      chart,
      pieSeries,
      legend,
      root,
      configRef,
      updateChartPanelwidth: setChartPanelwidth,
      data: [],
      seriesScale,
      innerValue: totalHouseholds,
      innerLabel: "HOUSEHOLDS",
      innerLabelColor: "#ffffff",
      innerLabelFontSize,
      innerValueFontSize,
      layer: nloLayer,
      statusArray: nlo_status_q,
      seriesFillHash: undefined,
    });
    renderRef.current = renderer;
    renderer.chartDataRenderer();

    return () => {
      root.dispose();
      renderRef.current = null;
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-once — do not add dependencies here

  //--- Push new data / inner value / affected-area figures into the
  //    already-mounted chart. No dispose, no rebuild -> no blink.
  //    NOTE: affectedAreaValue is NOT called here directly — it's
  //    registered once inside chartrender.ts and reads live data via
  //    closures, which updateData() keeps in sync. Calling it here on
  //    every render would both miss the first paint and stack
  //    duplicate adapters.
  useEffect(() => {
    if (!renderRef.current) return;
    renderRef.current.updateData(chartData, totalHouseholds, nlo_status_q);
  }, [chartData, totalHouseholds, nlo_status_q]);

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
          height={`${imageSize}%`}
          width={`${imageSize}%`}
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
              fontSize: `${fontSize}px`,
              marginRight: "20px",
            }}
          >
            TOTAL HOUSEHOLDS
          </dt>
          <dd
            style={{
              color: valueLabelColor,
              fontSize: `${valueSize}px`,
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
          fontSize: `${asofDateSize}px`,
          float: "right",
          marginRight: "5px",
        }}
      >
        {asofdate ? `As of ${asofdate}` : `As of `}
      </div>
      <div
        id={chartID}
        style={{
          height: "60vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>

      {/* Total Relocated*/}
      <div
        style={{
          display: "flex",
          marginLeft: "3%",
          marginRight: "5%",
          justifyContent: "center",
          gap: "25%",
          marginTop: "1%",
        }}
      >
        <div
          style={{ backgroundColor: "green", height: "0", marginTop: "13px" }}
        >
          <calcite-checkbox
            name="relocated-households-checkbox"
            label="VIEW"
            scale="l"
            oncalciteCheckboxChange={() =>
              setRelocatedCheckBox((prev: any) => !prev)
            }
          ></calcite-checkbox>
        </div>
        <StatBlock
          label="TOTAL RELOCATED"
          value={`${percRelocated}% (${totalRelocated})`}
          fontSize={fontSize}
          valueSize={valueSize}
          isLoading={isLoading}
          textAlign="center"
        />
      </div>
    </>
  );
});

export default ChartNlo;
