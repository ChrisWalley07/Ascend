"use client";

import dynamic from "next/dynamic";

import type { PerformancePredictionReport } from "@/features/performance-prediction/types";

const AthleteScoreRadar = dynamic(
  () => import("@/components/analytics/athlete-score-radar").then((m) => m.AthleteScoreRadar),
  { ssr: false, loading: () => <div className="h-[220px] w-full rounded-2xl bg-white/5 animate-pulse" /> },
);

const PerformanceLineChart = dynamic(
  () => import("@/components/analytics/performance-line-chart").then((m) => m.PerformanceLineChart),
  { ssr: false, loading: () => <div className="surface h-[220px] w-full animate-pulse bg-white/5" /> },
);

const PerformancePredictionsPanel = dynamic(
  () =>
    import("@/components/predictions/performance-predictions-panel").then(
      (m) => m.PerformancePredictionsPanel,
    ),
  { ssr: false, loading: () => <div className="h-[260px] w-full rounded-3xl bg-white/5 animate-pulse" /> },
);

type LineDatum = { label: string; value: number };
type RadarDatum = { metric: string; current: number; previous?: number };

export function AnalyticsCharts(
  props:
    | { kind: "radar"; radarData: RadarDatum[]; showPrevious?: boolean }
    | { kind: "line"; title: string; description: string; data: LineDatum[] }
    | { kind: "predictions"; predictionReport: PerformancePredictionReport | null },
) {
  if (props.kind === "radar") {
    return <AthleteScoreRadar data={props.radarData} showPrevious={props.showPrevious ?? true} />;
  }

  if (props.kind === "predictions") {
    return <PerformancePredictionsPanel report={props.predictionReport} />;
  }

  return (
    <PerformanceLineChart
      title={props.title}
      description={props.description}
      data={props.data}
    />
  );
}

