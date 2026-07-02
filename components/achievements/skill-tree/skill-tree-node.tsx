"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";

import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";
import { useLightMotion } from "@/lib/hooks/use-light-motion";
import { resolveAchievementIcon } from "@/lib/achievements/resolve-achievement-icon";
import {
  resolveTileStatus,
  TILE_STATUS_STYLES,
} from "@/lib/achievements/tile-status";
import { formatRx } from "@/lib/ascension/labels";
import { cn } from "@/lib/utils";

type Props = {
  achievement: ResolvedAchievement;
  index: number;
  isNextTarget: boolean;
  onPress: (achievement: ResolvedAchievement) => void;
};

export function SkillTreeNode({ achievement, index, isNextTarget, onPress }: Props) {
  const lightMotion = useLightMotion();
  const status = resolveTileStatus(achievement);
  const styles = TILE_STATUS_STYLES[status];
  // eslint-disable-next-line react-hooks/static-components
  const Icon = resolveAchievementIcon(achievement.icon);
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const progress = achievement.completed ? 100 : achievement.progress.percent;

  const buttonClass = cn(
    "group relative w-full max-w-sm rounded-2xl border p-4 text-left transition-all duration-300",
    "hover:scale-[1.02] active:scale-[0.99]",
    styles.tile,
    styles.glow,
    isNextTarget && !isCompleted && "ring-2 ring-lime/40 ring-offset-2 ring-offset-background",
    lightMotion && "animate-fade-in",
  );

  const inner = (
    <>
      {isNextTarget && !isCompleted && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-lime/40 bg-lime/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime">
          Next up
        </span>
      )}

      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border",
            isCompleted
              ? "border-lime/40 bg-lime/15"
              : isLocked
                ? "border-zinc-700 bg-zinc-900/80"
                : "border-yellow-500/30 bg-yellow-500/10",
          )}
        >
          {isLocked ? (
            <Lock className="h-5 w-5 text-zinc-600" />
          ) : isCompleted ? (
            <Check className="h-6 w-6 text-lime" strokeWidth={2.5} />
          ) : (
            // eslint-disable-next-line react-hooks/static-components
            <Icon className={cn("h-6 w-6", styles.icon)} />
          )}
          {isCompleted && !lightMotion && (
            <motion.span
              className="absolute -inset-1 rounded-2xl border border-lime/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold tracking-tight">{achievement.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{achievement.description}</p>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/30">
              {lightMotion ? (
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500 ease-out",
                    isCompleted ? "bg-lime" : isLocked ? "bg-zinc-700" : "bg-yellow-400",
                  )}
                  style={{ width: `${progress}%` }}
                />
              ) : (
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    isCompleted ? "bg-lime" : isLocked ? "bg-zinc-700" : "bg-yellow-400",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, delay: index * 0.06 }}
                />
              )}
            </div>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/6 pt-3">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", styles.badge)}>
          {isLocked ? "Locked — finish previous step" : isCompleted ? "Completed" : "In progress"}
        </span>
        <span className="text-xs font-bold tabular-nums text-lime">{formatRx(achievement.xp, { signed: true })}</span>
      </div>
    </>
  );

  if (lightMotion) {
    return (
      <button type="button" onClick={() => onPress(achievement)} className={buttonClass}>
        {inner}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={() => onPress(achievement)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={buttonClass}
    >
      {inner}
    </motion.button>
  );
}
