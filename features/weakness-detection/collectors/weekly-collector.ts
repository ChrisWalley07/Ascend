import type { PrismaClient } from "@prisma/client";
import { subDays, startOfWeek, format } from "date-fns";

import type { SportView } from "@/domain/models/sport";
import { resolveActiveView } from "@/domain/models/sport";
import { getAthleteScoreSnapshot } from "@/features/scoring";
import { getHyroxScoreSnapshot } from "@/features/scoring";
import { crossfitWorkoutWhere, hyroxWorkoutWhere } from "@/lib/sport/workout-filter";
import { DATE_WINDOWS } from "@/shared/constants/date-windows";

import {
  emptyAttributeScores,
  mapCrossfitHistoryRow,
  mapCrossfitToAttributes,
  mapHyroxHistoryRow,
  mapHyroxToAttributes,
} from "../attributes/map-scores";
import type { WeeklyWeaknessContext, WeaknessEngineOptions } from "../types";

function confidenceFromSamples(recent: number, prior: number, hasHistory: boolean): number {
  const volumeFactor = Math.min(100, (recent + prior) * 15);
  const historyFactor = hasHistory ? 35 : 10;
  return Math.round(Math.min(100, volumeFactor * 0.65 + historyFactor));
}

export async function collectWeeklyWeaknessContext(
  prisma: PrismaClient,
  userId: string,
  options: WeaknessEngineOptions = {},
): Promise<WeeklyWeaknessContext | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { sportDepartment: true, activeSportView: true },
  });

  const sportView =
    options.sportView ??
    resolveActiveView(profile?.sportDepartment ?? "CROSSFIT", profile?.activeSportView);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const priorWeekStart = subDays(weekStart, 7);
  const priorWeekEnd = subDays(weekStart, 1);

  const workoutWhere =
    sportView === "hyrox"
      ? await hyroxWorkoutWhere(prisma, userId)
      : await crossfitWorkoutWhere(prisma, userId);

  const [recentWorkoutCount, priorWorkoutCount] = await Promise.all([
    prisma.workout.count({
      where: { ...workoutWhere, date: { gte: weekStart } },
    }),
    prisma.workout.count({
      where: { ...workoutWhere, date: { gte: priorWeekStart, lte: priorWeekEnd } },
    }),
  ]);

  if (sportView === "hyrox") {
    const [currentScore, history] = await Promise.all([
      getHyroxScoreSnapshot(prisma, userId),
      prisma.hyroxAthleteScore.findMany({
        where: { userId, date: { gte: subDays(now, DATE_WINDOWS.twoWeeks) } },
        orderBy: { date: "asc" },
      }).catch(() => []),
    ]);

    const current = mapHyroxToAttributes(currentScore);
    const priorRow = history.filter((row) => row.date < weekStart).at(-1) ?? history[0];
    const prior = priorRow ? mapHyroxHistoryRow(priorRow) : emptyAttributeScores();

    const confidenceByCategory = Object.fromEntries(
      Object.keys(current).map((key) => [
        key,
        confidenceFromSamples(recentWorkoutCount, priorWorkoutCount, Boolean(priorRow)),
      ]),
    ) as WeeklyWeaknessContext["confidenceByCategory"];

    return {
      sportView,
      collectedAt: now,
      current,
      prior,
      confidenceByCategory,
      recentWorkoutCount,
      priorWorkoutCount,
    };
  }

  const [currentScore, history] = await Promise.all([
    getAthleteScoreSnapshot(userId),
    prisma.athleteScore.findMany({
      where: { userId, date: { gte: subDays(now, DATE_WINDOWS.twoWeeks) } },
      orderBy: { date: "asc" },
    }),
  ]);

  const current = mapCrossfitToAttributes(currentScore);
  const priorRow = history.filter((row) => row.date < weekStart).at(-1) ?? history[0];
  const prior = priorRow ? mapCrossfitHistoryRow(priorRow) : emptyAttributeScores();

  const confidenceByCategory = Object.fromEntries(
    Object.keys(current).map((key) => [
      key,
      confidenceFromSamples(recentWorkoutCount, priorWorkoutCount, Boolean(priorRow)),
    ]),
  ) as WeeklyWeaknessContext["confidenceByCategory"];

  return {
    sportView,
    collectedAt: now,
    current,
    prior,
    confidenceByCategory,
    recentWorkoutCount,
    priorWorkoutCount,
  };
}

export function weekLabel(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return `Week of ${format(start, "MMM d")}`;
}
