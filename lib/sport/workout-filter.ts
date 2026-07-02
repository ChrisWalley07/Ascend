import type { Prisma, PrismaClient, SportDepartment } from "@prisma/client";

import { HYROX_BENCHMARKS } from "@/lib/hyrox/catalog";
import { isMissingSchemaError } from "@/lib/prisma/schema-compat";

const cache = {
  workoutSport: null as boolean | null,
  goalSport: null as boolean | null,
  benchmarkSport: null as boolean | null,
};

async function probe<T>(run: () => Promise<T>): Promise<boolean> {
  try {
    await run();
    return true;
  } catch (error) {
    if (isMissingSchemaError(error)) return false;
    throw error;
  }
}

export async function hasWorkoutSportColumn(prisma: PrismaClient): Promise<boolean> {
  if (cache.workoutSport !== null) return cache.workoutSport;
  cache.workoutSport = await probe(() =>
    prisma.workout.findFirst({ where: { sport: "CROSSFIT" }, select: { id: true } }),
  );
  return cache.workoutSport;
}

export async function hasGoalSportColumn(prisma: PrismaClient): Promise<boolean> {
  if (cache.goalSport !== null) return cache.goalSport;
  cache.goalSport = await probe(() =>
    prisma.goal.findFirst({ where: { sport: "HYROX" }, select: { id: true } }),
  );
  return cache.goalSport;
}

export async function hasBenchmarkSportColumn(prisma: PrismaClient): Promise<boolean> {
  if (cache.benchmarkSport !== null) return cache.benchmarkSport;
  cache.benchmarkSport = await probe(() =>
    prisma.benchmark.findFirst({ where: { sport: "HYROX" }, select: { id: true } }),
  );
  return cache.benchmarkSport;
}

export async function hyroxWorkoutWhere(
  prisma: PrismaClient,
  userId: string,
): Promise<Prisma.WorkoutWhereInput> {
  const hasSport = await hasWorkoutSportColumn(prisma);
  return hasSport ? { userId, sport: "HYROX" } : { userId };
}

export async function crossfitWorkoutWhere(
  prisma: PrismaClient,
  userId: string,
): Promise<Prisma.WorkoutWhereInput> {
  const hasSport = await hasWorkoutSportColumn(prisma);
  return hasSport ? { userId, sport: "CROSSFIT" } : { userId };
}

export async function hyroxGoalWhere(
  prisma: PrismaClient,
): Promise<Prisma.GoalWhereInput> {
  const hasSport = await hasGoalSportColumn(prisma);
  if (hasSport) {
    return { OR: [{ sport: "HYROX" }, { sport: "HYBRID" }, { sport: null }] };
  }
  return {};
}

export async function benchmarkWhereForView(
  prisma: PrismaClient,
  activeView: "crossfit" | "hyrox",
): Promise<Prisma.BenchmarkWhereInput> {
  const hasSport = await hasBenchmarkSportColumn(prisma);
  if (hasSport) {
    return activeView === "hyrox"
      ? { sport: "HYROX" }
      : { OR: [{ sport: "CROSSFIT" }, { sport: null }] };
  }
  if (activeView === "hyrox") {
    return { name: { in: HYROX_BENCHMARKS.map((b) => b.name) } };
  }
  return {};
}
