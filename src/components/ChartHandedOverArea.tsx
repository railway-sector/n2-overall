import { useEffect, memo } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { handedOverAreaByContractp } from "../query";
import { rootSetter } from "../chartSetter";
import { useQuery } from "@tanstack/react-query";
import { lotLayer } from "../layers";
import { lot_aa_f, cpackages, lot_hoa_f } from "../uniqueValues";

const HandedOverAreaChart = memo(() => {
  const chartID = "lot-handedover";

  const { data, isLoading } = useQuery<any>({
    queryKey: [lotLayer, lot_aa_f, lot_hoa_f],
    queryFn: async () => {
      const chartData = await handedOverAreaByContractp({
        aa_field: lot_aa_f,
        hoa_field: lot_hoa_f,
        cp_list: cpackages.filter((pkg) => pkg !== "All"),
        layer: lotLayer,
      });

      return {
        chartData: chartData ?? [],
      };
    },
    staleTime: Infinity,
  });
  const chartData = data?.chartData ?? [];

  useEffect(() => {
    const root = rootSetter({ chartID: chartID });

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panY",
        wheelY: "zoomY",
        layout: root.verticalLayout,
      }),
    );

    chart.children.unshift(
      am5.Label.new(root, {
        text: "Handed-Over Area (m2)",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        fill: am5.color("#ffffff"),
        x: am5.percent(50),
        centerX: am5.percent(50),
        paddingTop: 0,
        paddingBottom: 0,
      }),
    );

    // Create axes
    const yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 1,
      strokeWidth: 1,
      stroke: am5.color("#ffffff"),
    });

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: yRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      }),
    );

    // Label properties Y axis
    yAxis.get("renderer").labels.template.setAll({
      textAlign: "center",
      fill: am5.color("#ffffff"),
      fontSize: 12,
    });

    yRenderer.grid.template.setAll({
      location: 1,
    });
    yAxis.data.setAll(chartData);

    // Set xaxis
    const xRenderer = am5xy.AxisRendererX.new(root, {
      strokeOpacity: 1,
      strokeWidth: 1,
      stroke: am5.color("#ffffff"),
    });

    // Remove xaxis labels
    xRenderer.labels.template.set("visible", false);

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        calculateTotals: true,
        renderer: xRenderer,
      }),
    );

    function makeSeries(name: any, fieldName: any) {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          stacked: true,
          xAxis: xAxis,
          yAxis: yAxis,
          baseAxis: yAxis,
          valueXShow: "valueXTotalPercent",
          valueXField: fieldName,
          categoryYField: "category",
          fill: am5.color("#0070ff"),
        }),
      );

      series.columns.template.setAll({
        //tooltipText: "{name}, {categoryY}: {valueX}%",
        //tooltipY: am5.percent(90)
      });
      series.data.setAll(chartData);

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text: "{valueX}%",
            fill: am5.color("#ffffff"), //root6.interfaceColors.get("alternativeText"),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true,
            fontSize: 12,
          }),
        });
      });
    }
    makeSeries("Value", "value");
    chart.appear(1000, 100);
    return () => {
      root.dispose();
    };
  }, [chartID, chartData]);

  return (
    <>
      <div
        id={chartID}
        style={{
          height: "55vh",
          width: "30%",
          backgroundColor: "#2b2b2b",
          color: "white",
          position: "absolute",
          zIndex: 99,
          bottom: 10,
          marginLeft: "1vw",
          marginRight: "auto",
          opacity: isLoading ? 0 : 1,
        }}
      ></div>
    </>
  );
});

export default HandedOverAreaChart;
