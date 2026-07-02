import { format } from "date-fns";

import type { ChartPoint } from "@/domain/models/analytics";
import { DEFAULT_RPE } from "@/shared/constants/date-windows";
import { sumWorkoutVolume } from "@/shared/utils/volume";

type Dated = { date: Date };

export function groupCountByWeek<T extends Dated>(items: T[], labelFormat = "MMM d"): ChartPoint[] {
  const byWeek = new Map<string, number>();
  for (const item of items) {
    const key = format(item.date, labelFormat);
    byWeek.set(key, (byWeek.get(key) ?? 0) + 1);
  }
  return Array.from(byWeek.entries()).map(([label, value]) => ({ label, value }));
}

export function groupVolumeByMonth<T extends Dated & { workoutExercises: Array<{ weightKg: number | null; reps: number | null }> }>(
  workouts: T[],
): ChartPoint[] {
  const byMonth = new Map<string, T[]>();
  for (const workout of workouts) {
    const key = format(workout.date, "MMM yy");
    byMonth.set(key, [...(byMonth.get(key) ?? []), workout]);
  }
  return Array.from(byMonth.entries())
    .map(([label, items]) => ({ label, value: Math.round(sumWorkoutVolume(items)) }))
    .slice(-8);
}

export function groupAverageRpeByMonth<T extends Dated & { rpe: number | null }>(
  workouts: T[],
): ChartPoint[] {
  const byMonth = new Map<string, T[]>();
  for (const workout of workouts) {
    const key = format(workout.date, "MMM yy");
    byMonth.set(key, [...(byMonth.get(key) ?? []), workout]);
  }
  return Array.from(byMonth.entries())
    .map(([label, items]) => ({
      label,
      value: Number(
        (items.reduce((sum, item) => sum + (item.rpe ?? DEFAULT_RPE), 0) / Math.max(items.length, 1)).toFixed(2),
      ),
    }))
    .slice(-8);
}

export function cumulativeCountByMonth<T extends { achievedAt: Date }>(
  items: T[],
): ChartPoint[] {
  const byMonth = new Map<string, number>();
  for (const item of items) {
    const key = format(item.achievedAt, "MMM yy");
    byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
  }
  let cumulative = 0;
  return Array.from(byMonth.entries())
    .map(([label, count]) => {
      cumulative += count;
      return { label, value: cumulative };
    })
    .slice(-8);
}

export function takeLast<T>(items: T[], count: number): T[] {
  return items.slice(-count);
}
