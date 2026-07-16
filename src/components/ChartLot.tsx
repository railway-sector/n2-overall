import { use, useEffect, useRef, useState } from "react";
import { handedOverLotLayer, lotLayer } from "../layers";
import {
  dateUpdate,
  fieldStatistic,
  highlightLot,
  highlightRemove,
  makeQuery,
  pieChartData,
  PieChartRenderType,
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

/// Draw chart
const LotChart = () => {
  const { cpackage } = use(MyContext);
  const arcgisScene = document.querySelector("arcgis-scene");

  const firstLoad = useRef<boolean>(true);
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const [urgentType, setUrgentType] = useState<any>("OFF");

  //--- As of date
  const { data: date } = useQuery<any>({
    queryKey: ["As_Of_Date"],
    queryFn: () => dateUpdate(monitorLists[0]),
    staleTime: Infinity,
  });
  const asofdate = date ?? "";

  //--- Common qValues and qFields for QueryExpressionLayers class
  const qV = [cpackage === "All" ? undefined : cpackage];
  const qF = [cp_f];
  const urgent_qe = urgentType === "OFF" ? undefined : lot_urgent_q;

  const queryc_lot = makeQuery(qV, qF, undefined, urgent_qe);
  const queryc_lot2 = makeQuery(qV, qF, `${lot_status_f} <> 8`);

  //--- Chart data
  const { data, isLoading } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, urgentType, lot_status_f, lotLayer, urgentType],
    queryFn: async () => {
      queryDefinitionExpression({
        queryExpression: queryc_lot.queryExpression(),
        featureLayer: [lotLayer, handedOverLotLayer],
      });

      const [chartData, totaln, total_aa, total_hoa, total_ho] =
        await Promise.all([
          //--- Chart data
          pieChartData({
            piechart: new ChartPieSeries(),
            qChart: queryc_lot,
            layer: lotLayer,
            statusList: lot_status_q,
            statusField: lot_status_f,
            statisticField: lot_status_f,
            statisticType: "count",
          }),

          //--- Total number of lots (public + private)
          fieldStatistic({
            qChart: queryc_lot.queryExpression(),
            layer: lotLayer,
            statisticField: lot_id_f,
            statisticType: "count",
          }),

          //--- Total affected area (m2)
          fieldStatistic({
            qChart: queryc_lot.queryExpression(),
            layer: lotLayer,
            statisticField: lot_aa_f,
            statisticType: "sum",
          }),

          //--- Total handed-over area (m2)
          fieldStatistic({
            qChart: queryc_lot.queryExpression(),
            layer: lotLayer,
            statisticField: lot_hoa_f,
            statisticType: "sum",
          }),

          //--- Total number of handed-over
          fieldStatistic({
            qChart: queryc_lot2.queryExpression(),
            layer: lotLayer,
            statisticField: lot_ho_f,
            statisticType: "sum",
          }),
        ]);

      //--- Handed-Over percent
      const perc_ho = Number(((total_ho / totaln) * 100).toFixed(0));

      //--- Only zoom on subsequent (non-initial) fetches
      if (!firstLoad.current) {
        zoomToLayer(lotLayer, arcgisScene);
      }
      firstLoad.current = false;

      return {
        chartData: chartData[0] || [],
        totaln: totaln,
        total_aa: total_aa,
        total_hoa: total_hoa,
        total_ho: total_ho,
        perc_ho: perc_ho,
      };
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const chartData = data?.chartData || [];
  const totaln = data?.totaln;
  const total_aa = data?.total_aa;
  const total_hoa = data?.total_hoa;
  const total_ho = data?.total_ho;
  const perc_ho = data?.perc_ho;

  //------------------------------------------------------------//
  //              Pie chart rendering declaration               //
  //------------------------------------------------------------//
  const new_fontSize = chartPanelwidth / 22.3;
  const new_valueSize = new_fontSize * 1.55;
  const new_imageSize = chartPanelwidth * 0.03;
  const new_sementedListSize = chartPanelwidth * 0.55;
  const new_asofDateSize = chartPanelwidth * 0.032;
  const new_pieSeriesScale = 220;
  const new_pieInnerValueFontSize = "1.1rem";
  const new_pieInnerLabelFontSize = "0.45em";

  const pieSeriesRef = useRef<any>(null);
  const legendRef = useRef<any>(null);
  const chartRef = useRef<any>(null);
  const chartID = "pie-two";

  const [hoCheckbox, setHoCheckbox] = useState<any>(false);

  useEffect(() => {
    urgentType === lot_urgent_switch[1]
      ? highlightLot(lotLayer, arcgisScene)
      : highlightRemove();
  }, [urgentType]);

  useEffect(() => {
    handedOverLotLayer.visible = hoCheckbox;
  }, [hoCheckbox]);

  // Chart data and
  useEffect(() => {
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
      scale: 1.7,
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
    legend.data.setAll(pieSeries.dataItems);

    // Render chart
    PieChartRenderType({
      render: new ChartPieSeriesRender(),
      chart,
      pieSeries: pieSeries,
      legend,
      root,
      qChart: queryc_lot,
      q2Expression: urgent_qe,
      status_field: lot_status_f,
      view: arcgisScene?.view,
      updateChartPanelwidth: setChartPanelwidth,
      data: chartData,
      seriesScale: new_pieSeriesScale,
      innerLabel: "PRIVATE LOTS",
      innerLabelFontSize: new_pieInnerLabelFontSize,
      innerValueFontSize: new_pieInnerValueFontSize,
      layer: lotLayer,
      statusArray: lot_status_q,
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
          marginTop: "3px",
          marginLeft: "15px",
          marginRight: "15px",
          justifyContent: "space-between",
          marginBottom: "5px",
        }}
      >
        <img
          src="https://eijigorilla.github.io/Symbols/Land_Acquisition/Land_Logo2.png"
          alt="Land Logo"
          height={`${new_imageSize}%`}
          width={`${new_imageSize}%`}
          style={{ paddingTop: "5px", paddingLeft: "5px" }}
        />
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{ color: primaryLabelColor, fontSize: `${new_fontSize}px` }}
          >
            Total Lots
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
            {thousands_separators(totaln)}
          </dd>
        </dl>
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{ color: primaryLabelColor, fontSize: `${new_fontSize}px` }}
          >
            Total Affected Area
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
            }}
          >
            {total_aa && thousands_separators(total_aa.toFixed(0))}
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

      <div style={{ display: "flex" }}>
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
          Super Urgent Lot:{" "}
        </div>
        <calcite-segmented-control
          scale="s"
          width="full"
          style={{
            width: `${new_sementedListSize}px`,
            // marginRight: "80px",
            // marginTop: "auto",
            marginBottom: "auto",
          }}
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
          marginRight: "5px",
          marginTop: "5px",
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
          marginBottom: "1%",
          marginTop: "5%",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>

      {/* Handed-Over */}
      <div
        style={{
          display: "flex",
          marginLeft: "15px",
          marginRight: "15px",
          justifyContent: "space-between",
          marginBottom: "10px",
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
            oncalciteCheckboxChange={() =>
              setHoCheckbox(hoCheckbox === false ? true : false)
            }
          ></calcite-checkbox>
        </div>
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{ color: primaryLabelColor, fontSize: `${new_fontSize}px` }}
          >
            Total Handed-Over
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
            {perc_ho}% ({thousands_separators(total_ho)})
          </dd>
        </dl>
        <dl style={{ alignItems: "center" }}>
          <dt
            style={{ color: primaryLabelColor, fontSize: `${new_fontSize}px` }}
          >
            Handed-Over Area
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
            }}
          >
            {total_hoa && thousands_separators(total_hoa.toFixed(0))}
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
