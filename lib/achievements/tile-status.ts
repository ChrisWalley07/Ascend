import type { AchievementDifficulty } from "@/features/athlete-achievements/types/difficulty";
import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";

export type AchievementTileStatus = "locked" | "in_progress" | "completed" | "elite";

const ELITE_DIFFICULTIES: readonly AchievementDifficulty[] = ["elite", "legendary"];

export function isEliteDifficulty(difficulty: AchievementDifficulty): boolean {
  return ELITE_DIFFICULTIES.includes(difficulty);
}

export function resolveTileStatus(achievement: ResolvedAchievement): AchievementTileStatus {
  if (!achievement.unlocked) return "locked";
  if (isEliteDifficulty(achievement.difficulty)) return "elite";
  if (achievement.completed) return "completed";
  return "in_progress";
}

export const TILE_STATUS_STYLES: Record<
  AchievementTileStatus,
  { tile: string; icon: string; badge: string; glow: string }
> = {
  locked: {
    tile: "border-zinc-700/60 bg-zinc-900/80 text-zinc-500",
    icon: "text-zinc-600",
    badge: "bg-zinc-800 text-zinc-400",
    glow: "",
  },
  in_progress: {
    tile: "border-yellow-500/45 bg-yellow-500/10 text-yellow-50",
    icon: "text-yellow-400",
    badge: "bg-yellow-500/20 text-yellow-300",
    glow: "shadow-[0_0_24px_-4px_rgba(234,179,8,0.35)]",
  },
  completed: {
    tile: "border-green-500/45 bg-green-500/10 text-green-50",
    icon: "text-green-400",
    badge: "bg-green-500/20 text-green-300",
    glow: "shadow-[0_0_24px_-4px_rgba(34,197,94,0.35)]",
  },
  elite: {
    tile: "border-amber-400/55 bg-gradient-to-br from-amber-500/15 to-yellow-600/10 text-amber-50",
    icon: "text-amber-300",
    badge: "bg-amber-500/25 text-amber-200",
    glow: "shadow-[0_0_28px_-4px_rgba(251,191,36,0.45)]",
  },
};
