import type { WorkoutVolumeRow } from "@/domain/models/workout";

export function sumWorkoutVolume(
  workouts: WorkoutVolumeRow[],
): number {
  return workouts.reduce((total, workout) => {
    const vol = workout.workoutExercises.reduce(
      (sum, exercise) => sum + (exercise.reps ?? 0) * (exercise.weightKg ?? 0),
      0,
    );
    return total + vol;
  }, 0);
}

export function sumExerciseVolume(
  exercises: Array<{ weightKg: number | null; reps: number | null }>,
): number {
  return exercises.reduce((sum, exercise) => sum + (exercise.reps ?? 0) * (exercise.weightKg ?? 0), 0);
}
