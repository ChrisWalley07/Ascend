"use server";

import { revalidatePath } from "next/cache";

import type { Gender, HyroxWorkoutType } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import {
  appendAchievementMessage,
  syncAchievementsAfterActivity,
} from "@/lib/achievements/sync-after-activity";
import { analyzeRaceSplits } from "@/lib/hyrox/predictor";
import {
  HYROX_EXERCISES,
  HYROX_STATIONS,
  formatHyroxTime,
  formatPace,
} from "@/lib/hyrox/catalog";
import { parseTimeToSeconds } from "@/lib/pb-format";
import {
  getHyroxScoreSnapshot,
  getHyroxStationProgress,
  type HyroxScoreSnapshot,
} from "@/lib/hyrox/score";
import { getPrismaClient } from "@/lib/prisma";
import { isMissingSchemaError } from "@/lib/prisma/schema-compat";
import { hyroxGoalWhere, hyroxWorkoutWhere, hasWorkoutSportColumn } from "@/lib/sport/workout-filter";
import { predictFinishFromSessions } from "@/lib/hyrox/predictor";

export async function getHyroxDashboardData(userId: string) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return emptyHyroxDashboard();
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workoutWhere = await hyroxWorkoutWhere(prisma, userId);
    const goalSportFilter = await hyroxGoalWhere(prisma);
    const recentWorkoutWhere = { ...workoutWhere, date: { gte: thirtyDaysAgo } };

    const [
      profile,
      score,
      stationProgress,
      lastWorkout,
      recentWorkouts,
      upcomingRace,
      latestRace,
      goals,
      weeklyVolume,
    ] = await Promise.all([
      prisma.athleteProfile.findUnique({
        where: { userId },
        select: { name: true, competitionTarget: true },
      }),
      getHyroxScoreSnapshot(prisma, userId),
      getHyroxStationProgress(prisma, userId),
      prisma.workout.findFirst({
        where: workoutWhere,
        orderBy: { date: "desc" },
      }),
      prisma.workout.findMany({
        where: recentWorkoutWhere,
        orderBy: { date: "desc" },
        take: 10,
      }),
      prisma.hyroxRace.findFirst({
        where: { userId, raceDate: { gte: new Date() } },
        orderBy: { raceDate: "asc" },
      }).catch(() => null),
      prisma.hyroxRace.findFirst({
        where: { userId },
        orderBy: { raceDate: "desc" },
        include: { splits: { orderBy: { sequence: "asc" } } },
      }).catch(() => null),
      prisma.goal.findMany({
        where: {
          userId,
          status: "ACTIVE",
          ...goalSportFilter,
        },
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
      prisma.workout.count({
        where: recentWorkoutWhere,
      }),
    ]);

    let prediction = null;
    if (latestRace?.splits.length) {
      prediction = analyzeRaceSplits(latestRace.splits);
    }

    const recentFinishes = latestRace?.finishTimeSeconds ? [latestRace.finishTimeSeconds] : [];
    const pacePrediction = predictFinishFromSessions(recentFinishes, weeklyVolume / 4.3);

    const insights: string[] = [];
    if (prediction?.weakestStation) {
      insights.push(`${prediction.weakestStation.name} is your limiting station right now.`);
    }
    if (prediction?.strongestStation) {
      insights.push(`${prediction.strongestStation.name} is your strongest station.`);
    }
    if (pacePrediction) {
      insights.push(
        `Based on current progress you could hit ${pacePrediction.targetDisplay} in ~${pacePrediction.weeks} weeks.`,
      );
    }
    if (score.runningScore >= 70) {
      insights.push("Running pace is trending in the right direction.");
    }

    return {
      athleteName: profile?.name ?? "Athlete",
      score,
      stationProgress,
      lastWorkout,
      recentWorkouts,
      upcomingRace,
      latestRace,
      prediction,
      goals,
      weeklySessionCount: weeklyVolume,
      predictedFinishDisplay:
        latestRace?.predictedFinishSeconds != null
          ? formatHyroxTime(latestRace.predictedFinishSeconds)
          : prediction?.predictedDisplay ?? "—",
      averageRunPace: prediction?.averageRunPaceSeconds
        ? formatPace(prediction.averageRunPaceSeconds)
        : "—",
      insights,
      profileComplete: Boolean(profile?.name),
    };
  } catch (error) {
    console.error("[hyrox-dashboard]", error);
    return emptyHyroxDashboard();
  }
}

function emptyHyroxDashboard() {
  return {
    athleteName: "Athlete",
    score: defaultHyroxScore(),
    stationProgress: [],
    lastWorkout: null,
    recentWorkouts: [],
    upcomingRace: null,
    latestRace: null,
    prediction: null,
    goals: [],
    weeklySessionCount: 0,
    predictedFinishDisplay: "—",
    averageRunPace: "—",
    insights: [] as string[],
    profileComplete: false,
  };
}

function defaultHyroxScore(): HyroxScoreSnapshot {
  return {
    overallScore: 50,
    runningScore: 50,
    engineScore: 50,
    strengthScore: 50,
    powerScore: 50,
    gripScore: 50,
    recoveryScore: 55,
    workCapacityScore: 50,
    mobilityScore: 50,
    mentalScore: 50,
    level: 4,
  };
}

export async function saveHyroxWorkoutAction(formData: FormData) {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return { error: "Database not configured." };

  const name = String(formData.get("name") ?? "Hyrox Session").trim();
  const hyroxType = String(formData.get("hyroxType") ?? "CUSTOM_SESSION") as HyroxWorkoutType;
  const durationRaw = String(formData.get("durationMinutes") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const stationNames = formData.getAll("stations").map(String);

  const athleteType = await prisma.athleteProfile.findUnique({
    where: { userId: user.id },
    select: { sportDepartment: true },
  });
  if (athleteType?.sportDepartment === "CROSSFIT") {
    return { error: "Switch to Hyrox or Hybrid mode to log Hyrox sessions." };
  }

  for (const exerciseName of stationNames) {
    const meta = HYROX_EXERCISES.find((e) => e.name === exerciseName);
    if (!meta) continue;
    await prisma.exercise.upsert({
      where: { name: exerciseName },
      create: {
        name: exerciseName,
        category: meta.category,
        movementType: meta.movementType,
        primaryMuscles: meta.primaryMuscles,
      },
      update: {},
    });
  }

  const exercises = await prisma.exercise.findMany({
    where: { name: { in: stationNames } },
  });

  const baseWorkout = {
    userId: user.id,
    name,
    date: new Date(),
    type: hyroxType === "STRENGTH" ? ("STRENGTH" as const) : ("INTERVALS" as const),
    durationSeconds: durationRaw ? Number(durationRaw) * 60 : undefined,
    notes: notes || undefined,
    workoutExercises: {
      create: exercises.map((ex, i) => ({
        exerciseId: ex.id,
        sequence: i,
      })),
    },
  };

  try {
    const hasSport = await hasWorkoutSportColumn(prisma);
    await prisma.workout.create({
      data: hasSport
        ? { ...baseWorkout, sport: "HYROX", hyroxWorkoutType: hyroxType }
        : baseWorkout,
    });
  } catch (error) {
    if (!isMissingSchemaError(error)) throw error;
    await prisma.workout.create({ data: baseWorkout });
  }

  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  const achievementMessage = await syncAchievementsAfterActivity(user.id);
  return {
    success: appendAchievementMessage("Hyrox session logged.", achievementMessage),
  };
}

export async function seedHyroxExercises() {
  const prisma = getPrismaClient();
  if (!prisma) return;
  await prisma.exercise.createMany({
    data: HYROX_EXERCISES.map((e) => ({
      name: e.name,
      category: e.category,
      movementType: e.movementType,
      primaryMuscles: e.primaryMuscles,
    })),
    skipDuplicates: true,
  });
}

export async function getHyroxRaces(userId: string) {
  const prisma = getPrismaClient();
  if (!prisma) return [];

  return prisma.hyroxRace.findMany({
    where: { userId },
    orderBy: { raceDate: "desc" },
    include: { splits: { orderBy: { sequence: "asc" } } },
  });
}

export async function saveHyroxRaceAction(formData: FormData) {
  const user = await requireUser();
  const prisma = getPrismaClient();
  if (!prisma) return { error: "Database not configured." };

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: user.id },
    select: { sportDepartment: true },
  });
  if (profile?.sportDepartment === "CROSSFIT") {
    return { error: "Switch to Hyrox or Hybrid mode to log races." };
  }

  const name = String(formData.get("name") ?? "").trim() || "Hyrox Race";
  const raceDateRaw = String(formData.get("raceDate") ?? "").trim();
  const division = String(formData.get("division") ?? "").trim() || undefined;
  const ageGroup = String(formData.get("ageGroup") ?? "").trim() || undefined;
  const genderRaw = String(formData.get("gender") ?? "").trim();
  const finishTimeRaw = String(formData.get("finishTime") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || undefined;
  const mode = String(formData.get("mode") ?? "completed");

  if (!raceDateRaw) return { error: "Race date is required." };

  const raceDate = new Date(raceDateRaw);
  if (Number.isNaN(raceDate.getTime())) return { error: "Invalid race date." };

  const gender =
    genderRaw === "MALE" ||
    genderRaw === "FEMALE" ||
    genderRaw === "NON_BINARY" ||
    genderRaw === "PREFER_NOT_TO_SAY"
      ? (genderRaw as Gender)
      : undefined;

  const splits = HYROX_STATIONS.map((station) => {
    const raw = String(formData.get(`split-${station.slug}`) ?? "").trim();
    const timeSeconds = parseTimeToSeconds(raw);
    const pacePerKmSeconds =
      timeSeconds && station.isRun && station.distanceMeters
        ? Math.round((timeSeconds / station.distanceMeters) * 1000)
        : undefined;

    return {
      stationSlug: station.slug,
      sequence: station.sequence,
      timeSeconds: timeSeconds ?? undefined,
      distanceMeters: station.distanceMeters ?? undefined,
      pacePerKmSeconds,
    };
  }).filter((s) => s.timeSeconds);

  const analysis = splits.length > 0 ? analyzeRaceSplits(splits) : null;
  const finishTimeSeconds =
    mode === "upcoming"
      ? undefined
      : parseTimeToSeconds(finishTimeRaw) ?? analysis?.predictedFinishSeconds;

  await prisma.hyroxRace.create({
    data: {
      userId: user.id,
      name,
      raceDate,
      division,
      ageGroup,
      gender,
      finishTimeSeconds,
      predictedFinishSeconds: analysis?.predictedFinishSeconds,
      transitionTimeSeconds: analysis?.transitionTimeSeconds,
      weakestStationSlug: analysis?.weakestStation?.slug,
      strongestStationSlug: analysis?.strongestStation?.slug,
      notes,
      splits: {
        create: splits,
      },
    },
  });

  revalidatePath("/pbs");
  revalidateHyroxPaths();
  const achievementMessage = await syncAchievementsAfterActivity(user.id);
  const baseMessage =
    mode === "upcoming"
      ? "Upcoming race scheduled."
      : `Race logged${finishTimeSeconds ? ` — ${formatHyroxTime(finishTimeSeconds)}` : ""}.`;
  return {
    success: appendAchievementMessage(baseMessage, achievementMessage),
  };
}

function revalidateHyroxPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/coach");
  revalidatePath("/hyrox/races");
  revalidatePath("/hyrox/races/new");
}
