import type { SportView } from "@/domain/models/sport";

export type ReadinessZone = "green" | "yellow" | "red";

export type ScoreKey =
  | "recovery"
  | "readiness"
  | "fatigue"
  | "sleep"
  | "training_stress"
  | "workout_load";

export type ScoreExplanation = {
  key: ScoreKey;
  label: string;
  score: number | null;
  zone: ReadinessZone;
  confidence: number;
  /** Human-readable reasons for this exact score */
  reasons: string[];
  /** When false, score is placeholder until data is available */
  supported: boolean;
};

export type TrainingRecommendation = {
  zone: ReadinessZone;
  title: string;
  summary: string;
  actions: string[];
};

export type RecoveryReadinessReport = {
  generatedAt: string;
  sportView: SportView;
  overallZone: ReadinessZone;
  overallConfidence: number;
  recommendation: TrainingRecommendation;
  scores: {
    recovery: ScoreExplanation;
    readiness: ScoreExplanation;
    fatigue: ScoreExplanation;
    sleep: ScoreExplanation;
    trainingStress: ScoreExplanation;
    workoutLoad: ScoreExplanation;
  };
};

export type RecoveryReadinessOptions = {
  sportView?: SportView;
};
