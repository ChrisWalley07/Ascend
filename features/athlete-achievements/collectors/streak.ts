import { differenceInCalendarDays, startOfDay } from "date-fns";

/**
 * Longest consecutive calendar-day training streak ending on or before `asOf`.
 */
export function computeTrainingStreakDays(dates: readonly Date[], asOf: Date): number {
  if (dates.length === 0) return 0;

  const uniqueDays = [
    ...new Set(dates.map((date) => startOfDay(date).getTime())),
  ]
    .map((ms) => new Date(ms))
    .filter((date) => date.getTime() <= startOfDay(asOf).getTime())
    .sort((a, b) => b.getTime() - a.getTime());

  if (uniqueDays.length === 0) return 0;

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const gap = differenceInCalendarDays(uniqueDays[index - 1]!, uniqueDays[index]!);
    if (gap === 1) {
      streak += 1;
      continue;
    }
    break;
  }

  return streak;
}
