import { z } from "zod";

export const parsedExerciseSchema = z.object({
  name: z.string(),
  category: z.string(),
  movementType: z.string(),
  primaryMuscles: z.array(z.string()),
  weightKg: z.number().optional(),
  reps: z.number().int().optional(),
  distanceMeters: z.number().optional(),
  calories: z.number().int().optional(),
  timeSeconds: z.number().int().optional(),
  notes: z.string().optional(),
});

export const categoryImpactSchema = z.object({
  strength: z.number(),
  olympicLifting: z.number(),
  engine: z.number(),
  gymnastics: z.number(),
  power: z.number(),
  mobility: z.number(),
});

export const parsedWorkoutSchema = z.object({
  name: z.string(),
  date: z.string(),
  type: z.enum(["FOR_TIME", "AMRAP", "EMOM", "STRENGTH", "INTERVALS", "SKILL", "ACCESSORY"]),
  rounds: z.number().int().optional(),
  durationSeconds: z.number().int().optional(),
  rpe: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
  exercises: z.array(parsedExerciseSchema).min(1),
  categoryImpact: categoryImpactSchema,
  interpretation: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

export type ParsedExercise = z.infer<typeof parsedExerciseSchema>;
export type CategoryImpact = z.infer<typeof categoryImpactSchema>;
export type ParsedWorkout = z.infer<typeof parsedWorkoutSchema>;

export const parseWorkoutTextSchema = z.object({
  text: z.string().min(8, "Describe your workout in a few words"),
});
