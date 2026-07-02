import type { WorkoutSnapshot } from "../types";
import { average } from "../utils/math";

export function workoutLoadUnits(workout: WorkoutSnapshot, defaultRpe: number): number {
  const rpe = workout.rpe ?? defaultRpe;
  const durationMinutes = (workout.durationSeconds ?? 0) / 60;

  const strengthVolume = workout.exercises.reduce(
    (sum, ex) => sum + (ex.weightKg ?? 0) * (ex.reps ?? 0),
    0,
  );
  const distanceKm = workout.exercises.reduce(
    (sum, ex) => sum + (ex.distanceMeters ?? 0) / 1000,
    0,
  );
  const timeMinutes = workout.exercises.reduce(
    (sum, ex) => sum + (ex.timeSeconds ?? 0) / 60,
    0,
  );

  const modalityLoad = strengthVolume / 100 + distanceKm * 10 + timeMinutes;
  const durationLoad = durationMinutes > 0 ? durationMinutes : modalityLoad;
  return durationLoad * (rpe / 10);
}

export function acuteChronicLoad(
  workouts: WorkoutSnapshot[],
  now: Date,
  acuteDays: number,
  chronicDays: number,
  defaultRpe: number,
): { acute: number; chronic: number; acwr: number } {
  const acuteStart = new Date(now);
  acuteStart.setDate(acuteStart.getDate() - acuteDays);
  const chronicStart = new Date(now);
  chronicStart.setDate(chronicStart.getDate() - chronicDays);

  const acuteWorkouts = workouts.filter((w) => w.date >= acuteStart);
  const chronicWorkouts = workouts.filter((w) => w.date >= chronicStart);

  const acute = acuteWorkouts.reduce((sum, w) => sum + workoutLoadUnits(w, defaultRpe), 0);
  const chronicTotal = chronicWorkouts.reduce((sum, w) => sum + workoutLoadUnits(w, defaultRpe), 0);
  const chronicWeeks = chronicDays / 7;
  const chronic = chronicWeeks > 0 ? chronicTotal / chronicWeeks : 0;
  const acwr = chronic > 0 ? acute / chronic : acute > 0 ? 2 : 0;

  return { acute, chronic, acwr };
}

export function weeklyVolumeSeries(
  workouts: WorkoutSnapshot[],
  defaultRpe: number,
): number[] {
  const byWeek = new Map<string, number>();
  for (const workout of workouts) {
    const weekStart = new Date(workout.date);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    byWeek.set(key, (byWeek.get(key) ?? 0) + workoutLoadUnits(workout, defaultRpe));
  }
  return Array.from(byWeek.values());
}

export function averageRpe(workouts: WorkoutSnapshot[], defaultRpe: number): number {
  if (workouts.length === 0) return defaultRpe;
  return average(workouts.map((w) => w.rpe ?? defaultRpe));
}

export function strengthTopWeight(workouts: WorkoutSnapshot[]): number {
  const weights = workouts
    .flatMap((w) => w.exercises)
    .map((ex) => ex.weightKg ?? 0)
    .filter((w) => w > 0)
    .sort((a, b) => b - a);
  const top = weights.slice(0, 3);
  return top.length > 0 ? average(top) : 0;
}

export function runningPaceSamples(workouts: WorkoutSnapshot[]): number[] {
  return workouts
    .flatMap((w) => w.exercises)
    .filter((ex) => (ex.distanceMeters ?? 0) >= 800 && (ex.timeSeconds ?? 0) > 0)
    .map((ex) => (ex.timeSeconds ?? 0) / ((ex.distanceMeters ?? 1) / 1000));
}

export function isRunningExercise(name: string, category: string): boolean {
  const haystack = `${name} ${category}`.toLowerCase();
  return haystack.includes("run") || category.toLowerCase() === "running";
}

export function isStrengthExercise(category: string, name: string): boolean {
  const haystack = `${name} ${category}`.toLowerCase();
  return (
    haystack.includes("strength") ||
    haystack.includes("squat") ||
    haystack.includes("deadlift") ||
    haystack.includes("press") ||
    haystack.includes("snatch") ||
    haystack.includes("clean")
  );
}
