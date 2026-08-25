import { use, useEffect, useMemo, useRef, useState } from "react";
import { handedOverLotLayer, lotLayer } from "../layers";
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
  monitorLists,
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
import { useQuery } from "@tanstack/react-query";
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
) {
  return useQuery<ChartResponse | any>({
    queryKey: [lot_status_f, lotLayer, cpackage, urgentQuery, baseFilter],
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
        featureLayer: [lotLayer, handedOverLotLayer],
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
        affectedArea,
        handedOverArea,
        handedOverNumber,
      ] = await Promise.all([
        new ChartPieSeries({
          ...baseArgs,
          statusList: lot_status_q,
          statusField: statusField,
          statisticField: statusField,
        }).pieSeries(),

        //--- Total number of lots (public + private)
        fieldStatistic({ ...baseArgs, statisticField: lot_id_f }),

        //--- Total affected area (m2)
        fieldStatistic({
          ...baseArgs2,
          statisticField: afaField,
        }),

        //--- Total handed-over area (m2)
        fieldStatistic({
          ...baseArgs2,
          statisticField: hoaField,
        }),

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
        affectedArea,
        handedOverArea,
        handedOverNumber,
        handedOverPercent,
        query: q1,
      };
    },
    staleTime: Infinity,
  });
}

/// Draw chart
const LotChart = () => {
  const { cpackage } = use(MyContext);
  const arcgisScene = document.querySelector("arcgis-scene");

  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const [urgentType, setUrgentType] = useState<any>(lot_urgent_switch[0]);

  //--- As of date
  const { data: date } = useQuery<any>({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate(monitorLists[0]),
    staleTime: Infinity,
  });
  const asofdate = date ?? "";

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
  );

  //--- Call chart data
  const chartData = data?.chartData || [];
  const totalNumber = data?.totalNumber || 0;
  const affectedArea = data?.affectedArea || 0;
  const handedOverArea = data?.handedOverArea || 0;
  const handedOverNumber = data?.handedOverNumber || 0;
  const handedOverPercent = data?.handedOverPercent || 0;

  //------------------------------------------------------------//
  //              Pie chart rendering declaration               //
  //------------------------------------------------------------//
  const new_fontSize = chartPanelwidth / 30;
  const new_valueSize = chartPanelwidth / 19;
  const new_sementedListSize = chartPanelwidth * 0.55;
  const new_asofDateSize = chartPanelwidth * 0.03;
  const seriesScale = 220;
  const innerValueFontSize = "1.1rem";
  const innerLabelFontSize = "0.45em";

  const pieSeriesRef = useRef<any>(null);
  const legendRef = useRef<any>(null);
  const chartRef = useRef<any>(null);
  const chartID = "pie-two";

  const [hoCheckbox, setHoCheckbox] = useState<any>(false);

  useEffect(() => {
    urgentType === lot_urgent_switch[1]
      ? highlightLot({ layer: lotLayer, view: arcgisScene, qe: urgent_qe })
      : highlightRemove();
  }, [urgentType]);

  useEffect(() => {
    handedOverLotLayer.visible = hoCheckbox;
  }, [hoCheckbox]);

  // Chart data and
  const zoomFiltersRef = useRef(`${cpackage}`);

  useEffect(() => {
    //--- Zoom after 1st render
    const currentZoomFilters = `${cpackage}`;

    if (currentZoomFilters !== zoomFiltersRef.current) {
      zoomFiltersRef.current = currentZoomFilters;
      zoomToLayer(lotLayer, arcgisScene?.view);
    }

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
    });
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    // Legend
    const legend = legendSetter({
      chart: chart,
      root: root,
      centerX: 50,
      x: 50,
    });
    legendRef.current = legend;
    legend.setAll({ marginTop: -25 });
    legend.data.setAll(pieSeries.dataItems);

    //--- Chart Render
    new ChartPieSeriesRender({
      chart,
      pieSeries,
      legend,
      root,
      qChart: data?.query,
      q2Expression: urgent_qe,
      status_field: lot_status_f,
      view: arcgisScene?.view,
      updateChartPanelwidth: setChartPanelwidth,
      data: chartData,
      seriesScale,
      innerLabel: "PRIVATE LOTS",
      innerLabelFontSize,
      innerValueFontSize,
      layer: lotLayer,
      statusArray: lot_status_q,
      bkg_color_switch: false,
      seriesFillHash: undefined,
    }).chartDataRenderer();

    if (!pieSeriesRef.current) return;
    pieSeriesRef.current?.data.setAll(chartData);
    legendRef.current?.data.setAll(pieSeriesRef.current.dataItems);

    return () => {
      root.dispose();
    };
  }, [chartData]);

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
          <dt
            style={{ color: primaryLabelColor, fontSize: `${new_fontSize}px` }}
          >
            TOTAL LOTS
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
              textAlign: "center",
            }}
          >
            {thousands_separators(totalNumber)}
          </dd>
        </dl>
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{ color: primaryLabelColor, fontSize: `${new_fontSize}px` }}
          >
            TOTAL AFFECTED AREA
          </dt>
          {/* #d3d3d3 */}
          <dd
            style={{
              color: valueLabelColor,
              fontSize: `${new_valueSize}px`,
              fontFamily: "calibri",
              lineHeight: "1.2",
              margin: "auto",
              fontWeight: "bold",
              opacity: isLoading ? 0 : 1,
              textAlign: "center",
            }}
          >
            {thousands_separators(affectedArea.toFixed(0))}
            <label
              style={{ fontWeight: "normal", fontSize: `${new_fontSize}px` }}
            >
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
            fontSize: `${new_fontSize}px`,
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
          style={{ width: `${new_sementedListSize}px`, marginBottom: "auto" }}
          oncalciteSegmentedControlChange={(event: any) =>
            setUrgentType(event.target.selectedItem.id)
          }
        >
          {urgentType &&
            lot_urgent_switch.map((priority, index) => {
              return (
                <calcite-segmented-control-item
                  {...(urgentType === priority ? { checked: true } : {})}
                  key={index}
                  value={priority}
                  id={priority}
                >
                  {priority}
                </calcite-segmented-control-item>
              );
            })}
        </calcite-segmented-control>
      </div>

      <div
        style={{
          color: "gray",
          fontSize: `${new_asofDateSize}px`,
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
          <dt
            style={{ color: primaryLabelColor, fontSize: `${new_fontSize}px` }}
          >
            TOTAL HANDED-OVER
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
              textAlign: "center",
            }}
          >
            {handedOverPercent}% ({thousands_separators(handedOverNumber)})
          </dd>
        </dl>
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{ color: primaryLabelColor, fontSize: `${new_fontSize}px` }}
          >
            HANDED-OVER AREA
          </dt>
          {/* #d3d3d3 */}
          <dd
            style={{
              color: valueLabelColor,
              fontSize: `${new_valueSize}px`,
              fontFamily: "calibri",
              lineHeight: "1.2",
              margin: "auto",
              fontWeight: "bold",
              opacity: isLoading ? 0 : 1,
              textAlign: "center",
            }}
          >
            {thousands_separators(handedOverArea.toFixed(0))}
            <label
              style={{ fontWeight: "normal", fontSize: `${new_fontSize}px` }}
            >
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
}; // End of lotChartgs

export default LotChart;
