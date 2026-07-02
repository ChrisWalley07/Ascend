"use client";

import { CheckCircle2, Circle, Lock } from "lucide-react";

import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";
import {
  getActionableRequirements,
  prerequisitesMet,
  resolvePrerequisites,
} from "@/lib/achievements/prerequisites";
import { cn } from "@/lib/utils";

type Props = {
  achievement: ResolvedAchievement;
  allAchievements?: readonly ResolvedAchievement[];
  compact?: boolean;
  className?: string;
};

function ChecklistItem({
  label,
  completed,
  detail,
  compact,
}: {
  label: string;
  completed: boolean;
  detail?: string;
  compact?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-start gap-2 rounded-lg border text-sm",
        compact ? "px-2 py-1.5" : "px-3 py-2.5",
        completed
          ? "border-lime/30 bg-lime/8"
          : "border-border bg-background/40",
      )}
    >
      {completed ? (
        <CheckCircle2 className={cn("shrink-0 text-lime", compact ? "mt-0.5 h-3.5 w-3.5" : "h-4 w-4")} />
      ) : (
        <Circle className={cn("shrink-0 text-muted-foreground", compact ? "mt-0.5 h-3.5 w-3.5" : "h-4 w-4")} />
      )}
      <div className="min-w-0 flex-1">
        <span className={cn("block", completed && "text-foreground", !completed && "text-muted-foreground")}>
          {label}
        </span>
        {detail && (
          <span className="mt-0.5 block text-[10px] tabular-nums text-muted-foreground">{detail}</span>
        )}
      </div>
    </li>
  );
}

export function AchievementRequirementsPanel({
  achievement,
  allAchievements = [],
  compact = false,
  className,
}: Props) {
  const prerequisites = resolvePrerequisites(achievement, allAchievements);
  const requirements = getActionableRequirements(achievement);
  const unlocked = achievement.unlocked || prerequisitesMet(achievement, allAchievements);
  const showPrereqs = prerequisites.length > 0 && !prerequisites.every((p) => p.completed);

  return (
    <div className={cn("space-y-3", className)}>
      {!compact && (
        <p className="text-sm leading-relaxed text-muted-foreground">{achievement.description}</p>
      )}

      {showPrereqs && (
        <section className="space-y-1.5">
          {!compact && (
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Complete first
            </h3>
          )}
          {compact && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Complete first
            </p>
          )}
          <ul className="space-y-1.5">
            {prerequisites.map((prereq) => (
              <ChecklistItem
                key={prereq.id}
                label={prereq.title}
                completed={prereq.completed}
                compact={compact}
              />
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-1.5">
        {!compact && (
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {achievement.completed ? "Completed" : "To achieve"}
          </h3>
        )}
        {compact && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {achievement.completed ? "Done" : "To achieve"}
          </p>
        )}

        {!unlocked && requirements.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            Finish the steps above to unlock this tile.
          </div>
        ) : requirements.length > 0 ? (
          <ul className="space-y-1.5">
            {requirements.map((req) => (
              <ChecklistItem
                key={req.requirementId}
                label={req.label}
                completed={req.completed || achievement.completed}
                detail={
                  unlocked && !achievement.completed
                    ? `${req.current}/${req.target}${req.unit ? ` ${req.unit}` : ""}`
                    : undefined
                }
                compact={compact}
              />
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Log training and PRs — progress updates automatically.</p>
        )}
      </section>
    </div>
  );
}
