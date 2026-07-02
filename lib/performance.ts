import type { PersonalRecordType, ScoreDirection } from "@prisma/client";

export type PrCandidate = {
  exerciseId: string;
  type: PersonalRecordType;
  value: number;
  unit: string;
  betterWhen: ScoreDirection;
};

type RawExerciseEntry = {
  exerciseId: string;
  weightKg: number | null;
  reps: number | null;
  distanceMeters: number | null;
  timeSeconds: number | null;
};

export function buildPrCandidates(exercises: RawExerciseEntry[]) {
  const candidates: PrCandidate[] = [];

  for (const exercise of exercises) {
    if ((exercise.weightKg ?? 0) > 0) {
      candidates.push({
        exerciseId: exercise.exerciseId,
        type: "HEAVIEST_LIFT",
        value: exercise.weightKg!,
        unit: "kg",
        betterWhen: "HIGHER_IS_BETTER",
      });
    }

    if ((exercise.reps ?? 0) > 0) {
      candidates.push({
        exerciseId: exercise.exerciseId,
        type: "MAX_REPS",
        value: exercise.reps!,
        unit: "reps",
        betterWhen: "HIGHER_IS_BETTER",
      });
    }

    if ((exercise.distanceMeters ?? 0) > 0) {
      candidates.push({
        exerciseId: exercise.exerciseId,
        type: "LONGEST_DISTANCE",
        value: exercise.distanceMeters!,
        unit: "m",
        betterWhen: "HIGHER_IS_BETTER",
      });
    }

    if ((exercise.timeSeconds ?? 0) > 0) {
      candidates.push({
        exerciseId: exercise.exerciseId,
        type: "FASTEST_TIME",
        value: exercise.timeSeconds!,
        unit: "s",
        betterWhen: "LOWER_IS_BETTER",
      });
    }
  }

  return selectBestCandidateByMetric(candidates);
}

function selectBestCandidateByMetric(candidates: PrCandidate[]) {
  const bestByKey = new Map<string, PrCandidate>();

  for (const candidate of candidates) {
    const key = `${candidate.exerciseId}:${candidate.type}`;
    const currentBest = bestByKey.get(key);

    if (!currentBest) {
      bestByKey.set(key, candidate);
      continue;
    }

    const isBetter =
      candidate.betterWhen === "LOWER_IS_BETTER"
        ? candidate.value < currentBest.value
        : candidate.value > currentBest.value;

    if (isBetter) {
      bestByKey.set(key, candidate);
    }
  }

  return Array.from(bestByKey.values());
}
