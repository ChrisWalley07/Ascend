"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { workoutImportRowSchema, type WorkoutImportRow } from "@/lib/validations/data-transfer";

type ActionState = { error?: string; success?: string };

type GroupedWorkout = {
  workoutName: string;
  date: string;
  type: WorkoutImportRow["type"];
  rounds?: number;
  durationSeconds?: number;
  rpe?: number;
  notes?: string;
  exercises: WorkoutImportRow[];
};

type WorkoutSignatureInput = {
  workoutName: string;
  date: string;
  type: WorkoutImportRow["type"];
  rounds?: number;
  durationSeconds?: number;
  rpe?: number;
  notes?: string;
  exercises: {
    exerciseName: string;
    sequence: number;
    weightKg?: number;
    reps?: number;
    distanceMeters?: number;
    calories?: number;
    timeSeconds?: number;
    notes?: string;
  }[];
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function buildGroupKey(row: WorkoutImportRow) {
  if (row.workout_id && row.workout_id.trim().length > 0) {
    return row.workout_id.trim();
  }

  return [row.date, row.workout_name, row.type, row.notes ?? ""].join("|");
}

function groupRows(rows: WorkoutImportRow[]) {
  const grouped = new Map<string, GroupedWorkout>();

  for (const row of rows) {
    const key = buildGroupKey(row);
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        workoutName: row.workout_name,
        date: row.date,
        type: row.type,
        rounds: row.rounds,
        durationSeconds: row.duration_seconds,
        rpe: row.rpe,
        notes: row.notes,
        exercises: [row],
      });
      continue;
    }

    existing.exercises.push(row);
  }

  return Array.from(grouped.values());
}

function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizeNumber(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  return Number(value).toFixed(4);
}

function buildWorkoutSignature(input: WorkoutSignatureInput) {
  const exerciseSignature = input.exercises
    .map((exercise) => ({
      ...exercise,
      exerciseName: normalizeText(exercise.exerciseName),
      notes: normalizeText(exercise.notes),
      weightKg: normalizeNumber(exercise.weightKg),
      reps: normalizeNumber(exercise.reps),
      distanceMeters: normalizeNumber(exercise.distanceMeters),
      calories: normalizeNumber(exercise.calories),
      timeSeconds: normalizeNumber(exercise.timeSeconds),
    }))
    .sort((a, b) => a.sequence - b.sequence || a.exerciseName.localeCompare(b.exerciseName))
    .map((exercise) =>
      [
        exercise.sequence,
        exercise.exerciseName,
        exercise.weightKg,
        exercise.reps,
        exercise.distanceMeters,
        exercise.calories,
        exercise.timeSeconds,
        exercise.notes,
      ].join("~"),
    )
    .join("||");

  return [
    normalizeText(input.workoutName),
    input.date,
    input.type,
    normalizeNumber(input.rounds),
    normalizeNumber(input.durationSeconds),
    normalizeNumber(input.rpe),
    normalizeText(input.notes),
    exerciseSignature,
  ].join("::");
}

export async function importWorkoutsCsvAction(_: ActionState, formData: FormData) {
  const user = await requireUser();
  const prisma = getPrismaClient();

  if (!prisma) {
    return { error: "Database is not configured yet. Add DATABASE_URL and Prisma adapter settings." };
  }

  const dedupeMode = formData.get("skip_duplicates") === "on";

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Please upload a CSV file." };
  }

  const fileText = await file.text();
  if (!fileText.trim()) {
    return { error: "CSV file is empty." };
  }

  const parsed = Papa.parse<Record<string, unknown>>(fileText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  if (parsed.errors.length > 0) {
    return { error: `CSV parse error: ${parsed.errors[0]?.message ?? "unknown error"}` };
  }

  if (!parsed.data.length) {
    return { error: "CSV has no rows to import." };
  }

  const normalizedRows: WorkoutImportRow[] = [];
  for (const row of parsed.data) {
    const validated = workoutImportRowSchema.safeParse(row);
    if (!validated.success) {
      return {
        error: `Invalid row: ${validated.error.issues[0]?.path.join(".")} ${validated.error.issues[0]?.message ?? "unknown validation error"}`,
      };
    }

    normalizedRows.push(validated.data);
  }

  const groupedWorkouts = groupRows(normalizedRows);
  const exerciseIdByName = new Map<string, string>();
  const existingSignatures = new Set<string>();
  let skippedDuplicates = 0;

  if (dedupeMode) {
    const existingWorkouts = await prisma.workout.findMany({
      where: { userId: user.id },
      include: {
        workoutExercises: {
          include: {
            exercise: {
              select: { name: true },
            },
          },
          orderBy: { sequence: "asc" },
        },
      },
    });

    for (const workout of existingWorkouts) {
      existingSignatures.add(
        buildWorkoutSignature({
          workoutName: workout.name,
          date: workout.date.toISOString().slice(0, 10),
          type: workout.type,
          rounds: workout.rounds ?? undefined,
          durationSeconds: workout.durationSeconds ?? undefined,
          rpe: workout.rpe ?? undefined,
          notes: workout.notes ?? undefined,
          exercises: workout.workoutExercises.map((exercise) => ({
            exerciseName: exercise.exercise.name,
            sequence: exercise.sequence,
            weightKg: exercise.weightKg ?? undefined,
            reps: exercise.reps ?? undefined,
            distanceMeters: exercise.distanceMeters ?? undefined,
            calories: exercise.calories ?? undefined,
            timeSeconds: exercise.timeSeconds ?? undefined,
            notes: exercise.notes ?? undefined,
          })),
        }),
      );
    }
  }

  let importedWorkouts = 0;
  for (const workoutGroup of groupedWorkouts) {
    const groupSignature = buildWorkoutSignature({
      workoutName: workoutGroup.workoutName,
      date: workoutGroup.date,
      type: workoutGroup.type,
      rounds: workoutGroup.rounds,
      durationSeconds: workoutGroup.durationSeconds,
      rpe: workoutGroup.rpe,
      notes: workoutGroup.notes,
      exercises: workoutGroup.exercises.map((exercise, sequence) => ({
        exerciseName: exercise.exercise_name,
        sequence,
        weightKg: exercise.weight_kg,
        reps: exercise.reps,
        distanceMeters: exercise.distance_meters,
        calories: exercise.calories,
        timeSeconds: exercise.time_seconds,
        notes: exercise.exercise_notes,
      })),
    });

    if (dedupeMode && existingSignatures.has(groupSignature)) {
      skippedDuplicates += 1;
      continue;
    }

    const resolvedExercises: {
      exerciseId: string;
      weightKg?: number;
      reps?: number;
      distanceMeters?: number;
      calories?: number;
      timeSeconds?: number;
      notes?: string;
      sequence: number;
    }[] = [];

    for (const [index, exerciseRow] of workoutGroup.exercises.entries()) {
      const normalizedName = exerciseRow.exercise_name.trim();
      let exerciseId = exerciseIdByName.get(normalizedName.toLowerCase());

      if (!exerciseId) {
        const exercise = await prisma.exercise.upsert({
          where: { name: normalizedName },
          update: {},
          create: {
            name: normalizedName,
            category: exerciseRow.exercise_category?.trim() || "Accessories",
            movementType: exerciseRow.exercise_movement_type?.trim() || "General",
            primaryMuscles: exerciseRow.exercise_primary_muscles
              ? exerciseRow.exercise_primary_muscles
                  .split("|")
                  .map((item) => item.trim())
                  .filter(Boolean)
              : ["Full Body"],
          },
          select: { id: true },
        });

        exerciseId = exercise.id;
        exerciseIdByName.set(normalizedName.toLowerCase(), exerciseId);
      }

      resolvedExercises.push({
        sequence: index,
        exerciseId,
        weightKg: exerciseRow.weight_kg,
        reps: exerciseRow.reps,
        distanceMeters: exerciseRow.distance_meters,
        calories: exerciseRow.calories,
        timeSeconds: exerciseRow.time_seconds,
        notes: exerciseRow.exercise_notes,
      });
    }

    await prisma.workout.create({
      data: {
        userId: user.id,
        name: workoutGroup.workoutName,
        date: new Date(workoutGroup.date),
        type: workoutGroup.type,
        rounds: workoutGroup.rounds,
        durationSeconds: workoutGroup.durationSeconds,
        rpe: workoutGroup.rpe,
        notes: workoutGroup.notes,
        workoutExercises: {
          create: resolvedExercises,
        },
      },
    });

    importedWorkouts += 1;
    if (dedupeMode) {
      existingSignatures.add(groupSignature);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/workouts/new");
  revalidatePath("/analytics");
  revalidatePath("/data");

  return {
    success:
      dedupeMode && skippedDuplicates > 0
        ? `Imported ${importedWorkouts} workout${importedWorkouts !== 1 ? "s" : ""} and skipped ${skippedDuplicates} duplicate${skippedDuplicates !== 1 ? "s" : ""} (${normalizedRows.length} exercise rows).`
        : `Imported ${importedWorkouts} workout${importedWorkouts !== 1 ? "s" : ""} (${normalizedRows.length} exercise rows).`,
  };
}
