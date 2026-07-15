//--- Chart
export interface ChartResponse {
  chartData: any[];
  totalNumber: number | string | undefined;
}

export type statisticsType = "count" | "sum";
export type StatusTypenamesType =
  | "To be Constructed"
  | "Under Construction"
  | "delayed"
  | "Completed";
export type StatusStateType = "comp" | "incomp" | "ongoing" | "delayed";
export type LayerNameType = "utility" | "viaduct" | "others";
