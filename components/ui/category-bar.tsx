"use client";

import { motion } from "framer-motion";

import { AppIcon } from "@/components/ui/app-icon";
import type { IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface CategoryBarProps {
  label: string;
  score: number;
  iconName: IconName;
  rank?: "strongest" | "weakest" | null;
  delay?: number;
  className?: string;
}

export function CategoryBar({
  label,
  score,
  iconName,
  rank,
  delay = 0,
  className,
}: CategoryBarProps) {
  const pct = Math.min(100, Math.max(0, score));

  const barColor =
    score >= 75 ? "bg-lime" : score >= 55 ? "bg-amber-400" : "bg-blue-500";

  const glowColor =
    score >= 75
      ? "shadow-[0_0_12px_rgba(182,255,59,0.4)]"
      : score >= 55
        ? "shadow-[0_0_12px_rgba(251,191,36,0.3)]"
        : "shadow-[0_0_12px_rgba(96,165,250,0.3)]";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5">
        <AppIcon name={iconName} className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-muted-foreground truncate">
            {label}
            {rank === "strongest" && (
              <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-wider text-lime">
                Peak
              </span>
            )}
            {rank === "weakest" && (
              <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-wider text-amber-400">
                Focus
              </span>
            )}
          </span>
          <span className="text-xs font-bold tabular-nums text-foreground ml-3">{score}</span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/6 overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", barColor, glowColor)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{
              duration: 0.9,
              delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        </div>
      </div>
    </div>
  );
}
