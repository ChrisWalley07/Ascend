import type { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

import { getAthleteScoreSnapshot, getHyroxScoreSnapshot } from "@/features/scoring";
import { crossfitWorkoutWhere } from "@/lib/sport/workout-filter";

import type { AchievementMetricSnapshot } from "../types/metrics";
import { HYROX_STATION_PB_PREFIX, METRIC_PB_SLUGS } from "./pb-slug-map";
import { computeTrainingStreakDays } from "./streak";

type PbRow = {
  value: number;
  pbDefinition: {
    slug: string;
    category: string;
    recordType: string;
    scoreDirection: string;
  };
};

function pickBestFromSlugs(
  pbBySlug: ReadonlyMap<string, PbRow>,
  slugs: readonly string[],
  direction: "higher" | "lower",
): number | undefined {
  const values = slugs
    .map((slug) => pbBySlug.get(slug)?.value)
    .filter((value): value is number => value != null && Number.isFinite(value));

  if (values.length === 0) return undefined;
  return direction === "lower" ? Math.min(...values) : Math.max(...values);
}

function parseCindyRounds(row: PbRow | undefined): number | undefined {
  if (!row || !Number.isFinite(row.value) || row.value <= 0) return undefined;
  return Math.round(row.value);
}

async function loadPersonalBests(prisma: PrismaClient, userId: string): Promise<PbRow[]> {
  return prisma.personalBest.findMany({
    where: { userId },
    select: {
      value: true,
      pbDefinition: {
        select: {
          slug: true,
          category: true,
          recordType: true,
          scoreDirection: true,
        },
      },
    },
  });
}

async function loadWorkoutDates(prisma: PrismaClient, userId: string): Promise<Date[]> {
  const rows = await prisma.workout.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: "desc" },
  });
  return rows.map((row) => row.date);
}

export async function collectAchievementMetrics(
  prisma: PrismaClient,
  userId: string,
  asOf: Date = new Date(),
): Promise<AchievementMetricSnapshot> {
  try {
    return await collectAchievementMetricsInternal(prisma, userId, asOf);
  } catch (error) {
    console.error("[achievements] collectAchievementMetrics failed", error);
    return {};
  }
}

async function collectAchievementMetricsInternal(
  prisma: PrismaClient,
  userId: string,
  asOf: Date = new Date(),
): Promise<AchievementMetricSnapshot> {
  const weekAgo = subDays(asOf, 7);
  const crossfitWhere = await crossfitWorkoutWhere(prisma, userId);

  const [
    personalBests,
    workoutDates,
    crossfitWorkoutCount,
    benchmarkPbCount,
    skillMilestoneCount,
    hyroxRaceCount,
    bestHyroxFinish,
    hyroxStationPbCount,
    bestRunningSplit,
    strengthSessionCount,
    techniqueSessionCount,
    runWorkoutCount,
    runDistanceAgg,
    weeklyDistanceAgg,
    stravaRunCount,
    stravaDistanceAgg,
    weeklyStravaDistance,
    longestStravaRun,
    profile,
    athleteScore,
    hyroxScore,
  ] = await Promise.all([
    loadPersonalBests(prisma, userId),
    loadWorkoutDates(prisma, userId),
    prisma.workout.count({ where: crossfitWhere }),
    prisma.personalBest.count({
      where: {
        userId,
        pbDefinition: { category: "BENCHMARK_WOD" },
      },
    }),
    prisma.personalBest.count({
      where: {
        userId,
        pbDefinition: { category: "SKILL_MILESTONE" },
      },
    }),
    prisma.hyroxRace.count({
      where: { userId, finishTimeSeconds: { not: null } },
    }),
    prisma.hyroxRace.findFirst({
      where: { userId, finishTimeSeconds: { not: null } },
      orderBy: { finishTimeSeconds: "asc" },
      select: { finishTimeSeconds: true },
    }),
    prisma.personalBest.count({
      where: {
        userId,
        sport: "HYROX",
        pbDefinition: { slug: { startsWith: HYROX_STATION_PB_PREFIX } },
      },
    }).catch(() => 0),
    prisma.hyroxRaceSplit.findFirst({
      where: {
        race: { userId },
        stationSlug: { contains: "run" },
      },
      orderBy: { timeSeconds: "asc" },
      select: { timeSeconds: true },
    }).catch(() => null),
    prisma.workout.count({
      where: { ...crossfitWhere, type: "STRENGTH" },
    }),
    prisma.workout.count({
      where: { ...crossfitWhere, type: "SKILL" },
    }),
    prisma.workout.count({
      where: {
        userId,
        workoutExercises: { some: { distanceMeters: { gt: 0 } } },
      },
    }),
    prisma.workoutExercise.aggregate({
      where: {
        workout: { userId },
        distanceMeters: { gt: 0 },
      },
      _sum: { distanceMeters: true },
      _max: { distanceMeters: true },
    }),
    prisma.workoutExercise.aggregate({
      where: {
        workout: { userId, date: { gte: weekAgo } },
        distanceMeters: { gt: 0 },
      },
      _sum: { distanceMeters: true },
    }),
    prisma.stravaActivity.count({
      where: { userId, activityType: { in: ["Run", "TrailRun", "VirtualRun"] } },
    }).catch(() => 0),
    prisma.stravaActivity.aggregate({
      where: { userId, distanceMeters: { gt: 0 } },
      _sum: { distanceMeters: true },
      _max: { distanceMeters: true },
    }).catch(() => ({ _sum: { distanceMeters: null }, _max: { distanceMeters: null } })),
    prisma.stravaActivity.aggregate({
      where: {
        userId,
        startDate: { gte: weekAgo },
        distanceMeters: { gt: 0 },
      },
      _sum: { distanceMeters: true },
    }).catch(() => ({ _sum: { distanceMeters: null } })),
    prisma.stravaActivity.findFirst({
      where: { userId, distanceMeters: { gt: 0 } },
      orderBy: { distanceMeters: "desc" },
      select: { distanceMeters: true },
    }).catch(() => null),
    prisma.athleteProfile.findUnique({
      where: { userId },
      select: { weightKg: true },
    }),
    getAthleteScoreSnapshot(userId),
    getHyroxScoreSnapshot(prisma, userId),
  ]);

  const pbBySlug = new Map(personalBests.map((row) => [row.pbDefinition.slug, row]));
  const streakDays = computeTrainingStreakDays(workoutDates, asOf);

  const backSquat = pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.back_squat_1rm_kg ?? [], "higher");
  const snatch = pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.snatch_1rm_kg ?? [], "higher");
  const cleanJerk = pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.clean_jerk_1rm_kg ?? [], "higher");
  const bodyweightKg = profile?.weightKg ?? null;

  const totalDistanceMeters =
    (runDistanceAgg._sum.distanceMeters ?? 0) + (stravaDistanceAgg._sum.distanceMeters ?? 0);
  const weeklyDistanceMeters =
    (weeklyDistanceAgg._sum.distanceMeters ?? 0) + (weeklyStravaDistance._sum.distanceMeters ?? 0);
  const longestRunMeters = Math.max(
    runDistanceAgg._max.distanceMeters ?? 0,
    stravaDistanceAgg._max.distanceMeters ?? 0,
    longestStravaRun?.distanceMeters ?? 0,
  );

  const metrics: AchievementMetricSnapshot = {
    workout_count: crossfitWorkoutCount,
    benchmark_count: benchmarkPbCount,
    streak_days: streakDays,
    gymnastics_skill_count: skillMilestoneCount,
    competition_count: 0,
    quarterfinal_qualified: false,
    engine_score: athleteScore.engineScore,
    overall_score: Math.max(athleteScore.overallScore, hyroxScore.overallScore),
    race_finish_count: hyroxRaceCount,
    race_finish_time_seconds: bestHyroxFinish?.finishTimeSeconds ?? undefined,
    station_pr_count: hyroxStationPbCount,
    running_split_seconds:
      pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.running_split_seconds ?? [], "lower") ??
      bestRunningSplit?.timeSeconds ??
      undefined,
    sled_push_pr: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.sled_push_pr ?? [], "higher"),
    work_capacity_score: hyroxScore.workCapacityScore,
    run_count: runWorkoutCount + stravaRunCount,
    total_distance_km: totalDistanceMeters > 0 ? totalDistanceMeters / 1000 : undefined,
    longest_run_km: longestRunMeters > 0 ? longestRunMeters / 1000 : undefined,
    weekly_mileage_km: weeklyDistanceMeters > 0 ? weeklyDistanceMeters / 1000 : undefined,
    session_count: strengthSessionCount,
    technique_session_count: techniqueSessionCount,
    snatch_1rm_kg: snatch,
    clean_jerk_1rm_kg: cleanJerk,
    squat_1rm_kg: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.squat_1rm_kg ?? [], "higher"),
    total_kg: snatch != null && cleanJerk != null ? snatch + cleanJerk : undefined,
    back_squat_1rm_kg: backSquat,
    back_squat_bodyweight_ratio:
      backSquat != null && bodyweightKg != null && bodyweightKg > 0
        ? backSquat / bodyweightKg
        : undefined,
    fran_time_seconds: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.fran_time_seconds ?? [], "lower"),
    murph_time_seconds: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.murph_time_seconds ?? [], "lower"),
    grace_time_seconds: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.grace_time_seconds ?? [], "lower"),
    isabel_time_seconds: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.isabel_time_seconds ?? [], "lower"),
    helen_time_seconds: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.helen_time_seconds ?? [], "lower"),
    cindy_rounds:
      parseCindyRounds(pbBySlug.get("wod-cindy")) ??
      pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.cindy_rounds ?? [], "higher"),
    pullup_max_reps: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.pullup_max_reps ?? [], "higher"),
    strict_pullup_max_reps: pickBestFromSlugs(
      pbBySlug,
      METRIC_PB_SLUGS.strict_pullup_max_reps ?? [],
      "higher",
    ),
    ctb_max_reps: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.ctb_max_reps ?? [], "higher"),
    bar_muscle_up_max_reps: pickBestFromSlugs(
      pbBySlug,
      METRIC_PB_SLUGS.bar_muscle_up_max_reps ?? [],
      "higher",
    ),
    ring_muscle_up_max_reps: pickBestFromSlugs(
      pbBySlug,
      METRIC_PB_SLUGS.ring_muscle_up_max_reps ?? [],
      "higher",
    ),
    toes_to_bar_max_reps: pickBestFromSlugs(
      pbBySlug,
      METRIC_PB_SLUGS.toes_to_bar_max_reps ?? [],
      "higher",
    ),
    double_under_max_reps: pickBestFromSlugs(
      pbBySlug,
      METRIC_PB_SLUGS.double_under_max_reps ?? [],
      "higher",
    ),
    muscle_up_max_reps: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.muscle_up_max_reps ?? [], "higher"),
    handstand_pushup_max_reps: pickBestFromSlugs(
      pbBySlug,
      METRIC_PB_SLUGS.handstand_pushup_max_reps ?? [],
      "higher",
    ),
    clean_1rm_kg: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.clean_1rm_kg ?? [], "higher"),
    power_clean_1rm_kg: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.power_clean_1rm_kg ?? [], "higher"),
    deadlift_1rm_kg: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.deadlift_1rm_kg ?? [], "higher"),
    shoulder_press_1rm_kg: pickBestFromSlugs(
      pbBySlug,
      METRIC_PB_SLUGS.shoulder_press_1rm_kg ?? [],
      "higher",
    ),
    thruster_1rm_kg: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.thruster_1rm_kg ?? [], "higher"),
    five_k_time_seconds: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.five_k_time_seconds ?? [], "lower"),
    ten_k_time_seconds: pickBestFromSlugs(pbBySlug, METRIC_PB_SLUGS.ten_k_time_seconds ?? [], "lower"),
    half_marathon_time_seconds: pickBestFromSlugs(
      pbBySlug,
      METRIC_PB_SLUGS.half_marathon_time_seconds ?? [],
      "lower",
    ),
    marathon_time_seconds: pickBestFromSlugs(
      pbBySlug,
      METRIC_PB_SLUGS.marathon_time_seconds ?? [],
      "lower",
    ),
  };

  return Object.fromEntries(
    Object.entries(metrics).filter(([, value]) => value !== undefined && value !== null),
  ) as AchievementMetricSnapshot;
}
