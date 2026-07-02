"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { CountUp } from "@/components/ui/count-up";
import type { IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  subtitle?: string;
  iconName?: IconName;
  accentColor?: "lime" | "amber" | "blue" | "teal" | "muted";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  animate?: boolean;
  className?: string;
}

const accentClasses = {
  lime: "text-lime",
  amber: "text-amber-400",
  blue: "text-blue-400",
  teal: "text-teal-400",
  muted: "text-foreground",
};

const iconBgClasses = {
  lime: "bg-lime/10 text-lime",
  amber: "bg-amber-400/10 text-amber-400",
  blue: "bg-blue-400/10 text-blue-400",
  teal: "bg-teal-400/10 text-teal-400",
  muted: "bg-white/5 text-muted-foreground",
};

export function StatCard({
  label,
  value,
  unit,
  subtitle,
  iconName,
  accentColor = "muted",
  trend,
  trendValue,
  animate = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "surface relative overflow-hidden p-5 transition-all duration-200 hover:border-white/12 hover:bg-white/[0.02]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            {animate && typeof value === "number" ? (
              <CountUp
                value={value}
                className={cn(
                  "text-3xl font-bold tracking-tight tabular-nums",
                  accentClasses[accentColor],
                )}
              />
            ) : (
              <span
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  accentClasses[accentColor],
                )}
              >
                {value}
              </span>
            )}
            {unit && (
              <span className="text-sm font-medium text-muted-foreground">{unit}</span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trendValue && trend && (
            <p
              className={cn(
                "mt-1.5 text-xs font-medium",
                trend === "up" && "text-lime",
                trend === "down" && "text-red-400",
                trend === "neutral" && "text-muted-foreground",
              )}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </p>
          )}
        </div>

        {iconName && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              iconBgClasses[accentColor],
            )}
          >
            <AppIcon name={iconName} className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
