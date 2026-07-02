import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";

import { ATTRIBUTE_LABELS } from "@/features/weakness-detection";
import type { PerformancePredictionReport } from "@/features/performance-prediction/types";
import type { RecoveryReadinessReport } from "@/features/recovery-readiness/types";
import type { WeaknessReport } from "@/features/weakness-detection";
import { cn } from "@/lib/utils";

type Props = {
  recovery: RecoveryReadinessReport | null;
  weakness: WeaknessReport | null;
  predictions: PerformancePredictionReport | null;
  className?: string;
};

const ZONE_DOT = {
  green: "bg-lime",
  yellow: "bg-amber-400",
  red: "bg-red-400",
} as const;

export function DashboardAtAGlance({ recovery, weakness, predictions, className }: Props) {
  const readiness = recovery?.scores.readiness.score;
  const zone = recovery?.overallZone ?? "yellow";
  const recommendation =
    recovery?.recommendation.summary ??
    "Log a workout or recovery check-in to unlock today's guidance.";

  const focus = weakness ? ATTRIBUTE_LABELS[weakness.weakestAttribute] : null;
  const strength = weakness ? ATTRIBUTE_LABELS[weakness.strongestAttribute] : null;

  const topPrediction = predictions?.predictions.find((p) => p.supported) ?? null;

  const hasSignal = recovery != null || weakness != null || topPrediction != null;

  return (
    <section className={cn("surface p-5", className)}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Today</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your training snapshot</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/coach"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Coach
          </Link>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1 text-xs font-medium text-lime hover:text-lime/80 transition-colors"
          >
            Details
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {!hasSignal ? (
        <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center">
          <Brain className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Log workouts to see readiness, focus areas, and projections.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Primary: readiness + one-line advice */}
          <div className="flex items-start gap-3">
            <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", ZONE_DOT[zone])} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {readiness != null ? (
                  <>
                    Readiness <span className="tabular-nums">{Math.round(readiness)}</span>
                    <span className="text-muted-foreground font-normal"> · </span>
                    <span className="capitalize">{zone}</span>
                  </>
                ) : (
                  "Readiness pending"
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {recommendation}
              </p>
            </div>
          </div>

          {/* Secondary row: focus + projection */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6 text-xs text-muted-foreground border-t border-white/6 pt-4">
            {focus && strength && (
              <p>
                <span className="text-foreground font-medium">Focus</span> {focus}
                <span className="mx-2 opacity-30">·</span>
                <span className="text-foreground font-medium">Peak</span> {strength}
              </p>
            )}
            {topPrediction && (
              <p className="sm:ml-auto sm:text-right tabular-nums">
                <span className="text-foreground font-medium">{topPrediction.label}</span>
                {" → "}
                {topPrediction.projectedDisplay}
                <span className="opacity-60"> in {topPrediction.horizonLabel}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
