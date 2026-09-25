import { memo, use, useEffect, useMemo, useRef, useState } from "react";
import { dateUpdate, fieldStatistic, thousands_separators } from "../query";
import "../index.css";
import { str_status_q, str_status_f, cp_f } from "../uniqueValues";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import {
  demolishedStrucLayer,
  occupancyLayer,
  structureLayer,
} from "../layers";
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
import StatBlock from "./statBlock";

//--------------------------//
//     useStructureData     //
//--------------------------//
function useStructureData(
  cpackage: string,
  statusField: string,
  baseFilter: any,
) {
  return useQuery<ChartResponse | any>({
    queryKey: [cpackage, statusField, structureLayer],
    queryFn: async () => {
      const q1 = new QueryExpressionLayers({
        ...baseFilter,
        qExpression: `${statusField} >= 1`,
      });

      queryDefinitionExpression({
        queryExpression: q1.queryExpression(),
        featureLayer: [structureLayer, occupancyLayer],
      });

      const baseArgs = {
        layer: structureLayer,
        statisticField: "OBJECTID",
        statisticType: "count" as const,
      };

      const [chartData, totalNumber, totalDemolish] = await Promise.all([
        new ChartPieSeries({
          ...baseArgs,
          where: q1.queryExpression(),
          statusList: str_status_q,
          statusField: statusField,
        }).pieSeries(),

        fieldStatistic({
          ...baseArgs,
          where: new QueryExpressionLayers({ ...baseFilter }).queryExpression(),
        }),

        fieldStatistic({
          ...baseArgs,
          where: new QueryExpressionLayers({
            ...baseFilter,
            qExpression: "Demolition = 1",
          }).queryExpression(),
        }),
      ]);

      //--- Demolished percent
      const percDemolished = Number(
        ((totalDemolish / totalNumber) * 100).toFixed(0),
      );

      return { chartData, totalNumber, totalDemolish, percDemolished, q1 };
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
const ChartStructure = memo(() => {
  const { cpackage } = use(MyContext);

  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const [demolishCheckBox, setDemolishCheckBox] = useState<any>(false);

  //--- As of date
  const { data: asofdate = "" } = useQuery({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate("Structure"),
    staleTime: Infinity,
  });

  useEffect(() => {
    demolishedStrucLayer.visible = demolishCheckBox;
  }, [demolishCheckBox]);

  //--- Base filter
  const baseFilter = useMemo(
    () => ({
      qFields: [cp_f],
      qValues: [cpackage === "All" ? undefined : cpackage],
    }),
    [cpackage],
  );

  //--- Fetch data
  const { data, isLoading } = useStructureData(
    cpackage,
    str_status_f,
    baseFilter,
  );
  const chartData = data?.chartData ?? [];
  const totalNumber = thousands_separators(data?.totalNumber) || 0;
  const totalDemolish = data?.totalDemolish ?? 0;
  const percDemolished = data?.percDemolished ?? 0;

  // ************************************
  //  Responsive Chart parameters
  // ***********************************
  const fontSize = chartPanelwidth ? chartPanelwidth / 22.3 : 0;
  const valueSize = fontSize * 1.55;
  const imageSize = chartPanelwidth ? chartPanelwidth * 0.03 : 0;
  const asofDateSize = chartPanelwidth ? chartPanelwidth * 0.032 : 0;
  const seriesScale = 220;
  const innerValueFontSize = "1.1rem";
  const innerLabelFontSize = "0.45em";

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const renderRef = useRef<ChartPieSeriesRender | null>(null);
  const chartID = "structure-chart";

  //--- Keep click-handler-relevant values fresh without rebuilding the
  //    chart. view lives here too (not passed statically to the
  //    renderer) since arcgis-scene's view may not be ready on first
  //    mount.
  const configRef = useRef({
    qChart: data?.q1,
    q2Expression: undefined,
    status_field: str_status_f,
    view: arcgisScene?.view,
  });

  useEffect(() => {
    configRef.current = {
      qChart: data?.q1,
      q2Expression: undefined,
      status_field: str_status_f,
      view: arcgisScene?.view,
    };
  }, [data, str_status_f, arcgisScene]);

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
      innerValue: totalNumber,
      innerLabel: "STRUCTURES",
      innerLabelFontSize,
      innerValueFontSize,
      layer: structureLayer,
      statusArray: str_status_q,
      bkg_color_switch: false,
      seriesFillHash: undefined,
    });
    renderRef.current = renderer;
    renderRef.current.chartDataRenderer();

    return () => {
      root.dispose();
      renderRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    renderRef.current.updateData(chartData, totalNumber, str_status_q);
  }, [chartData, totalNumber, str_status_q]);

  return (
    <>
      <div
        style={{
          display: "flex",
          marginLeft: "15px",
          marginRight: "15px",
          justifyContent: "center",
          gap: "25%",
        }}
      >
        <img
          src="https://EijiGorilla.github.io/Symbols/House_Logo.svg"
          alt="Structure Logo"
          height={`${imageSize}%`}
          width={`${imageSize}%`}
          style={{ paddingTop: "2px", opacity: isLoading ? 0 : 1 }}
        />
        <StatBlock
          label="TOTAL STRUCTURES"
          value={thousands_separators(totalNumber)}
          fontSize={fontSize}
          valueSize={valueSize}
          isLoading={isLoading}
          labelMarginRight="25px"
        />
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

      {/* Structure Chart */}
      <div
        id={chartID}
        style={{
          height: "60vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginTop: "2%",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>

      {/* Total Demolished structures */}
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
            name="demolished-structures-checkbox"
            label="VIEW"
            scale="l"
            oncalciteCheckboxChange={() =>
              setDemolishCheckBox((prev: any) => !prev)
            }
          ></calcite-checkbox>
        </div>
        <StatBlock
          label="TOTAL DEMOLISHED"
          value={`${percDemolished}% (${thousands_separators(totalDemolish)})`}
          fontSize={fontSize}
          valueSize={valueSize}
          isLoading={isLoading}
          textAlign="center"
        />
      </div>
    </>
  );
});

export default ChartStructure;
