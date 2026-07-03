import { format } from "date-fns";
import type { PrismaClient } from "@prisma/client";

import type { CrossfitAnalyticsData } from "@/domain/models/analytics";
import {
  findAthleteScoreHistory,
  findPersonalRecordHistory,
  findWorkoutsForAnalytics,
} from "@/infrastructure/database";
import { getAthleteScoreSnapshot } from "@/features/scoring";
import { RADAR_PREVIOUS_FACTOR } from "@/shared/constants/date-windows";
import {
  cumulativeCountByMonth,
  groupAverageRpeByMonth,
  groupCountByWeek,
  groupVolumeByMonth,
  takeLast,
} from "@/shared/utils/chart-aggregation";

function buildRadarData(
  score: Awaited<ReturnType<typeof getAthleteScoreSnapshot>>,
  prev: { strengthScore: number; olympicLiftingScore: number; engineScore: number; gymnasticsScore: number; powerScore: number; consistencyScore: number; recoveryScore: number; mobilityScore: number } | null,
) {
  return [
    { metric: "Strength", current: score.strengthScore, previous: Math.round(prev?.strengthScore ?? score.strengthScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Olympic", current: score.olympicLiftingScore, previous: Math.round(prev?.olympicLiftingScore ?? score.olympicLiftingScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Engine", current: score.engineScore, previous: Math.round(prev?.engineScore ?? score.engineScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Gymnastics", current: score.gymnasticsScore, previous: Math.round(prev?.gymnasticsScore ?? score.gymnasticsScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Power", current: score.powerScore, previous: Math.round(prev?.powerScore ?? score.powerScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Consistency", current: score.consistencyScore, previous: Math.round(prev?.consistencyScore ?? score.consistencyScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Recovery", current: score.recoveryScore, previous: Math.round(prev?.recoveryScore ?? score.recoveryScore * RADAR_PREVIOUS_FACTOR) },
    { metric: "Mobility", current: score.mobilityScore, previous: Math.round(prev?.mobilityScore ?? score.mobilityScore * RADAR_PREVIOUS_FACTOR) },
  ];
}

export async function getCrossfitAnalytics(
  prisma: PrismaClient,
  userId: string,
): Promise<CrossfitAnalyticsData> {
  const score = await getAthleteScoreSnapshot(userId);
  const [workouts, prHistory, scoreHistory] = await Promise.all([
    findWorkoutsForAnalytics(prisma, userId, "crossfit"),
    findPersonalRecordHistory(prisma, userId),
    findAthleteScoreHistory(prisma, userId),
  ]);

  const frequencyData = takeLast(groupCountByWeek(workouts), 10);
  const volumeData = groupVolumeByMonth(workouts);
  const rpeData = groupAverageRpeByMonth(workouts);
  const prData = cumulativeCountByMonth(prHistory);
  const scoreSeries = scoreHistory.map((item) => ({
    label: format(item.date, "MMM d"),
    value: Math.round(item.overallScore),
  }));

  const prev = scoreHistory.length > 1 ? scoreHistory[scoreHistory.length - 2] : null;

  return {
    score,
    frequencyData,
    volumeData,
    rpeData,
    prData,
    scoreSeries,
    radarData: buildRadarData(score, prev),
    totalPrs: prHistory.length,
  };
}

export async function getCrossfitAnalyticsForUser(userId: string): Promise<CrossfitAnalyticsData | null> {
  const { getPrismaClient } = await import("@/infrastructure/database/client");
  const prisma = getPrismaClient();
  if (!prisma) return null;

  try {
    return await getCrossfitAnalytics(prisma, userId);
  } catch (error) {
    console.error("[analytics] crossfit load failed", error);
    return null;
  }
}
