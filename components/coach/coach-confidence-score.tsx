"use client";

import { ScoreRing } from "@/components/ui/score-ring";
import { cn } from "@/lib/utils";

type Props = {
  score: number;
  className?: string;
};

export function CoachConfidenceScore({ score, className }: Props) {
  const label =
    score >= 80 ? "High confidence" : score >= 55 ? "Moderate confidence" : "Building signal";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-lime/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Confidence Score
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            How much data backs today&apos;s coaching — more workouts and recovery logs raise this.
          </p>
          <p className="mt-3 text-xs font-medium text-lime/80">{label}</p>
        </div>

        <ScoreRing
          score={score}
          size={120}
          strokeWidth={8}
          label="Confidence"
          sublabel="/ 100"
        />
      </div>
    </div>
  );
}
