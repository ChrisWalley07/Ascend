import type { PrismaClient } from "@prisma/client";

import { detectPbCandidatesFromWorkout } from "@/lib/pb-auto-detect";
import { applyWorkoutPbCandidates } from "@/lib/pb-apply";
import { getValidStravaAccessToken, fetchAllStravaActivitiesSince } from "@/lib/strava/client";
import {
  mapStravaExerciseMeta,
  mapStravaExerciseName,
  mapStravaWorkoutType,
  snapDistanceForPb,
  stravaActivityNotes,
} from "@/lib/strava/map-activity";
import type { StravaActivitySummary, StravaSyncResult } from "@/lib/strava/types";

async function upsertExerciseByName(
  prisma: PrismaClient,
  name: string,
  meta: ReturnType<typeof mapStravaExerciseMeta>,
) {
  const existing = await prisma.exercise.findUnique({ where: { name }, select: { id: true } });
  if (existing) return existing.id;

  const created = await prisma.exercise.create({
    data: {
      name,
      category: meta.category,
      movementType: meta.movementType,
      primaryMuscles: meta.primaryMuscles,
    },
    select: { id: true },
  });
  return created.id;
}

async function importSingleActivity(
  prisma: PrismaClient,
  userId: string,
  activity: StravaActivitySummary,
): Promise<{ imported: boolean; pbsUpdated: number }> {
  const stravaId = String(activity.id);

  const existing = await prisma.stravaActivity.findUnique({
    where: { stravaActivityId: stravaId },
  });
  if (existing) return { imported: false, pbsUpdated: 0 };

  const exerciseName = mapStravaExerciseName(activity);
  const meta = mapStravaExerciseMeta(exerciseName);
  const exerciseId = await upsertExerciseByName(prisma, exerciseName, meta);
  const startDate = new Date(activity.start_date);
  const distanceMeters =
    activity.distance > 0
      ? snapDistanceForPb(activity.distance, activity.type)
      : undefined;

  const workout = await prisma.workout.create({
    data: {
      userId,
      name: activity.name || `${activity.type} Session`,
      date: startDate,
      type: mapStravaWorkoutType(activity),
      durationSeconds: activity.moving_time || activity.elapsed_time,
      notes: stravaActivityNotes(activity),
      workoutExercises: {
        create: {
          exerciseId,
          sequence: 0,
          distanceMeters,
          timeSeconds: activity.moving_time > 0 ? activity.moving_time : undefined,
          calories: activity.calories ? Math.round(activity.calories) : undefined,
        },
      },
    },
    include: {
      workoutExercises: {
        include: { exercise: { select: { name: true } } },
      },
    },
  });

  await prisma.stravaActivity.create({
    data: {
      userId,
      stravaActivityId: stravaId,
      name: activity.name,
      activityType: activity.type,
      sportType: activity.sport_type ?? null,
      startDate,
      distanceMeters: activity.distance || null,
      movingTimeSeconds: activity.moving_time || null,
      elapsedTimeSeconds: activity.elapsed_time || null,
      averageHeartrate: activity.average_heartrate ?? null,
      maxHeartrate: activity.max_heartrate ?? null,
      calories: activity.calories ?? null,
      workoutId: workout.id,
    },
  });

  if (activity.average_heartrate) {
    const dayStart = new Date(startDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(startDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingRecovery = await prisma.recoveryLog.findFirst({
      where: { userId, date: { gte: dayStart, lte: dayEnd } },
    });

    if (!existingRecovery) {
      await prisma.recoveryLog.create({
        data: {
          userId,
          date: startDate,
          readinessScore: 65,
          restingHeartRate: Math.round(activity.average_heartrate),
        },
      });
    }
  }

  const pbCandidates = detectPbCandidatesFromWorkout({
    workoutName: workout.name,
    workoutType: workout.type,
    durationSeconds: workout.durationSeconds,
    notes: workout.notes,
    exercises: workout.workoutExercises.map((ex) => ({
      name: ex.exercise.name,
      weightKg: ex.weightKg,
      reps: ex.reps,
      distanceMeters: ex.distanceMeters,
      timeSeconds: ex.timeSeconds,
      calories: ex.calories,
    })),
  });

  const { count: pbsUpdated } = await applyWorkoutPbCandidates(
    prisma,
    userId,
    workout.id,
    workout.date,
    pbCandidates,
    workout.sport ?? "CROSSFIT",
  );

  return { imported: true, pbsUpdated };
}

export async function syncStravaActivities(
  prisma: PrismaClient,
  userId: string,
  opts?: { daysBack?: number },
): Promise<StravaSyncResult> {
  const daysBack = opts?.daysBack ?? 90;
  const accessToken = await getValidStravaAccessToken(prisma, userId);
  const afterUnix = Math.floor((Date.now() - daysBack * 24 * 60 * 60 * 1000) / 1000);

  const activities = await fetchAllStravaActivitiesSince(accessToken, afterUnix);

  let imported = 0;
  let skipped = 0;
  let pbsUpdated = 0;
  const errors: string[] = [];

  for (const activity of activities) {
    try {
      const result = await importSingleActivity(prisma, userId, activity);
      if (result.imported) {
        imported += 1;
        pbsUpdated += result.pbsUpdated;
      } else {
        skipped += 1;
      }
    } catch (err) {
      errors.push(
        `${activity.name}: ${err instanceof Error ? err.message : "Import failed"}`,
      );
    }
  }

  await prisma.stravaConnection.update({
    where: { userId },
    data: { lastSyncedAt: new Date() },
  });

  return { imported, skipped, pbsUpdated, errors };
}

export async function getStravaIntegrationStatus(prisma: PrismaClient, userId: string) {
  const connection = await prisma.stravaConnection.findUnique({ where: { userId } });
  if (!connection) {
    return { connected: false as const };
  }

  const [activityCount, recentActivities] = await Promise.all([
    prisma.stravaActivity.count({ where: { userId } }),
    prisma.stravaActivity.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        activityType: true,
        startDate: true,
        distanceMeters: true,
        movingTimeSeconds: true,
      },
    }),
  ]);

  return {
    connected: true as const,
    stravaAthleteId: connection.stravaAthleteId,
    lastSyncedAt: connection.lastSyncedAt?.toISOString() ?? null,
    connectedAt: connection.createdAt.toISOString(),
    activityCount,
    recentActivities: recentActivities.map((a) => ({
      ...a,
      startDate: a.startDate.toISOString(),
    })),
  };
}
