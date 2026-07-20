export type ChartType = "bar" | "column" | "line" | "donut" | "ranking";

export type ChartSeriesItem = {
  label: string;
  count: number;
};

export type ChartSpec = {
  id: string;
  title: string;
  caption?: string;
  type: ChartType;
  items: ChartSeriesItem[];
};
