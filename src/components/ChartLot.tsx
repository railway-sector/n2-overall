import { use, useEffect, useMemo, useRef, useState } from "react";
import {
  handedOverLotLayer,
  lotLayer,
  lotPartialPaymentLayer,
  lotPteLayer,
} from "../layers";
import {
  dateUpdate,
  fieldStatistic,
  highlightLot,
  highlightRemove,
  thousands_separators,
  zoomToLayer,
} from "../query";
import "@esri/calcite-components/dist/components/calcite-segmented-control";
import "@esri/calcite-components/dist/components/calcite-segmented-control-item";
import "@esri/calcite-components/dist/components/calcite-checkbox";
import {
  lot_aa_f,
  lot_hoa_f,
  lot_ho_f,
  lot_id_f,
  lot_status_f,
  lot_status_q,
  primaryLabelColor,
  valueLabelColor,
  cp_f,
  lot_urgent_q,
  lot_urgent_switch,
} from "../uniqueValues";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { queryDefinitionExpression } from "../queryDefinition";
import {
  chartSetter,
  legendSetter,
  rootSetter,
  seriesSetter,
} from "../chartSetter";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ChartResponse } from "../interfaceKeys";
import ChartPieSeriesRender from "chart-pie-series-render";
import ChartPieSeries from "chart-pie-series";
import QueryExpressionLayers from "query-layers-expression";

//--------------------------//
//      useLotData          //
//--------------------------//
function useLotData(
  cpackage: string,
  statusField: string,
  hoaField: string,
  afaField: string,
  hoField: string,
  baseFilter: any,
  urgentQuery: any,
  lot_status_q2: any,
) {
  return useQuery<ChartResponse | any>({
    queryKey: [
      statusField,
      lot_status_q2,
      hoaField,
      lotLayer,
      cpackage,
      urgentQuery,
      baseFilter,
    ],
    queryFn: async () => {
      const q1 = new QueryExpressionLayers({
        ...baseFilter,
        qExpression: undefined,
        q2Expression: urgentQuery,
      });

      const q2 = new QueryExpressionLayers({
        ...baseFilter,
        qExpression: `${statusField} <> 8`,
        q2Expression: urgentQuery,
      });

      queryDefinitionExpression({
        queryExpression: q1.queryExpression(),
        featureLayer: [
          lotLayer,
          handedOverLotLayer,
          lotPartialPaymentLayer,
          lotPteLayer,
        ],
      });

      const baseArgs = {
        where: q1.queryExpression(),
        layer: lotLayer,
        statisticType: "count" as const,
      };

      const baseArgs2 = {
        where: q1.queryExpression(),
        layer: lotLayer,
        statisticType: "sum" as const,
      };

      const [
        chartData,
        totalNumber,
        privateLots,
        affectedArea,
        handedOverArea,
        handedOverNumber,
      ] = await Promise.all([
        new ChartPieSeries({
          ...baseArgs,
          statusList: lot_status_q2,
          statusField: statusField,
          statisticField: statusField,
        }).pieSeries(),

        //--- Total number of lots (public + private)
        fieldStatistic({ ...baseArgs, statisticField: lot_id_f }),

        //--- Total number of private lots
        fieldStatistic({
          where: `${q1.queryExpression()} AND ${statusField} >= 1`,
          layer: lotLayer,
          statisticField: statusField,
          statisticType: "count",
        }),

        //--- Total affected area (m2)
        fieldStatistic({ ...baseArgs2, statisticField: afaField }),

        //--- Total handed-over area (m2)
        fieldStatistic({ ...baseArgs2, statisticField: hoaField }),

        //--- Total number of handed-over
        fieldStatistic({
          where: q2.queryExpression(),
          layer: lotLayer,
          statisticField: hoField,
          statisticType: "sum",
        }),
      ]);

      //--- Handed-Over percent
      const handedOverPercent = Number(
        ((handedOverNumber / totalNumber) * 100).toFixed(0),
      );

      return {
        chartData,
        totalNumber,
        privateLots,
        affectedArea,
        handedOverArea,
        handedOverNumber,
        handedOverPercent,
        query: q1,
      };
    },
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/// Draw chart
const LotChart = () => {
  const { cpackage } = use(MyContext);
  const arcgisScene = document.querySelector("arcgis-scene");

  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const [urgentType, setUrgentType] = useState<any>(lot_urgent_switch[0]);
  const [hoCheckbox, setHoCheckbox] = useState<any>(false);

  //--- "With CNO" relabel — memoized since it's passed into the query key/args
  const lot_status_q2 = useMemo(
    () =>
      lot_status_q.map((item) =>
        item.value === 6 ? { ...item, category: "With CNO" } : item,
      ),
    [],
  );

  //--- As of date
  const { data: asofdate = "" } = useQuery({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate("Land Acquisition"),
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

  const urgent_qe = urgentType === "OFF" ? undefined : lot_urgent_q;

  //--- Chart data
  const { data, isLoading } = useLotData(
    cpackage,
    lot_status_f,
    lot_hoa_f,
    lot_aa_f,
    lot_ho_f,
    baseFilter,
    urgent_qe,
    lot_status_q2,
  );

  const chartData = data?.chartData ?? [];
  const totalNumber = data?.totalNumber ?? 0;
  const privateLots = thousands_separators(data?.privateLots) ?? 0;
  const affectedArea = data?.affectedArea ?? 0;
  const handedOverArea = data?.handedOverArea ?? 0;
  const handedOverNumber = data?.handedOverNumber ?? 0;
  const handedOverPercent = data?.handedOverPercent ?? 0;

  // ************************************
  //  Responsive Chart parameters
  // ***********************************
  const fontSize = chartPanelwidth ? chartPanelwidth / 30 : 0;
  const valueSize = chartPanelwidth ? chartPanelwidth / 19 : 0;
  const sementedListSize = chartPanelwidth ? chartPanelwidth * 0.55 : 0;
  const asofDateSize = chartPanelwidth ? chartPanelwidth * 0.03 : 0;
  const seriesScale = 220;
  const innerValueFontSize = "1.1rem";
  const innerLabelFontSize = "0.45em";

  const pieSeriesRef = useRef<any>(null);
  const legendRef = useRef<any>(null);
  const chartRef = useRef<any>(null);
  const rendererRef = useRef<ChartPieSeriesRender | null>(null);
  const chartID = "pie-two";

  //--- Highlight super-urgent lots
  useEffect(() => {
    if (urgentType === lot_urgent_switch[1]) {
      highlightLot({ layer: lotLayer, view: arcgisScene, qe: urgent_qe });
    } else {
      highlightRemove();
    }
  }, [urgentType]);

  //--- Toggle handed-over layer visibility
  useEffect(() => {
    handedOverLotLayer.visible = hoCheckbox;
  }, [hoCheckbox]);

  //--- Zoom on package change, then draw chart
  const zoomFiltersRef = useRef(`${cpackage}`);

  useEffect(() => {
    const currentZoomFilters = `${cpackage}`;

    if (currentZoomFilters !== zoomFiltersRef.current) {
      zoomFiltersRef.current = currentZoomFilters;
      zoomToLayer(lotLayer, arcgisScene?.view);
    }
  }, [chartData]);

  //--- Keep click-handler-relevant values fresh without rebuilding the
  //    chart. view lives here too (not passed statically to the
  //    renderer) since arcgis-scene's view may not be ready on first
  //    mount.
  const configRef = useRef({
    qChart: data?.query,
    q2Expression: urgent_qe,
    status_field: lot_status_f,
    view: arcgisScene?.view,
  });
  useEffect(() => {
    configRef.current = {
      qChart: data?.query,
      q2Expression: urgent_qe,
      status_field: lot_status_f,
      view: arcgisScene?.view,
    };
  }, [data, urgent_qe, lot_status_f, arcgisScene]);

  //---  Pie Chart Renderer — created ONCE (mount only)
  useEffect(() => {
    const root = rootSetter({ chartID: chartID });
    const chart = chartSetter({ root: root, y: 10 });
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
    });
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    const legend = legendSetter({
      chart,
      root,
      centerX: 50,
      x: 50,
      scale: 1.0,
    });
    legendRef.current = legend;
    legend.setAll({ marginBottom: 10 });
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
      innerValue: privateLots,
      innerLabel: "PRIVATE LOTS",
      innerLabelFontSize,
      innerValueFontSize,
      layer: lotLayer,
      statusArray: lot_status_q2,
      bkg_color_switch: false,
      seriesFillHash: undefined,
    });
    rendererRef.current = renderer;
    rendererRef.current.chartDataRenderer();

    return () => {
      root.dispose();
      rendererRef.current = null;
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
    if (!rendererRef.current) return;
    rendererRef.current.updateData(
      chartData,
      privateLots,
      lot_status_q2.map((f: any) => f.category),
    );
  }, [chartData, privateLots]);

  return (
    <>
      <div
        style={{
          display: "flex",
          marginTop: "3px",
          marginLeft: "35px",
          justifyContent: "center",
          gap: "65px",
          marginBottom: "5px",
        }}
      >
        <dl style={{ alignItems: "center" }}>
          <dt style={{ color: primaryLabelColor, fontSize: `${fontSize}px` }}>
            TOTAL LOTS
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
              textAlign: "center",
            }}
          >
            {thousands_separators(totalNumber)}
          </dd>
        </dl>
        <dl style={{ alignItems: "center" }}>
          <dt style={{ color: primaryLabelColor, fontSize: `${fontSize}px` }}>
            TOTAL AFFECTED AREA
          </dt>
          <dd
            style={{
              color: valueLabelColor,
              fontSize: `${valueSize}px`,
              fontFamily: "calibri",
              lineHeight: "1.2",
              margin: "auto",
              fontWeight: "bold",
              opacity: isLoading ? 0 : 1,
              textAlign: "center",
            }}
          >
            {thousands_separators(affectedArea.toFixed(0))}
            <label style={{ fontWeight: "normal", fontSize: `${fontSize}px` }}>
              {" "}
              m
            </label>
            <label style={{ verticalAlign: "super", fontSize: "0.6rem" }}>
              2
            </label>
          </dd>
        </dl>
      </div>

      <div style={{ display: "flex", marginTop: "2%", gap: "20px" }}>
        <div
          style={{
            marginLeft: "15px",
            fontSize: `${fontSize}px`,
            color: primaryLabelColor,
            marginTop: "auto",
            marginBottom: "auto",
            marginRight: "10px",
          }}
        >
          SUPER URGENT LOT:{" "}
        </div>
        <calcite-segmented-control
          scale="s"
          width="full"
          style={{ width: `${sementedListSize}px`, marginBottom: "auto" }}
          oncalciteSegmentedControlChange={(event: any) =>
            setUrgentType(event.target.selectedItem.id)
          }
        >
          {urgentType &&
            lot_urgent_switch.map((priority, index) => (
              <calcite-segmented-control-item
                {...(urgentType === priority ? { checked: true } : {})}
                key={index}
                value={priority}
                id={priority}
              >
                {priority}
              </calcite-segmented-control-item>
            ))}
        </calcite-segmented-control>
      </div>

      <div
        style={{
          color: "gray",
          fontSize: `${asofDateSize}px`,
          float: "right",
          marginRight: "1%",
          marginTop: "1.5%",
          opacity: isLoading ? 0 : 1,
        }}
      >
        {asofdate ? `As of ${asofdate}` : `As of `}
      </div>

      {/* Lot Chart */}
      <div
        id={chartID}
        style={{
          width: "100%",
          height: "57vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginTop: "2%",
          marginBottom: "1%",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>

      {/* Handed-Over */}
      <div
        style={{
          display: "flex",
          marginLeft: "3%",
          marginRight: "5%",
          justifyContent: "space-between",
          marginTop: "1.5%",
        }}
      >
        <div
          style={{
            backgroundColor: "green",
            height: "0",
            marginTop: "13px",
            marginRight: "-10px",
          }}
        >
          <calcite-checkbox
            name="handover-checkbox"
            label="VIEW"
            scale="l"
            oncalciteCheckboxChange={() => setHoCheckbox((prev: any) => !prev)}
          ></calcite-checkbox>
        </div>
        <dl style={{ alignItems: "center" }}>
          <dt style={{ color: primaryLabelColor, fontSize: `${fontSize}px` }}>
            TOTAL HANDED-OVER
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
              textAlign: "center",
            }}
          >
            {handedOverPercent}% ({thousands_separators(handedOverNumber)})
          </dd>
        </dl>
        <dl style={{ alignItems: "center" }}>
          <dt style={{ color: primaryLabelColor, fontSize: `${fontSize}px` }}>
            HANDED-OVER AREA
          </dt>
          <dd
            style={{
              color: valueLabelColor,
              fontSize: `${valueSize}px`,
              fontFamily: "calibri",
              lineHeight: "1.2",
              margin: "auto",
              fontWeight: "bold",
              opacity: isLoading ? 0 : 1,
              textAlign: "center",
            }}
          >
            {thousands_separators(handedOverArea.toFixed(0))}
            <label style={{ fontWeight: "normal", fontSize: `${fontSize}px` }}>
              {" "}
              m
            </label>
            <label style={{ verticalAlign: "super", fontSize: "0.6rem" }}>
              2
            </label>
          </dd>
        </dl>
      </div>
    </>
  );
};

export default LotChart;
