"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

import { CountUp } from "@/components/ui/count-up";
import { ZONE_COLORS } from "@/features/recovery-readiness/config";
import type { ReadinessZone } from "@/features/recovery-readiness/types";
import { cn } from "@/lib/utils";

export type ProgressRingZone = ReadinessZone | "neutral";

export type ProgressRingProps = {
  value: number | null;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  zone?: ProgressRingZone;
  showValue?: boolean;
  animate?: boolean;
  className?: string;
  /** When true, lower scores use green (e.g. fatigue) */
  invertZone?: boolean;
};

function svgCoord(value: number): number {
  return parseFloat(value.toFixed(2));
}

function buildTickMarks(size: number, radius: number, strokeWidth: number) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = radius + strokeWidth / 2 + 2;
  const innerR = radius - strokeWidth / 2 - 2;

  return Array.from({ length: 20 }, (_, i) => {
    const rad = ((i / 20) * 360 - 90) * (Math.PI / 180);
    return {
      x1: svgCoord(cx + Math.cos(rad) * outerR),
      y1: svgCoord(cy + Math.sin(rad) * outerR),
      x2: svgCoord(cx + Math.cos(rad) * innerR),
      y2: svgCoord(cy + Math.sin(rad) * innerR),
    };
  });
}

function scoreDotPosition(score: number, size: number, radius: number) {
  const rad = (((score / 100) * 360 - 90) * Math.PI) / 180;
  return {
    cx: svgCoord(size / 2 + Math.cos(rad) * radius),
    cy: svgCoord(size / 2 + Math.sin(rad) * radius),
  };
}

function colorFromZone(zone: ProgressRingZone): string {
  return ZONE_COLORS[zone === "neutral" ? "neutral" : zone];
}

function colorFromScore(score: number): string {
  if (score >= 80) return ZONE_COLORS.green;
  if (score >= 60) return ZONE_COLORS.yellow;
  return ZONE_COLORS.neutral;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  zone,
  showValue = true,
  animate: shouldAnimate = true,
  className,
  invertZone = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const displayValue = value ?? 0;
  const pct = Math.min(max, Math.max(0, displayValue));
  const tickMarks = buildTickMarks(size, radius, strokeWidth);
  const dotPosition = pct > 2 ? scoreDotPosition(pct, size, radius) : null;

  const resolvedZone =
    zone ??
    (value == null
      ? "neutral"
      : invertZone
        ? pct <= 40
          ? "green"
          : pct <= 65
            ? "yellow"
            : "red"
        : pct >= 70
          ? "green"
          : pct >= 50
            ? "yellow"
            : "red");

  const strokeColor = zone ? colorFromZone(resolvedZone) : colorFromScore(invertZone ? 100 - pct : pct);

  const progress = useMotionValue(shouldAnimate ? 0 : pct);
  const dashOffset = useTransform(progress, (v) => circumference - (v / max) * circumference);
  const previousValue = useRef(pct);

  useEffect(() => {
    if (!shouldAnimate) {
      progress.set(pct);
      return;
    }

    const controls = animate(progress, pct, {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
      from: previousValue.current,
    });

    previousValue.current = pct;
    return () => controls.stop();
  }, [pct, max, progress, shouldAnimate]);

  const valueSize = size >= 180 ? "text-5xl" : size >= 140 ? "text-3xl" : "text-2xl";

  return (
    <div
      className={cn("relative flex flex-col items-center gap-2", className)}
      role="img"
      aria-label={label ? `${label}: ${value ?? "—"} out of ${max}` : undefined}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-xl"
          style={{
            background: `radial-gradient(circle, ${strokeColor} 0%, transparent 70%)`,
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {tickMarks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}

          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: dashOffset,
              filter: `drop-shadow(0 0 6px ${strokeColor}80)`,
            }}
          />

          {dotPosition && (
            <motion.circle
              cx={dotPosition.cx}
              cy={dotPosition.cy}
              r={strokeWidth / 2 + 1}
              fill={strokeColor}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.25 }}
            />
          )}
        </svg>

        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {value != null ? (
              <>
                <CountUp
                  value={Math.round(displayValue)}
                  duration={1.2}
                  className={cn("font-bold tracking-tighter text-foreground tabular-nums", valueSize)}
                />
                <span className="text-[10px] text-muted-foreground font-medium">/ {max}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">—</span>
            )}
          </div>
        )}
      </div>

      {(label || sublabel) && (
        <div className="text-center max-w-[140px]">
          {label && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground leading-tight">
              {label}
            </p>
          )}
          {sublabel && (
            <p className="mt-0.5 text-[10px] text-muted-foreground/70 leading-snug">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
