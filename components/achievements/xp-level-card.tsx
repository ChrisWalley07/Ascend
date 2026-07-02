"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

import type { XpPlayerProgress } from "@/features/athlete-achievements/xp";
import { useLightMotion } from "@/lib/hooks/use-light-motion";
import { formatRx, RX } from "@/lib/ascension/labels";
import { cn } from "@/lib/utils";

type Props = {
  progress: XpPlayerProgress;
  className?: string;
};

export function XpLevelCard({ progress, className }: Props) {
  const lightMotion = useLightMotion();

  const cardClass = cn(
    "rounded-2xl border border-border bg-gradient-to-br from-lime/10 via-background to-background p-5",
    lightMotion && "animate-fade-in",
    className,
  );

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Level {progress.currentLevel}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {progress.levelTitle}
          </h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime/15 ring-1 ring-lime/30">
          <Zap className="h-6 w-6 text-lime" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress to Level {progress.currentLevel + 1}</span>
          <span className="font-semibold tabular-nums text-lime">{progress.progressPercent}%</span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-black/30">
          {lightMotion ? (
            <div
              className="h-full rounded-full bg-lime transition-[width] duration-500 ease-out"
              style={{ width: `${progress.progressPercent}%` }}
            />
          ) : (
            <motion.div
              className="h-full rounded-full bg-lime"
              initial={{ width: 0 }}
              animate={{ width: `${progress.progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">
            {progress.xpInCurrentLevel.toLocaleString()} / {progress.xpRequiredForNextLevel.toLocaleString()} {RX}
          </span>
          <span className="tabular-nums">{formatRx(progress.xpToNextLevel)} to go</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Total {RX}</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums">{progress.totalXp.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="inline-flex items-center justify-end gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Next level at
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums">
            {formatRx(progress.xpForNextLevel)}
          </p>
        </div>
      </div>
    </>
  );

  if (lightMotion) {
    return <div className={cardClass}>{content}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardClass}
    >
      {content}
    </motion.div>
  );
}
