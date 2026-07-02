import { z } from "zod";

const optionalNumber = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined;
  const normalized = String(value).trim();
  if (normalized.length === 0) return undefined;
  const numeric = Number(normalized);
  return Number.isNaN(numeric) ? undefined : numeric;
}, z.number().optional());

export const workoutImportRowSchema = z.object({
  workout_id: z.string().optional(),
  workout_name: z.string().min(2, "workout_name is required"),
  date: z.string().min(1, "date is required"),
  type: z.enum(["FOR_TIME", "AMRAP", "EMOM", "STRENGTH", "INTERVALS", "SKILL", "ACCESSORY"]),
  rounds: optionalNumber,
  duration_seconds: optionalNumber,
  rpe: optionalNumber,
  notes: z.string().optional(),
  exercise_name: z.string().min(1, "exercise_name is required"),
  exercise_category: z.string().optional(),
  exercise_movement_type: z.string().optional(),
  exercise_primary_muscles: z.string().optional(),
  weight_kg: optionalNumber,
  reps: optionalNumber,
  distance_meters: optionalNumber,
  calories: optionalNumber,
  time_seconds: optionalNumber,
  exercise_notes: z.string().optional(),
});

export type WorkoutImportRow = z.infer<typeof workoutImportRowSchema>;
