"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Flame,
  Medal,
  Target,
  Timer,
  Trophy,
} from "lucide-react";

import type { ProfileScreenStats } from "@/app/actions/profile-screen";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

type Props = {
  stats: ProfileScreenStats;
  className?: string;
};

const statItems = [
  { key: "overallScore", label: "Athlete score", icon: Trophy, suffix: "" },
  { key: "totalWorkouts", label: "Workouts logged", icon: Activity, suffix: "" },
  { key: "workoutsLast30Days", label: "Last 30 days", icon: Timer, suffix: "" },
  { key: "personalBestsLogged", label: "Personal records", icon: Medal, suffix: "" },
  { key: "benchmarksLogged", label: "Benchmark attempts", icon: Target, suffix: "" },
  { key: "trainingStreakDays", label: "Training streak", icon: Flame, suffix: " days" },
] as const;

export function ProfileStatsSection({ stats, className }: Props) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Statistics
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground">Training snapshot</h2>
        </div>
        {stats.goalAlignmentScore > 0 && (
          <div className="rounded-full border border-lime/25 bg-lime/8 px-3 py-1 text-xs font-semibold text-lime">
            {stats.goalAlignmentScore}% goal aligned
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          const value = stats[item.key];

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              className="surface-raised p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4 text-lime/80" />
                <p className="text-[11px] font-semibold uppercase tracking-wider">{item.label}</p>
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums text-foreground">
                <CountUp value={value} duration={0.9} />
                {item.suffix}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
