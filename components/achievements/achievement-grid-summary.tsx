"use client";

import { motion } from "framer-motion";

import type { AchievementEngineResult } from "@/features/athlete-achievements/engine/types";
import { AnimatedPercentCounter } from "@/components/achievements/animations/animated-percent-counter";
import { CountUp } from "@/components/ui/count-up";
import { useLightMotion } from "@/lib/hooks/use-light-motion";
import { cn } from "@/lib/utils";
import { RX } from "@/lib/ascension/labels";

type SummaryProps = {
  result: AchievementEngineResult;
  className?: string;
};

export function AchievementGridSummary({ result, className }: SummaryProps) {
  const lightMotion = useLightMotion();
  const unlockedCount = result.available.length + result.completed.length;

  const gridClass = cn(
    "grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/20 p-4 sm:grid-cols-4",
    lightMotion && "animate-fade-in",
    className,
  );

  const content = (
    <>
      <div className="text-center sm:text-left">
        <p className="text-xs text-muted-foreground">Completion</p>
        <p className="mt-0.5 text-lg font-bold">
          <AnimatedPercentCounter value={result.completionPercent} />
        </p>
      </div>

      <div className="text-center sm:text-left">
        <p className="text-xs text-muted-foreground">{RX} earned</p>
        <p className="mt-0.5 text-lg font-bold tabular-nums">
          <CountUp value={result.earnedXp} duration={lightMotion ? 0 : 1.1} />
        </p>
      </div>

      <div className="text-center sm:text-left">
        <p className="text-xs text-muted-foreground">Unlocked</p>
        <p className="mt-0.5 text-lg font-bold tabular-nums">
          <CountUp value={unlockedCount} duration={lightMotion ? 0 : 0.9} />
        </p>
      </div>

      <div className="text-center sm:text-left">
        <p className="text-xs text-muted-foreground">Completed</p>
        <p className="mt-0.5 text-lg font-bold tabular-nums">
          <CountUp value={result.completed.length} duration={lightMotion ? 0 : 0.9} />
        </p>
      </div>
    </>
  );

  if (lightMotion) {
    return <div className={gridClass}>{content}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={gridClass}
    >
      {content}
    </motion.div>
  );
}
