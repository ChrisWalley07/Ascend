import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";

import type { DashboardInsight } from "@/lib/dashboard/build-ai-insight";
import { cn } from "@/lib/utils";

type Props = {
  insight: DashboardInsight;
  className?: string;
};

const ZONE_STYLES = {
  green: "bg-lime/15 text-lime border-lime/25",
  yellow: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  red: "bg-red-500/15 text-red-300 border-red-500/25",
} as const;

export function DashboardAiInsight({ insight, className }: Props) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.05] to-transparent p-5 lg:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-lime/10 ring-1 ring-lime/20">
            <Brain className="h-5 w-5 text-lime" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              AI Coach
            </p>
            {insight.confidence > 0 && (
              <p className="text-[11px] text-muted-foreground">{insight.confidence}% confidence</p>
            )}
          </div>
        </div>
        <Link
          href="/coach"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-lime transition-colors shrink-0"
        >
          Full report
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {insight.readinessScore != null && insight.readinessZone && (
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                ZONE_STYLES[insight.readinessZone],
              )}
            >
              Readiness {Math.round(insight.readinessScore)}
            </span>
          )}
          {insight.focusArea && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Focus · {insight.focusArea}
            </span>
          )}
        </div>

        <h2 className="text-lg font-semibold text-foreground leading-snug">{insight.headline}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>

        <div className="rounded-xl border border-lime/15 bg-lime/5 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-lime/80 mb-1">
            What to do
          </p>
          <p className="text-sm text-foreground leading-relaxed">{insight.action}</p>
        </div>
      </div>
    </section>
  );
}
