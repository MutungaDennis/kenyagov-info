import DataBarList from "@/components/open-data/DataBarList";
import DataLineChart from "./DataLineChart";
import DataColumnChart from "./DataColumnChart";
import DataDonutChart from "./DataDonutChart";
import DataRankingList from "./DataRankingList";
import type { ChartSpec } from "./types";

type Props = {
  chart: ChartSpec;
};

/** Renders the appropriate chart type for open-data summaries. */
export default function DataChart({ chart }: Props) {
  const common = {
    title: chart.title,
    caption: chart.caption,
    items: chart.items,
  };

  switch (chart.type) {
    case "line":
      return <DataLineChart {...common} />;
    case "column":
      return <DataColumnChart {...common} />;
    case "donut":
      return <DataDonutChart {...common} />;
    case "ranking":
      return <DataRankingList {...common} />;
    case "bar":
    default:
      return <DataBarList {...common} />;
  }
}
