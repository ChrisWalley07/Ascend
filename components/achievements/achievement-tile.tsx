"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";
import { AchievementRequirementsPanel } from "@/components/achievements/achievement-requirements-panel";
import { AnimatedTileBorder } from "@/components/achievements/animations/animated-tile-border";
import { CompletedTileGlow } from "@/components/achievements/animations/completed-tile-glow";
import { TileConfetti } from "@/components/achievements/animations/tile-confetti";
import { useLightMotion } from "@/lib/hooks/use-light-motion";
import { resolveAchievementIcon } from "@/lib/achievements/resolve-achievement-icon";
import {
  resolveTileStatus,
  TILE_STATUS_STYLES,
} from "@/lib/achievements/tile-status";
import { cn } from "@/lib/utils";
import { formatRx } from "@/lib/ascension/labels";

type Props = {
  achievement: ResolvedAchievement;
  allAchievements?: readonly ResolvedAchievement[];
  index: number;
  isNextTarget?: boolean;
  onPress: (achievement: ResolvedAchievement) => void;
};

const STAGGER = 0.035;

export function AchievementTile({
  achievement,
  allAchievements = [],
  index,
  isNextTarget = false,
  onPress,
}: Props) {
  const lightMotion = useLightMotion();
  const status = resolveTileStatus(achievement);
  const styles = TILE_STATUS_STYLES[status];
  // eslint-disable-next-line react-hooks/static-components
  const Icon = resolveAchievementIcon(achievement.icon);
  const progress = achievement.completed ? 100 : achievement.progress.percent;
  const isCompleted = achievement.completed;
  const isLocked = status === "locked";
  const isInProgress = status === "in_progress";
  const isElite = status === "elite";
  const showAnimatedBorder = !isLocked && !isCompleted && (isInProgress || isElite);
  const borderTone = isElite ? "gold" : "yellow";
  const glowVariant = isElite && isCompleted ? "gold" : "green";
  const confettiVariant = isElite && isCompleted ? "gold" : "green";

  const entrance = lightMotion
    ? { opacity: 1, scale: 1, y: 0 }
    : isCompleted
      ? { opacity: 1, scale: 1, y: 0 }
      : { opacity: 1, scale: 1, y: 0 };

  const initial = lightMotion
    ? false
    : isCompleted
      ? { opacity: 0, scale: 0.72, y: 6 }
      : { opacity: 0, scale: 0.94, y: 8 };

  return (
    <motion.div
      className="group/tile relative w-full"
      initial={initial}
      animate={entrance}
      transition={
        isCompleted
          ? {
              type: "spring",
              stiffness: 420,
              damping: 26,
              delay: index * STAGGER,
            }
          : {
              duration: 0.32,
              delay: index * STAGGER,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      style={{ willChange: "transform, opacity" }}
    >
      <div
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-50 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2",
          "opacity-0 transition-opacity duration-150 group-hover/tile:opacity-100",
          "hidden md:block",
        )}
        role="tooltip"
      >
        <div className="rounded-xl border border-border bg-popover p-3 shadow-2xl shadow-black/40">
          <p className="mb-2 text-xs font-semibold text-foreground">{achievement.title}</p>
          <AchievementRequirementsPanel
            achievement={achievement}
            allAchievements={allAchievements}
            compact
          />
          <p className="mt-2 text-[10px] text-muted-foreground">Click for full details</p>
        </div>
      </div>

      <AnimatedTileBorder
        active={showAnimatedBorder && !lightMotion}
        tone={borderTone}
      />

      <motion.button
        type="button"
        whileHover={lightMotion ? undefined : { scale: 1.03 }}
        whileTap={lightMotion ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        onClick={() => onPress(achievement)}
        className={cn(
          "relative z-10 flex aspect-square w-full flex-col items-center justify-between overflow-hidden rounded-2xl border p-3 text-left",
          showAnimatedBorder && "border-yellow-500/20",
          isNextTarget && !isCompleted && !isLocked && "ring-2 ring-lime/45 ring-offset-2 ring-offset-background",
          styles.tile,
          !isCompleted && styles.glow,
          "hover:brightness-110",
        )}
        aria-label={`${achievement.title}, ${progress}% complete`}
      >
        <CompletedTileGlow
          active={isCompleted && !lightMotion}
          variant={glowVariant}
        />

        <TileConfetti
          active={isCompleted && !lightMotion}
          variant={confettiVariant}
        />

        {isNextTarget && !isCompleted && !isLocked && (
          <span className="absolute top-1.5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-lime/40 bg-lime/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-lime">
            Next
          </span>
        )}

        {isLocked && (
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-zinc-950/58 backdrop-blur-[1px]"
            aria-hidden
          />
        )}

        {isLocked && (
          <Lock
            className="absolute top-2.5 right-2.5 z-20 h-3.5 w-3.5 text-zinc-500"
            aria-hidden
          />
        )}

        <div
          className={cn(
            "relative z-[1] flex w-full flex-1 flex-col items-center justify-center gap-2 pt-1",
            isLocked && "opacity-55",
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl bg-black/20",
              styles.icon,
            )}
          >
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Icon className="h-5 w-5" />
          </div>

          <p className="line-clamp-2 w-full text-center text-[11px] font-semibold leading-tight">
            {achievement.title}
          </p>
        </div>

        <div className={cn("relative z-[1] flex w-full flex-col gap-1.5", isLocked && "opacity-55")}>
          <div className="flex items-center justify-between gap-1 text-[10px] font-medium">
            <span className={cn("rounded-full px-1.5 py-0.5", styles.badge)}>
              {formatRx(achievement.xp)}
            </span>
            <span className="tabular-nums opacity-80">{progress}%</span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-black/25">
            <motion.div
              className={cn(
                "h-full w-full rounded-full",
                isLocked && "bg-zinc-600",
                isInProgress && "bg-yellow-400",
                status === "completed" && "bg-green-400",
                isElite && "bg-amber-400",
              )}
              initial={lightMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              style={{ transformOrigin: "left center", willChange: "transform" }}
              transition={{
                duration: 0.55,
                delay: index * STAGGER + 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
