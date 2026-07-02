import type { Prisma, PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

import { pbRecordWhereForView } from "@/lib/pb-seed";
import { isMissingSchemaError } from "@/lib/prisma/schema-compat";
import { crossfitWorkoutWhere, hyroxWorkoutWhere } from "@/lib/sport/workout-filter";
import { resolveActiveView } from "@/lib/sports/types";
import type { SportView } from "@/lib/sports/types";

import { mergeEngineConfig } from "../config";
import type {
  BenchmarkAttemptSnapshot,
  IntelligenceEngineOptions,
  IntelligenceRawData,
  PersonalBestSnapshot,
  ProfileSnapshot,
  RaceSnapshot,
  RecoverySnapshot,
  WorkoutSnapshot,
} from "../types";

type WorkoutRow = {
  id: string;
  date: Date;
  type: string;
  durationSeconds: number | null;
  rpe: number | null;
  sport: string | null;
  workoutExercises: Array<{
    weightKg: number | null;
    reps: number | null;
    distanceMeters: number | null;
    timeSeconds: number | null;
    calories: number | null;
    exercise: { category: string; name: string };
  }>;
};

type RecoveryRow = {
  date: Date;
  readinessScore: number;
  sleepHours: number | null;
  restingHeartRate: number | null;
  hrv: number | null;
  mood: number | null;
  energy: number | null;
  soreness: number | null;
  hydration: number | null;
};

type BenchmarkRow = {
  score: string;
  scoreValue: number | null;
  date: Date;
  benchmark: { name: string; type: string };
};

type PersonalBestRow = {
  value: number;
  displayValue: string;
  achievedAt: Date;
  pbDefinition: {
    slug: string;
    name: string;
    category: string;
    recordType: string;
    scoreDirection: string;
  };
};

type RaceRow = {
  id: string;
  name: string | null;
  raceDate: Date;
  finishTimeSeconds: number | null;
  predictedFinishSeconds: number | null;
  weakestStationSlug: string | null;
  strongestStationSlug: string | null;
  splits: Array<{
    stationSlug: string;
    sequence: number;
    timeSeconds: number | null;
    pacePerKmSeconds: number | null;
  }>;
};

async function workoutWhereForView(
  prisma: PrismaClient,
  userId: string,
  sportView: SportView,
): Promise<Prisma.WorkoutWhereInput> {
  if (sportView === "hyrox") {
    return hyroxWorkoutWhere(prisma, userId);
  }
  return crossfitWorkoutWhere(prisma, userId);
}

function mapWorkouts(rows: WorkoutRow[]): WorkoutSnapshot[] {
  return rows.map((workout) => ({
    id: workout.id,
    date: workout.date,
    type: workout.type,
    durationSeconds: workout.durationSeconds,
    rpe: workout.rpe,
    sport: (workout.sport as WorkoutSnapshot["sport"]) ?? null,
    exercises: workout.workoutExercises.map((entry) => ({
      weightKg: entry.weightKg,
      reps: entry.reps,
      distanceMeters: entry.distanceMeters,
      timeSeconds: entry.timeSeconds,
      calories: entry.calories,
      category: entry.exercise.category,
      name: entry.exercise.name,
    })),
  }));
}

function mapRecoveryLogs(rows: RecoveryRow[]): RecoverySnapshot[] {
  return rows.map((log) => ({
    date: log.date,
    readinessScore: log.readinessScore,
    sleepHours: log.sleepHours,
    restingHeartRate: log.restingHeartRate,
    hrv: log.hrv,
    mood: log.mood,
    energy: log.energy,
    soreness: log.soreness,
    hydration: log.hydration,
  }));
}

function mapBenchmarkAttempts(rows: BenchmarkRow[]): BenchmarkAttemptSnapshot[] {
  return rows.map((attempt) => ({
    benchmarkName: attempt.benchmark.name,
    benchmarkType: attempt.benchmark.type,
    score: attempt.scoreValue ?? (Number.parseFloat(attempt.score) || 0),
    scoreValue: attempt.scoreValue,
    date: attempt.date,
  }));
}

function mapPersonalBests(rows: PersonalBestRow[]): PersonalBestSnapshot[] {
  return rows.map((pb) => ({
    slug: pb.pbDefinition.slug,
    name: pb.pbDefinition.name,
    category: pb.pbDefinition.category,
    value: pb.value,
    displayValue: pb.displayValue,
    achievedAt: pb.achievedAt,
    recordType: pb.pbDefinition.recordType,
    scoreDirection: pb.pbDefinition.scoreDirection,
  }));
}

function mapRaces(rows: RaceRow[]): RaceSnapshot[] {
  return rows.map((race) => ({
    id: race.id,
    name: race.name ?? "Hyrox Race",
    raceDate: race.raceDate,
    finishTimeSeconds: race.finishTimeSeconds,
    predictedFinishSeconds: race.predictedFinishSeconds,
    weakestStationSlug: race.weakestStationSlug,
    strongestStationSlug: race.strongestStationSlug,
    splits: race.splits.map((split) => ({
      stationSlug: split.stationSlug,
      sequence: split.sequence,
      timeSeconds: split.timeSeconds,
      pacePerKmSeconds: split.pacePerKmSeconds,
    })),
  }));
}

function mapProfile(
  profile: {
    trainingDaysPerWeek: number | null;
    experienceLevel: string | null;
    primaryGoal: string | null;
    sportDepartment: ProfileSnapshot["sportDepartment"];
    focusAreas: string[];
  } | null,
): ProfileSnapshot | null {
  if (!profile) return null;
  return {
    trainingDaysPerWeek: profile.trainingDaysPerWeek,
    experienceLevel: profile.experienceLevel,
    primaryGoal: profile.primaryGoal,
    sportDepartment: profile.sportDepartment,
    focusAreas: profile.focusAreas,
  };
}

export async function collectIntelligenceData(
  prisma: PrismaClient,
  userId: string,
  options: IntelligenceEngineOptions = {},
): Promise<IntelligenceRawData | null> {
  const config = mergeEngineConfig(options.config);
  const now = new Date();

  const profile = await prisma.athleteProfile.findUnique({ where: { userId } });
  const athleteType = profile?.sportDepartment ?? "CROSSFIT";
  const activeView = options.sportView ?? resolveActiveView(athleteType, profile?.activeSportView);

  const analysisStart = subDays(now, config.analysisWindowDays);
  const recoveryStart = subDays(now, config.recoveryWindowDays);
  const benchmarkStart = subDays(now, config.benchmarkWindowDays);

  const workoutWhere = await workoutWhereForView(prisma, userId, activeView);
  const pbWhere = pbRecordWhereForView(activeView);

  try {
    const [workouts, recoveryLogs, benchmarkAttempts, personalBests, races] = await Promise.all([
      prisma.workout.findMany({
        where: { ...workoutWhere, date: { gte: analysisStart } },
        orderBy: { date: "asc" },
        include: {
          workoutExercises: {
            include: { exercise: { select: { category: true, name: true } } },
          },
        },
      }),
      prisma.recoveryLog.findMany({
        where: { userId, date: { gte: recoveryStart } },
        orderBy: { date: "asc" },
      }),
      prisma.benchmarkAttempt.findMany({
        where: { userId, date: { gte: benchmarkStart } },
        orderBy: { date: "asc" },
        include: { benchmark: { select: { name: true, type: true, sport: true } } },
      }),
      prisma.personalBest.findMany({
        where: { userId, ...pbWhere },
        include: {
          pbDefinition: {
            select: {
              slug: true,
              name: true,
              category: true,
              recordType: true,
              scoreDirection: true,
            },
          },
        },
      }).catch(async (error) => {
        if (!isMissingSchemaError(error)) throw error;
        const definitions = await prisma.pbDefinition.findMany({
          where:
            activeView === "hyrox"
              ? { slug: { startsWith: "hyrox-" } }
              : { NOT: { slug: { startsWith: "hyrox-" } } },
          select: { id: true },
        });
        return prisma.personalBest.findMany({
          where: { userId, pbDefinitionId: { in: definitions.map((d) => d.id) } },
          include: {
            pbDefinition: {
              select: {
                slug: true,
                name: true,
                category: true,
                recordType: true,
                scoreDirection: true,
              },
            },
          },
        });
      }),
      activeView === "hyrox"
        ? prisma.hyroxRace
            .findMany({
              where: { userId },
              orderBy: { raceDate: "asc" },
              include: { splits: { orderBy: { sequence: "asc" } } },
            })
            .catch(() => [] as RaceRow[])
        : Promise.resolve([] as RaceRow[]),
    ]);

    return {
      userId,
      sportView: activeView,
      athleteType,
      collectedAt: now,
      workouts: mapWorkouts(workouts),
      recoveryLogs: mapRecoveryLogs(recoveryLogs),
      benchmarkAttempts: mapBenchmarkAttempts(benchmarkAttempts),
      personalBests: mapPersonalBests(personalBests),
      races: mapRaces(races),
      profile: mapProfile(profile),
    };
  } catch (error) {
    console.error("[athlete-intelligence] collect failed", error);
    return null;
  }
}
