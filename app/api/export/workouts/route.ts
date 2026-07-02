import Papa from "papaparse";

import { getPrismaClient } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const exportColumns = [
  "workout_id",
  "workout_name",
  "date",
  "type",
  "rounds",
  "duration_seconds",
  "rpe",
  "notes",
  "exercise_name",
  "exercise_category",
  "exercise_movement_type",
  "exercise_primary_muscles",
  "weight_kg",
  "reps",
  "distance_meters",
  "calories",
  "time_seconds",
  "exercise_notes",
] as const;

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return new Response("Supabase is not configured yet.", { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const prisma = getPrismaClient();
  if (!prisma) {
    return new Response("Database is not configured yet.", { status: 503 });
  }

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    include: {
      workoutExercises: {
        include: {
          exercise: true,
        },
        orderBy: { sequence: "asc" },
      },
    },
    orderBy: { date: "asc" },
  });

  const rows = workouts.flatMap((workout) =>
    workout.workoutExercises.map((exercise) => ({
      workout_id: workout.id,
      workout_name: workout.name,
      date: workout.date.toISOString().slice(0, 10),
      type: workout.type,
      rounds: workout.rounds ?? "",
      duration_seconds: workout.durationSeconds ?? "",
      rpe: workout.rpe ?? "",
      notes: workout.notes ?? "",
      exercise_name: exercise.exercise.name,
      exercise_category: exercise.exercise.category,
      exercise_movement_type: exercise.exercise.movementType,
      exercise_primary_muscles: exercise.exercise.primaryMuscles.join("|"),
      weight_kg: exercise.weightKg ?? "",
      reps: exercise.reps ?? "",
      distance_meters: exercise.distanceMeters ?? "",
      calories: exercise.calories ?? "",
      time_seconds: exercise.timeSeconds ?? "",
      exercise_notes: exercise.notes ?? "",
    })),
  );

  const csv = Papa.unparse({
    fields: [...exportColumns],
    data: rows.map((row) => exportColumns.map((column) => row[column])),
  });

  const fileName = `ascend-workouts-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
