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
import { useQuery } from "@tanstack/react-query";
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

const CHART_ID = "structure-chart";
const SERIES_SCALE = 220;
const INNER_VALUE_FONT_SIZE = "1.2rem";
const INNER_LABEL_FONT_SIZE = "0.45em";

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

      return { chartData, totalNumber, totalDemolish, q1 };
    },
    staleTime: Infinity,
  });
}

//--------------------------------------------//
//              Chart Component                //
//--------------------------------------------//

//--- memo prevents re-rendering the Component when the parent Component
//--- (ChartMain) is rendered.
const ChartStructure = memo(() => {
  const { cpackage } = use(MyContext);
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
  const totalNumber = data?.totalNumber ?? 0;
  const totalDemolish = data?.totalDemolish ?? 0;
  const percDemolished = totalNumber
    ? Number(((totalDemolish / totalNumber) * 100).toFixed(0))
    : 0;

  // ************************************
  //  Responsive Chart parameters
  // ***********************************
  const fontSize = chartPanelwidth ? chartPanelwidth / 22.3 : 0;
  const valueSize = fontSize * 1.55;
  const imageSize = chartPanelwidth ? chartPanelwidth * 0.03 : 0;
  const new_asofDateSize = chartPanelwidth ? chartPanelwidth * 0.032 : 0;

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});

  useEffect(() => {
    const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
    const root = rootSetter({ chartID: CHART_ID });
    const chart = chartSetter({ root });

    const pieSeries = seriesSetter({
      chart,
      root,
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
      status_field: str_status_f,
      view: arcgisScene?.view,
      updateChartPanelwidth: setChartPanelwidth,
      data: chartData,
      seriesScale: SERIES_SCALE,
      innerLabel: "STRUCTURES",
      innerLabelFontSize: INNER_LABEL_FONT_SIZE,
      innerValueFontSize: INNER_VALUE_FONT_SIZE,
      layer: structureLayer,
      statusArray: str_status_q,
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
          fontSize: `${new_asofDateSize}px`,
          float: "right",
          marginRight: "5px",
        }}
      >
        {asofdate ? `As of ${asofdate}` : `As of `}
      </div>

      {/* Structure Chart */}
      <div
        id={CHART_ID}
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
