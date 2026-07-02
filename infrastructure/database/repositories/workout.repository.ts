import type { Prisma, PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

import { crossfitWorkoutWhere, hyroxWorkoutWhere } from "@/lib/sport/workout-filter";
import type { SportView } from "@/domain/models/sport";
import { DATE_WINDOWS } from "@/shared/constants/date-windows";

export async function workoutFilterForView(
  prisma: PrismaClient,
  userId: string,
  view: SportView,
): Promise<Prisma.WorkoutWhereInput> {
  return view === "hyrox" ? hyroxWorkoutWhere(prisma, userId) : crossfitWorkoutWhere(prisma, userId);
}

export async function findRecentWorkouts(
  prisma: PrismaClient,
  where: Prisma.WorkoutWhereInput,
  take: number,
) {
  return prisma.workout.findMany({
    where,
    orderBy: { date: "desc" },
    take,
    select: {
      date: true,
      workoutExercises: { select: { weightKg: true, reps: true } },
    },
  });
}

export async function findLastWorkout(prisma: PrismaClient, where: Prisma.WorkoutWhereInput) {
  return prisma.workout.findFirst({ where, orderBy: { date: "desc" } });
}

export async function findWorkoutsSince(
  prisma: PrismaClient,
  where: Prisma.WorkoutWhereInput,
  days: number,
) {
  return prisma.workout.findMany({
    where: { ...where, date: { gte: subDays(new Date(), days) } },
    orderBy: { date: "asc" },
  });
}

export async function findWorkoutsWithExercises(
  prisma: PrismaClient,
  userId: string,
  view: SportView,
) {
  const where = await workoutFilterForView(prisma, userId, view);
  return prisma.workout.findMany({
    where,
    include: { workoutExercises: { select: { weightKg: true, reps: true } } },
    orderBy: { date: "asc" },
  });
}

export async function findWorkoutsForAnalytics(
  prisma: PrismaClient,
  userId: string,
  view: SportView,
) {
  const where = await workoutFilterForView(prisma, userId, view);
  return prisma.workout.findMany({
    where,
    select: {
      date: true,
      rpe: true,
      durationSeconds: true,
      workoutExercises: { select: { weightKg: true, reps: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function findWorkoutsForScoring(
  prisma: PrismaClient,
  userId: string,
  view: SportView,
) {
  const where = await workoutFilterForView(prisma, userId, view);
  return prisma.workout.findMany({
    where: { ...where, date: { gte: subDays(new Date(), DATE_WINDOWS.quarter) } },
    include: {
      workoutExercises: {
        include: { exercise: { select: { category: true, name: true } } },
      },
    },
  });
}
