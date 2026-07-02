import type { PrismaClient } from "@prisma/client";

import { HYROX_STATIONS } from "@/lib/hyrox/catalog";
import { hyroxWorkoutWhere } from "@/lib/sport/workout-filter";

export type HyroxScoreSnapshot = {
  overallScore: number;
  runningScore: number;
  engineScore: number;
  strengthScore: number;
  powerScore: number;
  gripScore: number;
  recoveryScore: number;
  workCapacityScore: number;
  mobilityScore: number;
  mentalScore: number;
  level: number;
};

const HYROX_EXERCISE_KEYWORDS: Record<string, keyof Omit<HyroxScoreSnapshot, "overallScore" | "level">> = {
  run: "runningScore",
  ski: "engineScore",
  row: "engineScore",
  bike: "engineScore",
  sled: "powerScore",
  burpee: "engineScore",
  farmer: "gripScore",
  sandbag: "strengthScore",
  lunge: "strengthScore",
  wall: "powerScore",
  squat: "strengthScore",
  deadlift: "strengthScore",
  mobility: "mobilityScore",
};

function scoreFromSessions(count: number, base: number, cap: number) {
  return Math.min(cap, Math.round(base + count * 8));
}

export async function computeHyroxScoreSnapshot(
  prisma: PrismaClient,
  userId: string,
): Promise<HyroxScoreSnapshot> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const workoutWhere = await hyroxWorkoutWhere(prisma, userId);

  const [workouts, recoveryLogs, races] = await Promise.all([
    prisma.workout.findMany({
      where: {
        ...workoutWhere,
        date: { gte: ninetyDaysAgo },
      },
      include: {
        workoutExercises: { include: { exercise: { select: { name: true } } } },
      },
      orderBy: { date: "desc" },
      take: 40,
    }),
    prisma.recoveryLog.findMany({
      where: { userId, date: { gte: ninetyDaysAgo } },
      orderBy: { date: "desc" },
      take: 14,
    }),
    prisma.hyroxRace.findMany({
      where: { userId },
      orderBy: { raceDate: "desc" },
      take: 5,
    }).catch(() => [] as Awaited<ReturnType<typeof prisma.hyroxRace.findMany>>),
  ]);

  const scores: Omit<HyroxScoreSnapshot, "overallScore" | "level"> = {
    runningScore: 45,
    engineScore: 45,
    strengthScore: 45,
    powerScore: 45,
    gripScore: 45,
    recoveryScore: 55,
    workCapacityScore: 45,
    mobilityScore: 50,
    mentalScore: 50,
  };

  for (const workout of workouts) {
    const haystack = `${workout.name} ${workout.notes ?? ""}`.toLowerCase();
    for (const ex of workout.workoutExercises) {
      const name = ex.exercise.name.toLowerCase();
      for (const [keyword, key] of Object.entries(HYROX_EXERCISE_KEYWORDS)) {
        if (name.includes(keyword) || haystack.includes(keyword)) {
          scores[key] = Math.min(95, scores[key] + 4);
        }
      }
      if (ex.timeSeconds && ex.distanceMeters && ex.distanceMeters >= 1000) {
        scores.runningScore = Math.min(95, scores.runningScore + 5);
      }
    }
    scores.workCapacityScore = Math.min(95, scores.workCapacityScore + 3);
  }

  if (recoveryLogs.length > 0) {
    const avg = recoveryLogs.reduce((s, r) => s + r.readinessScore, 0) / recoveryLogs.length;
    scores.recoveryScore = Math.round(Math.min(95, avg));
  }

  scores.workCapacityScore = scoreFromSessions(workouts.length, scores.workCapacityScore, 92);
  if (races.length > 0) scores.mentalScore = Math.min(95, 55 + races.length * 10);

  const overallScore = Math.round(
    scores.runningScore * 0.2 +
      scores.engineScore * 0.15 +
      scores.strengthScore * 0.1 +
      scores.powerScore * 0.12 +
      scores.gripScore * 0.08 +
      scores.recoveryScore * 0.1 +
      scores.workCapacityScore * 0.15 +
      scores.mobilityScore * 0.05 +
      scores.mentalScore * 0.05,
  );

  return {
    ...scores,
    overallScore,
    level: Math.max(1, Math.floor(overallScore / 12)),
  };
}

export async function getHyroxScoreSnapshot(
  prisma: PrismaClient,
  userId: string,
): Promise<HyroxScoreSnapshot> {
  try {
    const latest = await prisma.hyroxAthleteScore.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (latest && latest.date >= today) {
      return {
        overallScore: latest.overallScore,
        runningScore: latest.runningScore,
        engineScore: latest.engineScore,
        strengthScore: latest.strengthScore,
        powerScore: latest.powerScore,
        gripScore: latest.gripScore,
        recoveryScore: latest.recoveryScore,
        workCapacityScore: latest.workCapacityScore,
        mobilityScore: latest.mobilityScore,
        mentalScore: latest.mentalScore,
        level: Math.max(1, Math.floor(latest.overallScore / 12)),
      };
    }

    const computed = await computeHyroxScoreSnapshot(prisma, userId);

    await prisma.hyroxAthleteScore.create({
      data: {
        userId,
        overallScore: computed.overallScore,
        runningScore: computed.runningScore,
        engineScore: computed.engineScore,
        strengthScore: computed.strengthScore,
        powerScore: computed.powerScore,
        gripScore: computed.gripScore,
        recoveryScore: computed.recoveryScore,
        workCapacityScore: computed.workCapacityScore,
        mobilityScore: computed.mobilityScore,
        mentalScore: computed.mentalScore,
      },
    });

    return computed;
  } catch {
    return computeHyroxScoreSnapshot(prisma, userId);
  }
}

export type StationProgress = {
  slug: string;
  name: string;
  bestSeconds: number | null;
  worstSeconds: number | null;
  avgSeconds: number | null;
  lastAttemptAt: Date | null;
  attemptCount: number;
  trend: "up" | "down" | "flat";
};

export async function getHyroxStationProgress(
  prisma: PrismaClient,
  userId: string,
): Promise<StationProgress[]> {
  let splits: Awaited<
    ReturnType<
      typeof prisma.hyroxRaceSplit.findMany<{
        include: { race: { select: { raceDate: true } } };
      }>
    >
  >;
  try {
    splits = await prisma.hyroxRaceSplit.findMany({
      where: { race: { userId }, timeSeconds: { not: null } },
      include: { race: { select: { raceDate: true } } },
      orderBy: { race: { raceDate: "desc" } },
    });
  } catch {
    return HYROX_STATIONS.map((station) => ({
      slug: station.slug,
      name: station.name,
      bestSeconds: null,
      worstSeconds: null,
      avgSeconds: null,
      lastAttemptAt: null,
      attemptCount: 0,
      trend: "flat" as const,
    }));
  }

  return HYROX_STATIONS.map((station) => {
    const stationSplits = splits
      .filter((s) => s.stationSlug === station.slug && s.timeSeconds)
      .map((s) => ({ time: s.timeSeconds!, date: s.race.raceDate }));

    if (stationSplits.length === 0) {
      return {
        slug: station.slug,
        name: station.name,
        bestSeconds: null,
        worstSeconds: null,
        avgSeconds: null,
        lastAttemptAt: null,
        attemptCount: 0,
        trend: "flat" as const,
      };
    }

    const times = stationSplits.map((s) => s.time);
    const best = Math.min(...times);
    const worst = Math.max(...times);
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const recent = stationSplits[0]?.time ?? 0;
    const older = stationSplits[stationSplits.length - 1]?.time ?? recent;
    const trend = recent < older ? "up" : recent > older ? "down" : "flat";

    return {
      slug: station.slug,
      name: station.name,
      bestSeconds: best,
      worstSeconds: worst,
      avgSeconds: avg,
      lastAttemptAt: stationSplits[0]?.date ?? null,
      attemptCount: stationSplits.length,
      trend,
    };
  });
}
