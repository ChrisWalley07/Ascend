import { ArrowRight, Zap } from "lucide-react";

import type { CoachRecommendation } from "@/features/ai-coach";
import { cn } from "@/lib/utils";

type Props = {
  recommendation: CoachRecommendation;
  compact?: boolean;
  className?: string;
};

function priorityLabel(priority: number): string {
  if (priority >= 90) return "Critical";
  if (priority >= 75) return "High";
  if (priority >= 55) return "Medium";
  return "Low";
}

function priorityClass(priority: number): string {
  if (priority >= 90) return "bg-red-500/10 text-red-400";
  if (priority >= 75) return "bg-amber-500/10 text-amber-400";
  if (priority >= 55) return "bg-lime/10 text-lime";
  return "bg-white/8 text-muted-foreground";
}

export function CoachRecommendationCard({ recommendation, compact = false, className }: Props) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition-all duration-300 hover:border-white/14 hover:bg-white/[0.05]",
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime/10 text-lime">
          <Zap className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground leading-snug pr-2">
              {recommendation.title}
            </h3>
            <div className="flex shrink-0 items-center gap-1.5">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  priorityClass(recommendation.priority),
                )}
              >
                {priorityLabel(recommendation.priority)}
              </span>
              <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                {recommendation.confidence}% sure
              </span>
            </div>
          </div>

          {!compact && (
            <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.reason}</p>
          )}

          <div className="rounded-xl border border-white/6 bg-black/20 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              Action
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-lime/70" />
              <span>{recommendation.action}</span>
            </p>
          </div>

          {recommendation.tags.length > 0 && !compact && (
            <div className="flex flex-wrap gap-1.5">
              {recommendation.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground capitalize"
                >
                  {tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
