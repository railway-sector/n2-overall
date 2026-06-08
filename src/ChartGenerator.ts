import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import * as am5 from "@amcharts/amcharts5";
import Query from "@arcgis/core/rest/support/Query";
import type { statisticsType } from "./uniqueValues";
import type { LayerNameType } from "./uniqueValues";

//---------------------------------------------//
//           Pie Chart Data Generation         //
//---------------------------------------------//

interface pieChartStatusDataType {
  qChart: any;
  layer: any;
  statusList?: any;
  statusColor?: any;
  statusField?: any;
  statisticField?: any;
  valueSumField?: any;
  queryField?: any;
  statisticType?: statisticsType;
}
export async function pieChartStatusData({
  qChart,
  layer,
  statusList,
  statusColor,
  statusField,
  statisticField,
  statisticType,
}: pieChartStatusDataType) {
  //--- Main statistics
  let statsCollect: any;
  statsCollect = new StatisticDefinition({
    onStatisticField: statisticField,
    outStatisticFieldName: "statsCollect",
    statisticType: statisticType,
  });

  //--- Query
  const query = new Query();
  query.outStatistics = [statsCollect];
  query.where = qChart;
  query.orderByFields = [statusField];
  query.groupByFieldsForStatistics = [statusField];

  //--- Query features using statistics definitions
  let total_count = 0;
  return layer?.queryFeatures(query).then(async (response: any) => {
    const stats = response.features;
    const data = stats.map((result: any) => {
      const attributes = result.attributes;
      total_count += attributes.statsCollect;
      const statusName = attributes[statusField];

      //--- Check if attributes[statusField] is numeric or string
      //--- This correctly accounts for a case where status in the attribute table is not number,
      const isStringOrNumber = typeof statusName === "number";

      return Object.assign({
        category: isStringOrNumber
          ? statusList.find((item: any) => item.value === statusName).category
          : statusName,
        value: attributes.statsCollect,
      });
    });

    //--- Account for zero count
    const data0 = statusList.map((status: any, index: any) => {
      const find = data.find((emp: any) => emp.category === status.category);
      const value = find === undefined ? 0 : find?.value;
      return Object.assign({
        category: status.category,
        value: value,
        sliceSettings: {
          fill: am5.color(statusColor[index]),
        },
      });
    });
    return [data0, total_count];
  });
}

export async function fieldStatistic({
  qChart,
  layer,
  statisticField,
  statisticType,
}: pieChartStatusDataType) {
  const statsCollect = new StatisticDefinition({
    onStatisticField: statisticField,
    outStatisticFieldName: "statsCollect",
    statisticType: statisticType,
  });

  //--- Query
  const query = new Query();
  query.outStatistics = [statsCollect];
  query.where = qChart;

  return layer?.queryFeatures(query).then((response: any) => {
    return response.features[0].attributes.statsCollect;
  });
}

//---------------------------------------------//
//     Column Serie Chart Data Generation      //
//---------------------------------------------//
interface chartDataColumnSeriesType {
  qChart: any;
  chartCategoryTypes: any;
  chartCategoryTypeField: any;
  layer: any;
  statusstate: any;
  statusField: any;
  layerName: LayerNameType;
}
export async function chartDataColumnSries({
  qChart,
  chartCategoryTypes,
  chartCategoryTypeField,
  layer,
  statusstate,
  statusField,
  layerName,
}: chartDataColumnSeriesType) {
  //--- types: include 'others'. Each main type may have others (types = 0)
  const compile: any = [];

  //--- Main statistics
  chartCategoryTypes.map((type: any) => {
    statusstate.map((status: any) => {
      const temp = new StatisticDefinition({
        onStatisticField: `CASE WHEN (${chartCategoryTypeField} = ${type.value} and ${statusField} = ${status}) THEN 1 ELSE 0 END`,
        outStatisticFieldName: `stats${type.value}${status}`,
        statisticType: "sum",
      });
      compile.push(temp);
    });
  });

  //--- Query
  const query = new Query();
  query.outStatistics = compile;
  query.where = qChart;

  //--- Query features using statistics definitions
  let total_comp = 0;
  let total_all = 0;
  const qStats = layer?.queryFeatures(query).then(async (response: any) => {
    const stats = response.features;
    return chartCategoryTypes.map((type: any, index: any) => {
      if (layerName === "utility") {
        const comp = stats[0].attributes[`stats${type.value}${1}`];
        const incomp = stats[0].attributes[`stats${type.value}${0}`];

        total_comp += comp; //
        total_all += comp + incomp;

        return Object.assign({
          category: chartCategoryTypes[index].category,
          comp: comp,
          incomp: incomp,
          icon: chartCategoryTypes[index].icon,
        });
      } else if (layerName === "viaduct") {
        const comp = stats[0].attributes[`stats${type.value}${4}`];
        const incomp = stats[0].attributes[`stats${type.value}${1}`];
        const ongoing = stats[0].attributes[`stats${type.value}${2}`];

        total_comp += comp; //
        total_all += comp + incomp;

        return Object.assign({
          category: chartCategoryTypes[index].category,
          comp: comp,
          incomp: incomp,
          ongoing: ongoing,
          icon: chartCategoryTypes[index].icon,
        });
      }
    });
  });
  const data = await qStats;
  const percent_comp = ((total_comp / total_all) * 100).toFixed(0);

  return [data, total_comp, total_all, percent_comp];
}
