import { use, useEffect, useRef, useState } from "react";
import {
  handedOverLotLayer,
  lotLayer,
  queryc,
  queryc2,
  queryc3,
} from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import {
  dateUpdate,
  highlightLot,
  highlightRemove,
  thousands_separators,
  zoomToLayer,
} from "../Query";
import "@esri/calcite-components/dist/components/calcite-segmented-control";
import "@esri/calcite-components/dist/components/calcite-segmented-control-item";
import "@esri/calcite-components/dist/components/calcite-checkbox";
import {
  affectedAreaField,
  cpField,
  cutoff_days,
  lotHandedOverAreaField,
  lotHandedOverField,
  lotIdField,
  lotStatusColor,
  lotStatusField,
  lotStatusQuery,
  primaryLabelColor,
  querySuperUrgent,
  superurgent_items,
  updatedDateCategoryNames,
  valueLabelColor,
} from "../uniqueValues";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";
import { pieChartStatusData, fieldStatistic } from "../ChartGenerator";
import { queryDefinitionExpression } from "../QueryExpression";
import { chartRenderer } from "../ChartRenderer";

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

///*** Others */
/// Draw chart
const LotChart = () => {
  const arcgisScene = document.querySelector("arcgis-scene");
  const {
    contractpackages,
    updateAsofdate,
    asofdate,
    chartPanelwidth,
    updateChartPanelwidth,
    superurgenttype,
    updateSuperurgenttype,
  } = use(MyContext);

  // 0. Updated date
  const [daysPass, setDaysPass] = useState<boolean>(false);
  useEffect(() => {
    dateUpdate(updatedDateCategoryNames[0]).then((response) => {
      // Default as of date:
      updateAsofdate(response[0][0]);

      // For calculating the number of days passed since the latest date
      setDaysPass(response[0][1] >= cutoff_days ? true : false);
    });
  }, []);

  // ************************************
  //  Chart
  // ***********************************
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
  const [lotData, setLotData] = useState<any>([]);

  // Define chart id
  const chartID = "pie-two";

  const [lotNumber, setLotNumber] = useState<number>(0);
  const [totalAffectedArea, setTotalAffectedArea] = useState<
    number | undefined
  >();

  // Handed Over
  const [handedOverNumber, setHandedOverNumber] = useState<number>(0);
  const [handedOverPercent, setHandedOverPercent] = useState<number>(0);
  const [handedOverArea, setHandedOverArea] = useState<number>(0);
  const [handedOverCheckBox, setHandedOverCheckBox] = useState<any>(false);

  useEffect(() => {
    if (superurgenttype === superurgent_items[1]) {
      highlightLot(lotLayer, arcgisScene);
    } else {
      highlightRemove();
    }
  }, [superurgenttype]);

  useEffect(() => {
    if (handedOverCheckBox === true) {
      handedOverLotLayer.visible = true;
    } else {
      handedOverLotLayer.visible = false;
    }
  }, [handedOverCheckBox]);

  useEffect(() => {
    setHandedOverPercent(
      Number(((handedOverNumber / lotNumber) * 100).toFixed(0)),
    );
  }, [handedOverNumber, lotNumber]);

  // Chart data and calculate statistics
  useEffect(() => {
    //--- Update query expression
    const qSuperrugent_expression =
      superurgenttype === "OFF" ? undefined : querySuperUrgent;

    queryc.qValues = [
      contractpackages === "All" ? undefined : contractpackages,
    ];
    // queryc.qFields = [cpField];
    queryc.q2Expression = qSuperrugent_expression;

    queryDefinitionExpression({
      queryExpression: queryc.queryExpression(),
      featureLayer: [lotLayer, handedOverLotLayer],
    });

    console.log(queryc.queryExpression());
    //--- chart data
    pieChartStatusData({
      qChart: queryc.queryExpression(),
      layer: lotLayer,
      statusList: lotStatusQuery,
      statusColor: lotStatusColor,
      statusField: lotStatusField,
      statisticField: lotStatusField,
      statisticType: "count",
    }).then((result: any) => {
      console.log(result);
      setLotData(result[0]);
    });

    //--- total number of lots (public + private)
    fieldStatistic({
      qChart: queryc.queryExpression(),
      layer: lotLayer,
      statisticField: lotIdField,
      statisticType: "count",
    }).then((result: any) => {
      setLotNumber(result);
    });

    //-- Total affected area
    fieldStatistic({
      qChart: queryc.queryExpression(),
      layer: lotLayer,
      statisticField: affectedAreaField,
      statisticType: "sum",
    }).then((result: any) => {
      setTotalAffectedArea(result);
    });

    //--- Total handed-over area
    fieldStatistic({
      qChart: queryc.queryExpression(),
      layer: lotLayer,
      statisticField: lotHandedOverAreaField,
      statisticType: "sum",
    }).then((result: any) => {
      setHandedOverArea(result);
    });

    //--- Total handed-over lots
    queryc2.qValues = [
      contractpackages === "All" ? undefined : contractpackages,
    ];
    queryc2.qFields = [cpField];
    queryc2.qExpression = `${lotStatusField} <> 8`;
    queryc2.q2Expression = qSuperrugent_expression;

    fieldStatistic({
      qChart: queryc2.queryExpression(),
      layer: lotLayer,
      statisticField: lotHandedOverField,
      statisticType: "sum",
    }).then((result: any) => {
      setHandedOverNumber(result);
    });

    zoomToLayer(lotLayer, arcgisScene);
  }, [contractpackages, superurgenttype]);

  useEffect(() => {
    // Dispose previously created root element
    maybeDisposeRoot(chartID);

    const root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
    ]);
    // Define chart
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        centerY: am5.percent(25), //-10
        y: am5.percent(25), // space between pie chart and total lots
        layout: root.verticalLayout,
      }),
    );
    chartRef.current = chart;
    // Define series
    const pieSeries = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: "Series",
        categoryField: "category",
        valueField: "value",
        // legendLabelText: "{category}",
        legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
        radius: am5.percent(45), // outer radius
        innerRadius: am5.percent(28),
      }),
    );
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);
    // Define legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        scale: 1.03,
      }),
    );
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    queryc3.qValues = [
      contractpackages === "All" ? undefined : contractpackages,
    ];

    // Render chart
    chartRenderer({
      chart: chart,
      pieSeries: pieSeries,
      legend: legend,
      root: root,
      qChart: queryc3,
      q2Expression: superurgenttype === "OFF" ? undefined : querySuperUrgent,
      status_field: lotStatusField,
      arcgisScene: arcgisScene,
      updateChartPanelwidth: updateChartPanelwidth,
      data: lotData,
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
  }, [chartID, lotData]);

  useEffect(() => {
    pieSeriesRef.current?.data.setAll(lotData);
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
            {thousands_separators(lotNumber)}
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
            {totalAffectedArea &&
              thousands_separators(totalAffectedArea.toFixed(0))}
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
            updateSuperurgenttype(event.target.selectedItem.id)
          }
        >
          {superurgenttype &&
            superurgent_items.map((priority, index) => {
              return (
                <calcite-segmented-control-item
                  {...(superurgenttype === priority ? { checked: true } : {})}
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
          color: daysPass === true ? "red" : "gray",
          fontSize: `${new_asofDateSize}px`,
          float: "right",
          marginRight: "5px",
          marginTop: "5px",
        }}
      >
        {!asofdate ? "" : "As of " + asofdate}
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
              setHandedOverCheckBox(handedOverCheckBox === false ? true : false)
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
            {handedOverPercent}% ({thousands_separators(handedOverNumber)})
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
            {handedOverArea && thousands_separators(handedOverArea.toFixed(0))}
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
