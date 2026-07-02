import type { SportDepartment, WorkoutType } from "@prisma/client";

export type WorkoutExercise = {
  exerciseId: string;
  name?: string;
  category?: string;
  weightKg?: number | null;
  reps?: number | null;
  distanceMeters?: number | null;
  calories?: number | null;
  timeSeconds?: number | null;
  notes?: string | null;
  sequence?: number;
};

export type Workout = {
  id: string;
  userId: string;
  name: string;
  date: Date;
  type: WorkoutType;
  sport: SportDepartment;
  durationSeconds: number | null;
  rpe: number | null;
  notes: string | null;
  exercises: WorkoutExercise[];
};

export type WorkoutExerciseInput = {
  exerciseId: string;
  weightKg?: number;
  reps?: number;
  distanceMeters?: number;
  calories?: number;
  timeSeconds?: number;
  notes?: string;
};

export type WorkoutVolumeRow = {
  date: Date;
  workoutExercises: Array<{ weightKg: number | null; reps: number | null }>;
};
