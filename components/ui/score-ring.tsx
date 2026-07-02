"use client";

import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function ScoreRing({
  score,
  size = 240,
  strokeWidth = 10,
  label = "Athlete Score",
  sublabel,
  className,
}: ScoreRingProps) {
  return (
    <ProgressRing
      value={score}
      size={size}
      strokeWidth={strokeWidth}
      label={label}
      sublabel={sublabel}
      className={cn("gap-3", className)}
      showValue
    />
  );
}
