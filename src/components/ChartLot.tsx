import { use, useEffect, useRef, useState } from "react";
import {
  handedOverLotLayer,
  lotLayer,
  queryc_lot2,
  queryc_lot,
} from "../layers";
import {
  dateUpdate,
  highlightLot,
  highlightRemove,
  thousands_separators,
  zoomToLayer,
} from "../query";
import "@esri/calcite-components/dist/components/calcite-segmented-control";
import "@esri/calcite-components/dist/components/calcite-segmented-control-item";
import "@esri/calcite-components/dist/components/calcite-checkbox";
import {
  affectedAreaField,
  lotHandedOverAreaField,
  lotHandedOverField,
  lotIdField,
  lotStatusColor,
  lotStatusField,
  lotStatusQuery,
  primaryLabelColor,
  querySuperUrgent,
  updatedDateCategoryNames,
  urgent_switch,
  valueLabelColor,
} from "../uniqueValues";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { pieChartStatusData, fieldStatistic } from "../chartGenerator";
import { chartRenderer } from "../chartRenderer";
import { queryDefinitionExpression } from "../queryDefinition";
import {
  chartSetter,
  legendSetter,
  rootSetter,
  seriesSetter,
} from "../chartSetter";
import { dateDisplayKeys } from "../interfaceKeys";
import { useQuery } from "@tanstack/react-query";
import type { DisplayDates, ChartResponse } from "../interfaceKeys";

/// Draw chart
const LotChart = () => {
  const arcgisScene = document.querySelector("arcgis-scene");
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const [urgentType, setUrgentType] = useState<any>("OFF");
  const { cpackage } = use(MyContext);

  //--- 0. As of date
  const { data: dates } = useQuery<DisplayDates | any>({
    queryKey: [dateDisplayKeys.selected, updatedDateCategoryNames[0]],
    queryFn: () => dateUpdate(updatedDateCategoryNames[0]),
    select: (response) => {
      return {
        asOfDate: response[0][0],
        daysPass: response[0][1],
      };
    },
    staleTime: Infinity,
  });

  //--- Chart data
  const { data } = useQuery<ChartResponse | any>({
    queryKey: [cpackage, urgentType, lotStatusField, lotLayer, urgentType],
    queryFn: async () => {
      const qe_urgent = urgentType === "OFF" ? undefined : querySuperUrgent;

      queryc_lot.qValues = [cpackage === "All" ? undefined : cpackage];
      queryc_lot.q2Expression = qe_urgent;

      queryDefinitionExpression({
        queryExpression: queryc_lot.queryExpression(),
        featureLayer: [lotLayer, handedOverLotLayer],
      });

      //--- chart data
      const chartData = await pieChartStatusData({
        qChart: queryc_lot.queryExpression(),
        layer: lotLayer,
        statusList: lotStatusQuery,
        statusColor: lotStatusColor,
        statusField: lotStatusField,
        statisticField: lotStatusField,
        statisticType: "count",
      });

      //--- total number of lots (public + private)
      const totaln = await fieldStatistic({
        qChart: queryc_lot.queryExpression(),
        layer: lotLayer,
        statisticField: lotIdField,
        statisticType: "count",
      });

      //-- Total affected area
      const total_aa = await fieldStatistic({
        qChart: queryc_lot.queryExpression(),
        layer: lotLayer,
        statisticField: affectedAreaField,
        statisticType: "sum",
      });

      //--- Total handed-over area
      const total_hoa = await fieldStatistic({
        qChart: queryc_lot.queryExpression(),
        layer: lotLayer,
        statisticField: lotHandedOverAreaField,
        statisticType: "sum",
      });

      //--- Total handed-over lots
      queryc_lot2.qValues = [cpackage === "All" ? undefined : cpackage];
      queryc_lot2.qExpression = `${lotStatusField} <> 8`;
      queryc_lot2.q2Expression = qe_urgent;

      const total_ho = await fieldStatistic({
        qChart: queryc_lot2.queryExpression(),
        layer: lotLayer,
        statisticField: lotHandedOverField,
        statisticType: "sum",
      });

      //--- Handed-Over percent
      const perc_ho = Number(((total_ho / totaln) * 100).toFixed(0));

      zoomToLayer(lotLayer, arcgisScene);

      return {
        chartData: chartData[0] || [],
        totaln: totaln,
        total_aa: total_aa,
        total_hoa: total_hoa,
        total_ho: total_ho,
        perc_ho: perc_ho,
      };
    },
    // staleTime: Infinity, // when this is defined, queryDefinitionExpression fails. segmented control?
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
    urgentType === urgent_switch[1]
      ? highlightLot(lotLayer, arcgisScene)
      : highlightRemove();
  }, [urgentType]);

  useEffect(() => {
    handedOverLotLayer.visible = hoCheckbox;
  }, [hoCheckbox]);

  // Chart data and
  useEffect(() => {
    const root = rootSetter({ chartID: chartID });
    const chart = chartSetter(root);
    chartRef.current = chart;

    const pieSeries = seriesSetter({
      chart: chart,
      root: root,
      categoryField: "category",
      valueField: "value",
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
    chartRenderer({
      chart: chart,
      pieSeries: pieSeries,
      legend: legend,
      root: root,
      qChart: queryc_lot,
      q2Expression: urgentType === "OFF" ? undefined : querySuperUrgent,
      status_field: lotStatusField,
      arcgisScene: arcgisScene,
      updateChartPanelwidth: setChartPanelwidth,
      data: chartData,
      pieSeriesScale: new_pieSeriesScale,
      pieInnerLabel: "PRIVATE LOTS",
      pieInnerLabelFontSize: new_pieInnerLabelFontSize,
      pieInnerValueFontSize: new_pieInnerValueFontSize,
      layer: lotLayer,
      statusArray: lotStatusQuery,
    });

    // Dispose root
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
          src="https://EijiGorilla.github.io/Symbols/Land_logo.png"
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
            urgent_switch.map((priority, index) => {
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
          color: dates?.daysPass === true ? "red" : "gray",
          fontSize: `${new_asofDateSize}px`,
          float: "right",
          marginRight: "5px",
          marginTop: "5px",
        }}
      >
        {!dates?.asOfDate ? "" : "As of " + dates?.asOfDate}
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
