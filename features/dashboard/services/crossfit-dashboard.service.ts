import type { PrismaClient } from "@prisma/client";

import type { SportView } from "@/domain/models/sport";
import {
  countRecentPersonalBests,
  findActiveGoals,
  findAthleteProfile,
  findLastWorkout,
  findRecentInsights,
  findRecentWorkouts,
  workoutFilterForView,
} from "@/infrastructure/database";
import { getRecentPersonalBests } from "@/app/actions/personal-bests";
import { isProfileComplete } from "@/app/actions/profile";
import { generateAiInsights } from "@/features/coaching";
import { getAthleteScoreSnapshot } from "@/features/scoring";
import { sumWorkoutVolume } from "@/shared/utils/volume";

export type CrossfitDashboardData = {
  athleteName: string;
  lastWorkout: Awaited<ReturnType<typeof findLastWorkout>>;
  scoreSnapshot: Awaited<ReturnType<typeof getAthleteScoreSnapshot>>;
  goals: Awaited<ReturnType<typeof findActiveGoals>>;
  weeklyTrainingVolume: number;
  recentPrsCount: number;
  recentPbs: Awaited<ReturnType<typeof getRecentPersonalBests>>;
  profileComplete: boolean;
  aiInsights: Awaited<ReturnType<typeof findRecentInsights>>;
};

export async function getCrossfitDashboardData(
  prisma: PrismaClient,
  userId: string,
  view: SportView = "crossfit",
): Promise<CrossfitDashboardData> {
  const workoutWhere = await workoutFilterForView(prisma, userId, view);

  const [
    lastWorkout,
    workouts,
    goals,
    profile,
    profileComplete,
    recentPrsCount,
    recentPbs,
    scoreSnapshot,
    aiInsights,
  ] = await Promise.all([
    findLastWorkout(prisma, workoutWhere),
    findRecentWorkouts(prisma, workoutWhere, 8),
    findActiveGoals(prisma, userId),
    findAthleteProfile(prisma, userId),
    isProfileComplete(userId),
    countRecentPersonalBests(prisma, userId, view),
    getRecentPersonalBests(userId, 5, view),
    getAthleteScoreSnapshot(userId),
    findRecentInsights(prisma, userId),
  ]);

  const resolvedInsights =
    aiInsights.length > 0
      ? aiInsights
      : await (async () => {
          await generateAiInsights(userId);
          return findRecentInsights(prisma, userId);
        })();

  return {
    athleteName: profile?.name ?? "Athlete",
    lastWorkout,
    scoreSnapshot,
    goals,
    weeklyTrainingVolume: sumWorkoutVolume(workouts),
    recentPrsCount,
    recentPbs,
    profileComplete,
    aiInsights: resolvedInsights,
  };
}

export async function getCrossfitDashboardForUser(
  userId: string,
  view: SportView = "crossfit",
): Promise<CrossfitDashboardData> {
  const { getPrismaClient } = await import("@/infrastructure/database/client");
  const prisma = getPrismaClient();
  if (!prisma) {
    return {
      athleteName: "Athlete",
      lastWorkout: null,
      scoreSnapshot: await getAthleteScoreSnapshot(userId),
      goals: [],
      weeklyTrainingVolume: 0,
      recentPrsCount: 0,
      recentPbs: [],
      profileComplete: false,
      aiInsights: [],
    };
  }

  try {
    return await getCrossfitDashboardData(prisma, userId, view);
  } catch {
    return {
      athleteName: "Athlete",
      lastWorkout: null,
      scoreSnapshot: await getAthleteScoreSnapshot(userId),
      goals: [],
      weeklyTrainingVolume: 0,
      recentPrsCount: 0,
      recentPbs: [],
      profileComplete: false,
      aiInsights: [],
    };
  }
}
