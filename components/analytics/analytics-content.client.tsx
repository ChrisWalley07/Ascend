"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";

import type { PerformancePredictionReport } from "@/features/performance-prediction/types";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts.client";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

type LineDatum = { label: string; value: number };
type RadarDatum = { metric: string; current: number; previous?: number };

type Props = {
  radarData: RadarDatum[];
  scoreSeries: LineDatum[];
  overallScore: number;
  frequencyData: LineDatum[];
  volumeData: LineDatum[];
  prData: LineDatum[];
  rpeData: LineDatum[];
  predictionReport: PerformancePredictionReport | null;
};

export function AnalyticsCrossfitContent({
  radarData,
  scoreSeries,
  overallScore,
  frequencyData,
  volumeData,
  prData,
  rpeData,
  predictionReport,
}: Props) {
  const isMobile = useIsMobile();
  const [showCharts, setShowCharts] = useState(!isMobile);
  const chartsVisible = !isMobile || showCharts;

  const scoreHistory =
    scoreSeries.length > 0 ? scoreSeries : [{ label: "Today", value: Math.round(overallScore) }];

  return (
    <>
      {isMobile && !showCharts && (
        <button
          type="button"
          onClick={() => setShowCharts(true)}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl border border-lime/25",
            "bg-lime/8 px-4 py-3.5 text-sm font-semibold text-lime transition-colors active:bg-lime/12",
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Show performance charts
        </button>
      )}

      {chartsVisible && (
        <>
          <section className="grid gap-4 lg:grid-cols-2 animate-fade-in">
            <div className="surface p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Radar Evolution
              </p>
              <AnalyticsCharts kind="radar" radarData={radarData} />
            </div>

            <AnalyticsCharts
              kind="line"
              title="Score History"
              description="Daily athlete score snapshots"
              data={scoreHistory}
            />
          </section>

          <AnalyticsCharts kind="predictions" predictionReport={predictionReport} />

          <section className="grid gap-4 lg:grid-cols-2 animate-fade-in">
            <AnalyticsCharts
              kind="line"
              title="Training Frequency"
              description="Sessions logged per week"
              data={frequencyData}
            />
            <AnalyticsCharts
              kind="line"
              title="Monthly Volume"
              description="Total kg moved each month"
              data={volumeData}
            />
            <AnalyticsCharts
              kind="line"
              title="Cumulative PRs"
              description="Personal records over time"
              data={prData}
            />
            <AnalyticsCharts
              kind="line"
              title="Avg RPE Trend"
              description="How hard your sessions have felt"
              data={rpeData}
            />
          </section>
        </>
      )}
    </>
  );
}
