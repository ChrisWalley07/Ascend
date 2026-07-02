import { subDays } from "date-fns";

import { applyProfileToScores, toProfileInput } from "@/lib/athlete-analysis";
import { getPrismaClient } from "@/lib/prisma";
import { roundScore } from "@/shared/utils/math";

export type { AthleteScoreSnapshot } from "@/domain/models/athlete";

import type { AthleteScoreSnapshot } from "@/domain/models/athlete";
import { DATE_WINDOWS } from "@/shared/constants/date-windows";

const BASELINE_SNAPSHOT: AthleteScoreSnapshot = {
  overallScore: 62,
  strengthScore: 64,
  olympicLiftingScore: 58,
  engineScore: 61,
  gymnasticsScore: 56,
  powerScore: 63,
  consistencyScore: 66,
  recoveryScore: 60,
  mobilityScore: 58,
  strongestCategory: "consistencyScore",
  weakestCategory: "gymnasticsScore",
};

function findStrongestWeakest(snapshot: Omit<AthleteScoreSnapshot, "strongestCategory" | "weakestCategory">) {
  const entries = Object.entries(snapshot).filter(([key]) => key !== "overallScore");
  const strongest = entries.reduce((best, current) => (current[1] > best[1] ? current : best), entries[0]);
  const weakest = entries.reduce((worst, current) => (current[1] < worst[1] ? current : worst), entries[0]);

  return {
    strongestCategory: strongest[0],
    weakestCategory: weakest[0],
  };
}

export async function getAthleteScoreSnapshot(userId: string) {
  const prisma = getPrismaClient();
  if (!prisma) return BASELINE_SNAPSHOT;

  const ninetyDaysAgo = subDays(new Date(), DATE_WINDOWS.quarter);
  const thirtyDaysAgo = subDays(new Date(), DATE_WINDOWS.month);

  try {
    const [workouts, recoveries, prs] = await Promise.all([
      prisma.workout.findMany({
        where: {
          userId,
          date: { gte: ninetyDaysAgo },
        },
        include: {
          workoutExercises: {
            include: {
              exercise: {
                select: {
                  category: true,
                },
              },
            },
          },
        },
      }),
      prisma.recoveryLog.findMany({
        where: {
          userId,
          date: { gte: thirtyDaysAgo },
        },
      }),
      prisma.personalRecord.count({
        where: {
          userId,
          achievedAt: { gte: ninetyDaysAgo },
        },
      }),
    ]);

    if (workouts.length === 0) {
      return BASELINE_SNAPSHOT;
    }

    const allWorkoutExercises = workouts.flatMap((workout) => workout.workoutExercises);
    const heavyLifts = allWorkoutExercises.filter((entry) => (entry.weightKg ?? 0) > 0).map((entry) => entry.weightKg ?? 0);
    const olympicEntries = allWorkoutExercises.filter((entry) =>
      ["olympic lifts", "olympic"].includes(entry.exercise.category.toLowerCase()),
    );
    const engineEntries = allWorkoutExercises.filter((entry) => (entry.distanceMeters ?? 0) > 0 || (entry.timeSeconds ?? 0) > 0);
    const gymnasticsEntries = allWorkoutExercises.filter((entry) =>
      ["gymnastics", "bodyweight"].includes(entry.exercise.category.toLowerCase()),
    );

    const topWeights = heavyLifts.sort((a, b) => b - a).slice(0, 3);
    const averageTopWeight = topWeights.length > 0 ? topWeights.reduce((a, b) => a + b, 0) / topWeights.length : 0;
    const workoutsPerWeek = workouts.length / (DATE_WINDOWS.quarter / 7);
    const averageRpe = workouts.reduce((sum, workout) => sum + (workout.rpe ?? 6), 0) / workouts.length;
    const readinessAverage =
      recoveries.length > 0 ? recoveries.reduce((sum, item) => sum + item.readinessScore, 0) / recoveries.length : 62;
    const sorenessAverage =
      recoveries.length > 0 ? recoveries.reduce((sum, item) => sum + (item.soreness ?? 5), 0) / recoveries.length : 5;
    const hydrationAverage =
      recoveries.length > 0 ? recoveries.reduce((sum, item) => sum + (item.hydration ?? 5), 0) / recoveries.length : 5;

    const strengthScore = roundScore((averageTopWeight / 180) * 100);
    const olympicLiftingScore = roundScore((olympicEntries.length / Math.max(allWorkoutExercises.length, 1)) * 100 + strengthScore * 0.35);
    const engineScore = roundScore(
      (engineEntries.length / Math.max(allWorkoutExercises.length, 1)) * 100 + averageRpe * 4,
    );
    const gymnasticsScore = roundScore(
      (gymnasticsEntries.length / Math.max(allWorkoutExercises.length, 1)) * 100 + (prs > 0 ? 10 : 0),
    );
    const powerScore = roundScore(strengthScore * 0.6 + engineScore * 0.4);
    const consistencyScore = roundScore(workoutsPerWeek * 25);
    const recoveryScore = roundScore(readinessAverage - Math.max(0, sorenessAverage - 5) * 3 + hydrationAverage);
    const mobilityScore = roundScore(55 + (recoveries.length > 3 ? 10 : 0));

    const snapshotWithoutMeta = {
      overallScore: roundScore(
        (strengthScore +
          olympicLiftingScore +
          engineScore +
          gymnasticsScore +
          powerScore +
          consistencyScore +
          recoveryScore +
          mobilityScore) /
          8,
      ),
      strengthScore,
      olympicLiftingScore,
      engineScore,
      gymnasticsScore,
      powerScore,
      consistencyScore,
      recoveryScore,
      mobilityScore,
    };

    const profile = await prisma.athleteProfile.findUnique({ where: { userId } });
    const adjusted = profile
      ? applyProfileToScores(
          { ...snapshotWithoutMeta, strongestCategory: "strengthScore", weakestCategory: "gymnasticsScore" },
          toProfileInput(profile),
          workoutsPerWeek,
        )
      : snapshotWithoutMeta;

    const { strongestCategory, weakestCategory } = findStrongestWeakest(adjusted);

    const snapshot: AthleteScoreSnapshot = {
      ...adjusted,
      strongestCategory,
      weakestCategory,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await prisma.athleteScore.findFirst({
      where: { userId, date: { gte: today } },
    });

    if (!existing) {
      await prisma.athleteScore.create({
        data: {
          userId,
          date: new Date(),
          overallScore: snapshot.overallScore,
          strengthScore: snapshot.strengthScore,
          olympicLiftingScore: snapshot.olympicLiftingScore,
          engineScore: snapshot.engineScore,
          gymnasticsScore: snapshot.gymnasticsScore,
          powerScore: snapshot.powerScore,
          consistencyScore: snapshot.consistencyScore,
          recoveryScore: snapshot.recoveryScore,
          mobilityScore: snapshot.mobilityScore,
        },
      });
    }

    return snapshot;
  } catch {
    return BASELINE_SNAPSHOT;
  }
}
