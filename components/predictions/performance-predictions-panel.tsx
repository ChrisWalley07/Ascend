"use client";

import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

import { PredictionCard } from "@/components/predictions/prediction-card";
import { ProjectionTimeline } from "@/components/predictions/projection-timeline";
import { EmptyState } from "@/components/ui/empty-state";
import type { PerformancePredictionReport } from "@/features/performance-prediction/types";
import { cn } from "@/lib/utils";

const PredictionTrendChart = dynamic(
  () => import("@/components/predictions/prediction-trend-chart").then((m) => m.PredictionTrendChart),
  {
    ssr: false,
    loading: () => <div className="h-[180px] w-full rounded-2xl bg-white/5 animate-pulse" />,
  },
);

type Props = {
  report: PerformancePredictionReport | null;
  compact?: boolean;
  className?: string;
};

export function PerformancePredictionsPanel({ report, compact = false, className }: Props) {
  if (!report || report.predictions.length === 0) {
    return (
      <section className={cn("surface p-5", className)}>
        <EmptyState
          icon={Sparkles}
          title="No predictions yet"
          description="Log workouts, personal bests, and race results to unlock performance projections."
          className="py-10"
        />
      </section>
    );
  }

  const supported = report.predictions.filter((p) => p.supported);
  const featured = supported.slice(0, compact ? 2 : 3);
  const cards = compact ? supported.slice(0, 4) : report.predictions;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent p-5 lg:p-6 space-y-5",
        className,
      )}
    >
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Performance Predictions
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Trend-based projections from your training history · {supported.length} active model
          {supported.length === 1 ? "" : "s"}
        </p>
      </header>

      {!compact && featured.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          {featured.map((prediction) => (
            <div key={prediction.key} className="space-y-3">
              <PredictionTrendChart
                title={prediction.label}
                description={`${prediction.horizonLabel} projection`}
                data={prediction.projectionTimeline}
                projectedValue={prediction.projected}
              />
              <ProjectionTimeline prediction={prediction} />
            </div>
          ))}
        </div>
      )}

      <div className={cn("grid gap-3", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3")}>
        {cards.map((prediction) => (
          <PredictionCard key={prediction.key} prediction={prediction} />
        ))}
      </div>
    </section>
  );
}
