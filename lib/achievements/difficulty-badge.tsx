"use client";

import type { AchievementDifficulty } from "@/features/athlete-achievements/types/difficulty";
import { ACHIEVEMENT_DIFFICULTY_META } from "@/features/athlete-achievements/types/difficulty";
import { cn } from "@/lib/utils";

export const DIFFICULTY_BADGE_STYLES: Record<AchievementDifficulty, string> = {
  beginner: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  intermediate: "border-blue-500/40 bg-blue-500/15 text-blue-300",
  advanced: "border-violet-500/40 bg-violet-500/15 text-violet-300",
  elite: "border-amber-400/50 bg-amber-500/20 text-amber-200",
  legendary: "border-fuchsia-500/50 bg-fuchsia-500/15 text-fuchsia-200",
};

export function difficultyBadgeClass(difficulty: AchievementDifficulty): string {
  return DIFFICULTY_BADGE_STYLES[difficulty];
}

export function difficultyLabel(difficulty: AchievementDifficulty): string {
  return ACHIEVEMENT_DIFFICULTY_META[difficulty].label;
}

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: AchievementDifficulty;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        difficultyBadgeClass(difficulty),
        className,
      )}
    >
      {difficultyLabel(difficulty)}
    </span>
  );
}
