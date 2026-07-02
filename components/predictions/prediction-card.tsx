import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";

import type { PerformancePrediction } from "@/features/performance-prediction/types";
import { cn } from "@/lib/utils";

type Props = {
  prediction: PerformancePrediction;
  className?: string;
};

const IMPACT_STYLES = {
  positive: "text-lime",
  negative: "text-red-400",
  neutral: "text-muted-foreground",
} as const;

export function PredictionCard({ prediction, className }: Props) {
  const improving =
    prediction.current != null &&
    prediction.projected != null &&
    (prediction.direction === "lower_is_better"
      ? prediction.projected < prediction.current
      : prediction.projected > prediction.current);

  const delta =
    prediction.current != null && prediction.projected != null
      ? Math.abs(Math.round(prediction.projected - prediction.current))
      : null;

  return (
    <article
      className={cn(
        "rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent p-4",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {prediction.horizonLabel} horizon
          </p>
          <h3 className="mt-1 text-sm font-semibold text-foreground">{prediction.label}</h3>
        </div>
        <div
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-bold tabular-nums",
            prediction.confidence >= 70
              ? "border-lime/30 bg-lime/10 text-lime"
              : prediction.confidence >= 45
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border-white/10 bg-white/5 text-muted-foreground",
          )}
        >
          {prediction.confidence}%
        </div>
      </header>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current</p>
          <p className="text-lg font-bold tabular-nums text-foreground">{prediction.currentDisplay}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Projected</p>
          <p className="text-lg font-bold tabular-nums text-lime">{prediction.projectedDisplay}</p>
        </div>
      </div>

      {delta != null && prediction.supported && (
        <div
          className={cn(
            "mt-3 flex items-center gap-1.5 text-xs font-medium",
            improving ? "text-lime" : "text-amber-300",
          )}
        >
          {improving ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {improving ? "Trending toward improvement" : "Projection assumes conservative gains"}
          {delta > 0 && ` (~${delta} ${prediction.unit === "sec" ? "s" : prediction.unit})`}
        </div>
      )}

      {prediction.factors.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-white/6 pt-3">
          {prediction.factors.slice(0, 3).map((factor) => (
            <li key={factor.label} className="text-xs leading-relaxed">
              <span className={cn("font-semibold", IMPACT_STYLES[factor.impact])}>{factor.label}: </span>
              <span className="text-muted-foreground">{factor.description}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
