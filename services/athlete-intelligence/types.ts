import type { SportDepartment } from "@prisma/client";

import type { SportView } from "@/lib/sports/types";

export type IntelligenceDomain =
  | "training_load"
  | "weekly_volume"
  | "workout_frequency"
  | "recovery"
  | "running_progress"
  | "strength_progress"
  | "consistency"
  | "benchmarks"
  | "personal_bests"
  | "race_results";

export type MomentumDirection = "improving" | "stable" | "declining" | "insufficient_data";

export type TrendDirection = "up" | "down" | "flat" | "unknown";

export type IntelligenceSeverity = "info" | "success" | "warning" | "critical";

export type DomainMetric = {
  key: string;
  label: string;
  value: number;
  unit?: string;
  trend?: TrendDirection;
};

export type DomainSignal = {
  domain: IntelligenceDomain;
  score: number;
  momentum: MomentumDirection;
  confidence: number;
  metrics: DomainMetric[];
  summary: string;
};

export type IntelligenceRecommendation = {
  id: string;
  domain: IntelligenceDomain;
  title: string;
  message: string;
  severity: IntelligenceSeverity;
  priority: number;
};

export type IntelligenceWarning = {
  id: string;
  domain: IntelligenceDomain;
  title: string;
  message: string;
  severity: Exclude<IntelligenceSeverity, "info" | "success">;
  priority: number;
};

export type IntelligencePrediction = {
  id: string;
  domain: IntelligenceDomain;
  title: string;
  message: string;
  horizonDays: number;
  confidence: number;
};

export type AthleteIntelligenceReport = {
  generatedAt: string;
  sportView: SportView;
  athleteType: SportDepartment;
  readiness: number;
  fitness: number;
  fatigue: number;
  momentum: MomentumDirection;
  confidence: number;
  domains: Record<IntelligenceDomain, DomainSignal>;
  recommendations: IntelligenceRecommendation[];
  warnings: IntelligenceWarning[];
  predictions: IntelligencePrediction[];
};

export type WorkoutExerciseSnapshot = {
  weightKg: number | null;
  reps: number | null;
  distanceMeters: number | null;
  timeSeconds: number | null;
  calories: number | null;
  category: string;
  name: string;
};

export type WorkoutSnapshot = {
  id: string;
  date: Date;
  type: string;
  durationSeconds: number | null;
  rpe: number | null;
  sport: SportDepartment | null;
  exercises: WorkoutExerciseSnapshot[];
};

export type RecoverySnapshot = {
  date: Date;
  readinessScore: number;
  sleepHours: number | null;
  restingHeartRate: number | null;
  hrv: number | null;
  mood: number | null;
  energy: number | null;
  soreness: number | null;
  hydration: number | null;
};

export type BenchmarkAttemptSnapshot = {
  benchmarkName: string;
  benchmarkType: string;
  score: number;
  scoreValue: number | null;
  date: Date;
};

export type PersonalBestSnapshot = {
  slug: string;
  name: string;
  category: string;
  value: number;
  displayValue: string;
  achievedAt: Date;
  recordType: string;
  scoreDirection: string;
};

export type RaceSplitSnapshot = {
  stationSlug: string;
  sequence: number;
  timeSeconds: number | null;
  pacePerKmSeconds: number | null;
};

export type RaceSnapshot = {
  id: string;
  name: string;
  raceDate: Date;
  finishTimeSeconds: number | null;
  predictedFinishSeconds: number | null;
  weakestStationSlug: string | null;
  strongestStationSlug: string | null;
  splits: RaceSplitSnapshot[];
};

export type ProfileSnapshot = {
  trainingDaysPerWeek: number | null;
  experienceLevel: string | null;
  primaryGoal: string | null;
  sportDepartment: SportDepartment | null;
  focusAreas: string[];
};

export type IntelligenceRawData = {
  userId: string;
  sportView: SportView;
  athleteType: SportDepartment;
  collectedAt: Date;
  workouts: WorkoutSnapshot[];
  recoveryLogs: RecoverySnapshot[];
  benchmarkAttempts: BenchmarkAttemptSnapshot[];
  personalBests: PersonalBestSnapshot[];
  races: RaceSnapshot[];
  profile: ProfileSnapshot | null;
};

export type AnalyzerContext = {
  data: IntelligenceRawData;
  config: IntelligenceEngineConfig;
  now: Date;
};

export type DomainAnalyzer = {
  domain: IntelligenceDomain;
  analyze: (ctx: AnalyzerContext) => DomainSignal;
};

export type SportIntelligencePlugin = {
  sportView: SportView;
  /** Optional domain analyzers that override or extend defaults */
  analyzers?: Partial<Record<IntelligenceDomain, DomainAnalyzer>>;
  /** Adjust composite score weights for this sport */
  compositeWeights?: Partial<CompositeWeights>;
  /** Sport-specific recommendations after synthesis */
  enrich?: (report: AthleteIntelligenceReport, ctx: AnalyzerContext) => AthleteIntelligenceReport;
};

export type CompositeWeights = {
  readiness: {
    recovery: number;
    fatigueInverse: number;
    consistency: number;
  };
  fitness: {
    strength: number;
    running: number;
    benchmarks: number;
    consistency: number;
    personalBests: number;
  };
  fatigue: {
    trainingLoad: number;
    recoveryInverse: number;
    rpe: number;
  };
};

export type IntelligenceThresholds = {
  minWorkoutsForAnalysis: number;
  minRecoveryLogsForAnalysis: number;
  minDataPointsForTrend: number;
  acuteLoadDays: number;
  chronicLoadDays: number;
  optimalAcwrMin: number;
  optimalAcwrMax: number;
  highFatigueAcwr: number;
  lowReadinessWarning: number;
  highSorenessWarning: number;
  consistencyTargetSessionsPerWeek: number;
  trendImprovementPercent: number;
  trendDeclinePercent: number;
  defaultRpe: number;
  strengthReferenceKg: number;
  runningPaceImprovementSeconds: number;
};

export type IntelligenceEngineConfig = {
  analysisWindowDays: number;
  recoveryWindowDays: number;
  benchmarkWindowDays: number;
  pbWindowDays: number;
  thresholds: IntelligenceThresholds;
  compositeWeights: CompositeWeights;
};

export type IntelligenceEngineOptions = {
  sportView?: SportView;
  config?: Partial<IntelligenceEngineConfig>;
};
