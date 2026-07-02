import { subDays } from "date-fns";

export function windowStart(now: Date, days: number): Date {
  return subDays(now, days);
}

export function sessionsPerWeek(sessionCount: number, windowDays: number): number {
  if (windowDays <= 0) return 0;
  return (sessionCount / windowDays) * 7;
}

export function groupByIsoWeek<T extends { date: Date }>(
  items: T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const weekStart = new Date(item.date);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    const bucket = groups.get(key) ?? [];
    bucket.push(item);
    groups.set(key, bucket);
  }
  return groups;
}

export function weeklyTotals(values: number[]): number[] {
  return values;
}
