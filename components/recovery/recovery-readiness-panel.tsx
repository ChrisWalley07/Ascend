"use client";

import { ChevronDown, Gauge } from "lucide-react";
import { useState } from "react";

import { ProgressRing } from "@/components/ui/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import type { RecoveryReadinessReport, ScoreExplanation } from "@/features/recovery-readiness/types";
import { cn } from "@/lib/utils";

type Props = {
  report: RecoveryReadinessReport | null;
  className?: string;
};

const ZONE_BADGE: Record<string, string> = {
  green: "bg-lime/15 text-lime border-lime/30",
  yellow: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
};

function ScoreCard({ score }: { score: ScoreExplanation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
      <div className="flex items-start gap-3">
        <ProgressRing
          value={score.score}
          zone={score.zone}
          invertZone={score.key === "fatigue"}
          size={88}
          strokeWidth={6}
          showValue
        />
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{score.label}</h3>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                ZONE_BADGE[score.zone],
              )}
            >
              {score.zone}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {score.supported ? `${score.confidence}% confidence` : "Estimated — log data to improve accuracy"}
          </p>
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="mt-2 flex items-center gap-1 text-[11px] font-medium text-lime hover:text-lime/80 transition-colors"
          >
            Why this score?
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {expanded && (
        <ul className="mt-3 space-y-1.5 border-t border-white/6 pt-3">
          {score.reasons.map((reason, index) => (
            <li key={index} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
              <span className="text-lime/70 shrink-0">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function RecoveryReadinessPanel({ report, className }: Props) {
  if (!report) {
    return (
      <section className={cn("surface p-5", className)}>
        <EmptyState
          icon={Gauge}
          title="Recovery analysis unavailable"
          description="Log workouts and recovery check-ins to generate readiness scores."
          className="py-10"
        />
      </section>
    );
  }

  const scoreEntries = [
    report.scores.readiness,
    report.scores.recovery,
    report.scores.fatigue,
    report.scores.trainingStress,
    report.scores.workoutLoad,
    report.scores.sleep,
  ];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent p-5 lg:p-6",
        className,
      )}
    >
      <div className="absolute inset-0 gradient-radial-lime pointer-events-none opacity-30" />

      <div className="relative space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Recovery & Readiness
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {report.overallConfidence}% model confidence
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ProgressRing
              value={report.scores.readiness.score}
              zone={report.overallZone}
              size={140}
              strokeWidth={9}
              label="Today's Readiness"
              showValue
            />
            <div
              className={cn(
                "rounded-2xl border px-4 py-3 max-w-xs",
                ZONE_BADGE[report.recommendation.zone],
              )}
            >
              <p className="text-sm font-semibold">{report.recommendation.title}</p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">{report.recommendation.summary}</p>
            </div>
          </div>
        </header>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Training Recommendation
          </p>
          <ul className="space-y-2">
            {report.recommendation.actions.map((action, index) => (
              <li
                key={index}
                className="flex gap-2 rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-xs text-muted-foreground leading-relaxed"
              >
                <span className="font-bold text-lime shrink-0">{index + 1}.</span>
                {action}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Score Breakdown
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {scoreEntries.map((score) => (
              <ScoreCard key={score.key} score={score} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
