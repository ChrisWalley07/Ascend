"use server";

import { revalidatePath } from "next/cache";

import type { SportDepartment } from "@prisma/client";

import { generateAiInsights } from "@/lib/ai-coach";
import {
  appendAchievementMessage,
  syncAchievementsAfterActivity,
} from "@/lib/achievements/sync-after-activity";
import { requireUser } from "@/lib/auth";
import { detectPbCandidatesFromWorkout } from "@/lib/pb-auto-detect";
import { applyWorkoutPbCandidates, type AppliedPbUpdate } from "@/lib/pb-apply";
import { buildPrCandidates } from "@/lib/performance";
import { getPrismaClient } from "@/lib/prisma";
import { isMissingSchemaError } from "@/lib/prisma/schema-compat";
import { loadSportProfile } from "@/lib/sport/load-profile";
import { hasWorkoutSportColumn } from "@/lib/sport/workout-filter";
import { interpretWorkoutText } from "@/lib/workout-interpreter";
import {
  parsedWorkoutSchema,
  parseWorkoutTextSchema,
  type ParsedExercise,
  type ParsedWorkout,
} from "@/lib/validations/workout-parser";
import { workoutSchema, type WorkoutFormValues } from "@/lib/validations/workout";

type ActionResult = { error?: string; success?: string };

async function resolveWorkoutSport(userId: string): Promise<SportDepartment | null> {
  const prisma = getPrismaClient();
  if (!prisma) return "CROSSFIT";

  const profile = await loadSportProfile(prisma, userId);
  if (!profile?.sportDepartment) return "CROSSFIT";

  const hasSport = await hasWorkoutSportColumn(prisma);
  if (!hasSport) return null;

  if (profile.sportDepartment === "HYBRID") {
    return profile.activeSportView ?? "CROSSFIT";
  }
  return profile.sportDepartment;
}

function workoutSaveMessage(newPrCount: number, pbUpdates: AppliedPbUpdate[]) {
  const parts: string[] = ["Workout logged successfully."];
  if (pbUpdates.length > 0) {
    const names = pbUpdates.map((u) => `${u.name} (${u.displayValue})`).join(", ");
    parts.push(`PB${pbUpdates.length > 1 ? "s" : ""} updated: ${names}.`);
  }
  if (newPrCount > 0) {
    parts.push(`${newPrCount} PR${newPrCount > 1 ? "s" : ""} detected.`);
  }
  return parts.join(" ");
}

async function upsertExerciseByName(exercise: ParsedExercise) {
  const prisma = getPrismaClient();
  if (!prisma) throw new Error("Database not configured");

  const existing = await prisma.exercise.findUnique({
    where: { name: exercise.name },
    select: { id: true },
  });

  if (existing) return existing.id;

  const created = await prisma.exercise.create({
    data: {
      name: exercise.name,
      category: exercise.category,
      movementType: exercise.movementType,
      primaryMuscles: exercise.primaryMuscles,
    },
    select: { id: true },
  });

  return created.id;
}

async function persistWorkout(
  userId: string,
  data: {
    name: string;
    date: string;
    type: WorkoutFormValues["type"];
    rounds?: number;
    durationSeconds?: number;
    rpe?: number;
    notes?: string;
    exercises: Array<{
      exerciseId: string;
      weightKg?: number;
      reps?: number;
      distanceMeters?: number;
      calories?: number;
      timeSeconds?: number;
      notes?: string;
    }>;
  },
) {
  const prisma = getPrismaClient();
  if (!prisma) throw new Error("Database not configured");

  const sport = await resolveWorkoutSport(userId);

  const workout = await prisma.workout.create({
    data: {
      userId,
      name: data.name,
      date: new Date(data.date),
      type: data.type,
      ...(sport ? { sport } : {}),
      rounds: data.rounds,
      durationSeconds: data.durationSeconds,
      rpe: data.rpe,
      notes: data.notes,
      workoutExercises: {
        create: data.exercises.map((exercise, index) => ({
          exerciseId: exercise.exerciseId,
          sequence: index,
          weightKg: exercise.weightKg,
          reps: exercise.reps,
          distanceMeters: exercise.distanceMeters,
          calories: exercise.calories,
          timeSeconds: exercise.timeSeconds,
          notes: exercise.notes,
        })),
      },
    },
    include: {
      workoutExercises: {
        include: {
          exercise: { select: { id: true, name: true } },
        },
      },
    },
  });

  const candidatePrs = buildPrCandidates(
    workout.workoutExercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      weightKg: exercise.weightKg,
      reps: exercise.reps,
      distanceMeters: exercise.distanceMeters,
      timeSeconds: exercise.timeSeconds,
    })),
  );

  let newPrCount = 0;
  for (const candidate of candidatePrs) {
    const existingPr = await prisma.personalRecord.findFirst({
      where: {
        userId,
        exerciseId: candidate.exerciseId,
        type: candidate.type,
      },
      orderBy: {
        value: candidate.betterWhen === "LOWER_IS_BETTER" ? "asc" : "desc",
      },
    });

    const isNewPr =
      !existingPr ||
      (candidate.betterWhen === "LOWER_IS_BETTER"
        ? candidate.value < existingPr.value
        : candidate.value > existingPr.value);

    if (!isNewPr) continue;

    await prisma.personalRecord.create({
      data: {
        userId,
        exerciseId: candidate.exerciseId,
        type: candidate.type,
        value: candidate.value,
        unit: candidate.unit,
        achievedAt: workout.date,
        sourceWorkoutId: workout.id,
      },
    });

    const exerciseName =
      workout.workoutExercises.find((e) => e.exerciseId === candidate.exerciseId)?.exercise.name ??
      "Exercise";

    await prisma.achievement.create({
      data: {
        userId,
        type: "PR",
        title: `New PR in ${exerciseName}`,
        description: `${candidate.type.replaceAll("_", " ")}: ${candidate.value} ${candidate.unit}`,
      },
    });

    newPrCount += 1;
  }

  const pbCandidates = detectPbCandidatesFromWorkout({
    workoutName: workout.name,
    workoutType: workout.type,
    durationSeconds: workout.durationSeconds,
    notes: data.notes,
    exercises: workout.workoutExercises.map((exercise) => ({
      name: exercise.exercise.name,
      weightKg: exercise.weightKg,
      reps: exercise.reps,
      distanceMeters: exercise.distanceMeters,
      timeSeconds: exercise.timeSeconds,
      calories: exercise.calories,
    })),
  });

  const { updates: pbUpdates } = await applyWorkoutPbCandidates(
    prisma,
    userId,
    workout.id,
    workout.date,
    pbCandidates,
    workout.sport ?? "CROSSFIT",
  );

  return { workout, newPrCount, pbUpdates };
}

export async function parseWorkoutTextAction(
  _: ActionResult | undefined,
  payload: FormData,
): Promise<ActionResult & { parsed?: ParsedWorkout }> {
  await requireUser();

  const validated = parseWorkoutTextSchema.safeParse({
    text: payload.get("text"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Could not read workout text" };
  }

  try {
    const parsed = interpretWorkoutText(validated.data.text);
    const checked = parsedWorkoutSchema.safeParse(parsed);
    if (!checked.success) {
      return { error: "Failed to structure workout interpretation" };
    }
    return { success: "Workout interpreted", parsed: checked.data };
  } catch {
    return { error: "Could not interpret workout. Try adding movements, weights, or times." };
  }
}

export async function saveParsedWorkoutAction(
  _: ActionResult | undefined,
  payload: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const raw = payload.get("parsed");

  if (typeof raw !== "string") {
    return { error: "Invalid workout data" };
  }

  const parsed = parsedWorkoutSchema.safeParse(JSON.parse(raw) as unknown);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid interpreted workout" };
  }

  const prisma = getPrismaClient();
  if (!prisma) {
    return { error: "Database is not configured yet. Add DATABASE_URL to .env.local." };
  }

  try {
    const exerciseIds = await Promise.all(
      parsed.data.exercises.map(async (exercise) => ({
        exerciseId: await upsertExerciseByName(exercise),
        weightKg: exercise.weightKg,
        reps: exercise.reps,
        distanceMeters: exercise.distanceMeters,
        calories: exercise.calories,
        timeSeconds: exercise.timeSeconds,
        notes: exercise.notes,
      })),
    );

    const { newPrCount, pbUpdates } = await persistWorkout(user.id, {
      name: parsed.data.name,
      date: parsed.data.date,
      type: parsed.data.type,
      rounds: parsed.data.rounds,
      durationSeconds: parsed.data.durationSeconds,
      rpe: parsed.data.rpe,
      notes: `${parsed.data.interpretation}\n\n---\nOriginal: ${parsed.data.notes ?? ""}`,
      exercises: exerciseIds,
    });

    revalidatePath("/dashboard");
    revalidatePath("/pbs");
    revalidatePath("/workouts/new");
    revalidatePath("/analytics");
    revalidatePath("/goals");
    await generateAiInsights(user.id);
    revalidatePath("/coach");

    const achievementMessage = await syncAchievementsAfterActivity(user.id);

    return {
      success: appendAchievementMessage(
        workoutSaveMessage(newPrCount, pbUpdates),
        achievementMessage,
      ),
    };
  } catch (error) {
    console.error("[saveParsedWorkoutAction]", error);
    const message =
      error instanceof Error && error.message.includes("Foreign key")
        ? "Your account isn't synced yet. Log out and log back in, then try again."
        : "Failed to save workout. Check your database connection.";
    return { error: message };
  }
}

export async function createWorkoutAction(payload: FormData) {
  const user = await requireUser();
  const raw = payload.get("payload");

  if (typeof raw !== "string") {
    return { error: "Invalid workout payload" };
  }

  const validated = workoutSchema.safeParse(JSON.parse(raw) as unknown);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid workout data" };
  }

  const prisma = getPrismaClient();
  if (!prisma) {
    return { error: "Database is not configured yet. Add DATABASE_URL and Prisma adapter settings." };
  }

  try {
    const { newPrCount, pbUpdates } = await persistWorkout(user.id, validated.data);

    revalidatePath("/dashboard");
    revalidatePath("/pbs");
    revalidatePath("/workouts/new");
    revalidatePath("/goals");
    await generateAiInsights(user.id);
    revalidatePath("/coach");

    const achievementMessage = await syncAchievementsAfterActivity(user.id);

    return {
      success: appendAchievementMessage(
        workoutSaveMessage(newPrCount, pbUpdates),
        achievementMessage,
      ),
    };
  } catch {
    return { error: "Failed to save workout." };
  }
}
