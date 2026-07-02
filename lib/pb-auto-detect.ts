import type { PbRecordType } from "@prisma/client";

import { formatDisplayValue, parseTimeToSeconds } from "@/lib/pb-format";
import {
  DISTANCE_PB_MAP,
  MOVEMENT_PB_MAP,
  WOD_PB_MAP,
  type MovementPbMapping,
} from "@/lib/pb-movement-map";

export type WorkoutPbCandidate = {
  slug: string;
  value: number;
  recordType: PbRecordType;
  unit: string;
};

export type ExerciseSnapshot = {
  name: string;
  weightKg: number | null;
  reps: number | null;
  distanceMeters: number | null;
  timeSeconds: number | null;
  calories?: number | null;
};

type WorkoutContext = {
  workoutName: string;
  workoutType?: string;
  durationSeconds?: number | null;
  notes?: string | null;
  exercises: ExerciseSnapshot[];
};

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Extract workout finish time from natural language, e.g. "Fran in 4:32" */
export function extractWorkoutDurationSeconds(text: string): number | null {
  const patterns = [
    /\b(?:in|finished in|completed in|took|time:?)\s+(\d+:\d{2}(?::\d{2})?)\b/i,
    /\b(\d+:\d{2}(?::\d{2})?)\s*(?:min|minutes)?\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const seconds = parseTimeToSeconds(match[1]);
      if (seconds !== null && seconds > 0) return seconds;
    }
  }

  return parseTimeToSeconds(text.trim());
}

function valueFromExercise(
  exercise: ExerciseSnapshot,
  mapping: MovementPbMapping,
): number | null {
  switch (mapping.pick) {
    case "maxWeight":
      return exercise.weightKg && exercise.weightKg > 0 ? exercise.weightKg : null;
    case "maxReps": {
      if (!exercise.reps || exercise.reps <= 0) return null;
      if (mapping.maxRepCount && exercise.reps > mapping.maxRepCount) return null;
      if (exercise.weightKg && exercise.weightKg > 0) return null;
      return exercise.reps;
    }
    case "minTime":
      return exercise.timeSeconds && exercise.timeSeconds > 0 ? exercise.timeSeconds : null;
    case "maxDistance":
      return exercise.distanceMeters && exercise.distanceMeters > 0
        ? exercise.distanceMeters
        : null;
    case "maxCalories":
      return exercise.calories && exercise.calories > 0 ? exercise.calories : null;
  }
}

function upsertCandidate(
  bucket: Map<string, WorkoutPbCandidate>,
  slug: string,
  value: number,
  recordType: PbRecordType,
  unit: string,
  prefer: "higher" | "lower",
) {
  const existing = bucket.get(slug);
  if (!existing) {
    bucket.set(slug, { slug, value, recordType, unit });
    return;
  }
  if (prefer === "higher" && value > existing.value) {
    bucket.set(slug, { slug, value, recordType, unit });
  }
  if (prefer === "lower" && value < existing.value) {
    bucket.set(slug, { slug, value, recordType, unit });
  }
}

function detectDistanceTimeCandidates(exercise: ExerciseSnapshot, bucket: Map<string, WorkoutPbCandidate>) {
  if (!exercise.distanceMeters || !exercise.timeSeconds) return;

  const match = DISTANCE_PB_MAP.find((d) => d.meters === exercise.distanceMeters);
  if (match) {
    upsertCandidate(bucket, match.slug, exercise.timeSeconds, "TIME", "sec", "lower");
    return;
  }

  if (exercise.name === "Bike" && exercise.distanceMeters === 10000) {
    upsertCandidate(bucket, "bikeerg-10km", exercise.timeSeconds, "TIME", "sec", "lower");
  }
}

function detectWodCandidate(
  workoutName: string,
  notes: string | null | undefined,
  durationSeconds: number | null | undefined,
  bucket: Map<string, WorkoutPbCandidate>,
) {
  const haystack = `${workoutName} ${notes ?? ""}`;
  const normalizedHaystack = normalizeKey(haystack);

  for (const [needle, slug] of Object.entries(WOD_PB_MAP)) {
    if (!normalizedHaystack.includes(needle)) continue;

    const duration =
      (durationSeconds && durationSeconds > 0 ? durationSeconds : null) ??
      extractWorkoutDurationSeconds(haystack);

    if (!duration) continue;

    upsertCandidate(bucket, slug, duration, "SCORE", "sec", "lower");
    break;
  }

  const openMatch = haystack.match(/\b(?:open\s*)?(2[4-5]\.[1-3])\b/i);
  if (openMatch) {
    const openSlug = `open-${openMatch[1]}`;
    const duration = durationSeconds ?? extractWorkoutDurationSeconds(haystack);
    if (duration) {
      upsertCandidate(bucket, openSlug, duration, "SCORE", "sec", "lower");
    }
  }
}

export function detectPbCandidatesFromWorkout(
  workoutNameOrContext: string | WorkoutContext,
  durationSeconds?: number | null,
  exercisesArg?: ExerciseSnapshot[],
): WorkoutPbCandidate[] {
  const ctx: WorkoutContext =
    typeof workoutNameOrContext === "string"
      ? {
          workoutName: workoutNameOrContext,
          durationSeconds,
          exercises: exercisesArg ?? [],
        }
      : workoutNameOrContext;

  const bucket = new Map<string, WorkoutPbCandidate>();

  for (const exercise of ctx.exercises) {
    const mapping = MOVEMENT_PB_MAP[exercise.name];
    if (mapping) {
      const value = valueFromExercise(exercise, mapping);
      if (value !== null) {
        const prefer = mapping.pick === "minTime" ? "lower" : "higher";
        upsertCandidate(
          bucket,
          mapping.slug,
          value,
          mapping.recordType,
          mapping.unit,
          prefer,
        );
      }
    }

    detectDistanceTimeCandidates(exercise, bucket);

    if (exercise.name === "Row" && exercise.timeSeconds) {
      const distance = exercise.distanceMeters ?? 2000;
      const rowSlug = DISTANCE_PB_MAP.find((d) => d.meters === distance)?.slug ?? "row-2000m";
      upsertCandidate(bucket, rowSlug, exercise.timeSeconds, "TIME", "sec", "lower");
    }
  }

  detectWodCandidate(ctx.workoutName, ctx.notes, ctx.durationSeconds, bucket);

  return Array.from(bucket.values());
}

export function pbDisplayFromCandidate(candidate: WorkoutPbCandidate): string {
  if (candidate.recordType === "SCORE" && candidate.unit === "sec") {
    return formatDisplayValue(candidate.value, "TIME", "sec");
  }
  return formatDisplayValue(candidate.value, candidate.recordType, candidate.unit);
}
