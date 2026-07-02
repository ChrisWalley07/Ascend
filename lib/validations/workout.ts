import { z } from "zod";

const workoutExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Exercise is required"),
  weightKg: z.number().optional(),
  reps: z.number().int().optional(),
  distanceMeters: z.number().optional(),
  calories: z.number().int().optional(),
  timeSeconds: z.number().int().optional(),
  notes: z.string().optional(),
});

export const workoutSchema = z.object({
  name: z.string().min(2, "Workout name is required"),
  date: z.string().min(1, "Date is required"),
  type: z.enum(["FOR_TIME", "AMRAP", "EMOM", "STRENGTH", "INTERVALS", "SKILL", "ACCESSORY"]),
  rounds: z.number().int().optional(),
  durationSeconds: z.number().int().optional(),
  rpe: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
  exercises: z.array(workoutExerciseSchema).min(1, "Add at least one exercise"),
});

export type WorkoutFormValues = z.infer<typeof workoutSchema>;
