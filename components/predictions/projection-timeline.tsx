import { format } from "date-fns";

import type { PerformancePrediction } from "@/features/performance-prediction/types";
import { cn } from "@/lib/utils";

type Props = {
  prediction: PerformancePrediction;
  className?: string;
};

export function ProjectionTimeline({ prediction, className }: Props) {
  const milestones = prediction.projectionTimeline.filter(
    (point, index, arr) =>
      index === 0 || index === arr.length - 1 || !point.projected,
  );

  if (milestones.length === 0) {
    return null;
  }

  return (
    <div className={cn("rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3", className)}>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Projection Timeline — {prediction.label}
      </p>
      <ol className="relative flex items-start justify-between gap-2 before:absolute before:left-0 before:right-0 before:top-[11px] before:h-px before:bg-white/10">
        {milestones.map((point, index) => {
          const isProjected = point.projected;
          const isLast = index === milestones.length - 1;
          return (
            <li key={`${point.date}-${index}`} className="relative z-10 flex flex-col items-center min-w-0 flex-1">
              <span
                className={cn(
                  "flex h-[22px] w-[22px] items-center justify-center rounded-full border text-[9px] font-bold",
                  isLast && isProjected
                    ? "border-lime/40 bg-lime/15 text-lime"
                    : isProjected
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      : "border-white/15 bg-card text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <p className="mt-2 text-[10px] font-medium text-muted-foreground truncate w-full text-center">
                {format(new Date(point.date), "MMM d")}
              </p>
              <p className="text-xs font-bold tabular-nums text-foreground truncate w-full text-center">
                {Math.round(point.value)}
              </p>
              {isProjected && (
                <p className="text-[9px] uppercase tracking-wider text-amber-400/80">proj</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
