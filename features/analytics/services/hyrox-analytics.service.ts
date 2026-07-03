import { format } from "date-fns";
import type { PrismaClient } from "@prisma/client";

import type { HyroxAnalyticsData } from "@/domain/models/analytics";
import {
  findHyroxRaces,
  findHyroxScoreHistory,
  findHyroxWorkoutsSince,
  workoutFilterForView,
} from "@/infrastructure/database";
import { analyzeRaceSplits } from "@/features/predictions";
import { getHyroxScoreSnapshot } from "@/features/scoring";
import { formatHyroxTime, formatPace, HYROX_STATIONS } from "@/lib/hyrox/catalog";
import { RADAR_PREVIOUS_FACTOR } from "@/shared/constants/date-windows";
import { groupCountByWeek, takeLast } from "@/shared/utils/chart-aggregation";

export async function getHyroxAnalytics(
  prisma: PrismaClient,
  userId: string,
): Promise<HyroxAnalyticsData> {
  const workoutWhere = await workoutFilterForView(prisma, userId, "hyrox");

  const [workouts, races, scoreHistory, score] = await Promise.all([
    findHyroxWorkoutsSince(prisma, workoutWhere),
    findHyroxRaces(prisma, userId),
    findHyroxScoreHistory(prisma, userId),
    getHyroxScoreSnapshot(prisma, userId),
  ]);

  const weeklyVolume = takeLast(groupCountByWeek(workouts), 10);

  const byMonth = new Map<string, number>();
  for (const workout of workouts) {
    const key = format(workout.date, "MMM yy");
    byMonth.set(key, (byMonth.get(key) ?? 0) + (workout.durationSeconds ?? 0) / 60);
  }
  const monthlyTraining = Array.from(byMonth.entries())
    .map(([label, value]) => ({ label, value: Math.round(value) }))
    .slice(-8);

  const rpeData = Array.from(byMonth.entries()).map(([label]) => {
    const monthWorkouts = workouts.filter((w) => format(w.date, "MMM yy") === label);
    const avg =
      monthWorkouts.reduce((sum, w) => sum + (w.rpe ?? 6), 0) / Math.max(monthWorkouts.length, 1);
    return { label, value: Number(avg.toFixed(1)) };
  }).slice(-8);

  const finishedRaces = races.filter((race) => race.finishTimeSeconds);
  const racePredictions = finishedRaces.map((race) => ({
    label: format(race.raceDate, "MMM d"),
    value: Math.round((race.finishTimeSeconds ?? 0) / 60),
    display: formatHyroxTime(race.finishTimeSeconds),
  }));

  const paceProgression: { label: string; value: number }[] = [];
  for (const race of finishedRaces) {
    if (race.splits.length === 0) continue;
    const analysis = analyzeRaceSplits(race.splits);
    if (analysis.averageRunPaceSeconds) {
      paceProgression.push({
        label: format(race.raceDate, "MMM d"),
        value: Math.round((analysis.averageRunPaceSeconds / 60) * 100) / 100,
      });
    }
  }

  const stationProgress = HYROX_STATIONS.filter((station) => !station.isRun)
    .map((station) => {
      const times: number[] = [];
      for (const race of finishedRaces) {
        const split = race.splits.find((entry) => entry.stationSlug === station.slug);
        if (split?.timeSeconds) times.push(split.timeSeconds);
      }
      const best = times.length > 0 ? Math.min(...times) : null;
      return {
        station: station.name,
        bestDisplay: best ? formatHyroxTime(best) : "—",
        attempts: times.length,
      };
    })
    .filter((entry) => entry.attempts > 0);

  const scoreSeries = scoreHistory.map((item) => ({
    label: format(item.date, "MMM d"),
    value: Math.round(item.overallScore),
  }));

  const prev = scoreHistory.length > 1 ? scoreHistory[scoreHistory.length - 2] : null;
  const radarData = [
    { metric: "Running", current: score.runningScore, previous: Math.round(prev?.runningScore ?? score.runningScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Engine", current: score.engineScore, previous: Math.round(prev?.engineScore ?? score.engineScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Strength", current: score.strengthScore, previous: Math.round(prev?.strengthScore ?? score.strengthScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Power", current: score.powerScore, previous: Math.round(prev?.powerScore ?? score.powerScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Grip", current: score.gripScore, previous: Math.round(prev?.gripScore ?? score.gripScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Recovery", current: score.recoveryScore, previous: Math.round(prev?.recoveryScore ?? score.recoveryScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Capacity", current: score.workCapacityScore, previous: Math.round(prev?.workCapacityScore ?? score.workCapacityScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Mobility", current: score.mobilityScore, previous: Math.round(prev?.mobilityScore ?? score.mobilityScore * RADAR_PREVIOUS_FACTOR) },
  ];

  const latestRace = finishedRaces[finishedRaces.length - 1];
  const latestAnalysis = latestRace?.splits.length ? analyzeRaceSplits(latestRace.splits) : null;

  return {
    score,
    weeklyVolume,
    monthlyTraining,
    rpeData,
    racePredictions,
    paceProgression,
    stationProgress,
    scoreSeries,
    radarData,
    averageRunPace: latestAnalysis?.averageRunPaceSeconds
      ? formatPace(latestAnalysis.averageRunPaceSeconds)
      : "—",
    totalRaces: finishedRaces.length,
    totalSessions: workouts.length,
  };
}

export async function getHyroxAnalyticsForUser(userId: string): Promise<HyroxAnalyticsData | null> {
  const { getPrismaClient } = await import("@/infrastructure/database/client");
  const prisma = getPrismaClient();
  if (!prisma) return null;

  try {
    return await getHyroxAnalytics(prisma, userId);
  } catch (error) {
    console.error("[analytics] hyrox load failed", error);
    return null;
  }
}
