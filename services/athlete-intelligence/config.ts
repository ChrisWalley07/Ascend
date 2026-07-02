import type { IntelligenceEngineConfig } from "./types";

export const DEFAULT_INTELLIGENCE_CONFIG: IntelligenceEngineConfig = {
  analysisWindowDays: 90,
  recoveryWindowDays: 30,
  benchmarkWindowDays: 180,
  pbWindowDays: 365,
  thresholds: {
    minWorkoutsForAnalysis: 3,
    minRecoveryLogsForAnalysis: 2,
    minDataPointsForTrend: 3,
    acuteLoadDays: 7,
    chronicLoadDays: 28,
    optimalAcwrMin: 0.8,
    optimalAcwrMax: 1.3,
    highFatigueAcwr: 1.5,
    lowReadinessWarning: 55,
    highSorenessWarning: 7,
    consistencyTargetSessionsPerWeek: 4,
    trendImprovementPercent: 5,
    trendDeclinePercent: 5,
    defaultRpe: 6,
    strengthReferenceKg: 180,
    runningPaceImprovementSeconds: 3,
  },
  compositeWeights: {
    readiness: {
      recovery: 0.45,
      fatigueInverse: 0.35,
      consistency: 0.2,
    },
    fitness: {
      strength: 0.25,
      running: 0.2,
      benchmarks: 0.15,
      consistency: 0.2,
      personalBests: 0.2,
    },
    fatigue: {
      trainingLoad: 0.45,
      recoveryInverse: 0.35,
      rpe: 0.2,
    },
  },
};

export function mergeEngineConfig(
  overrides?: Partial<IntelligenceEngineConfig>,
): IntelligenceEngineConfig {
  if (!overrides) return DEFAULT_INTELLIGENCE_CONFIG;

  return {
    analysisWindowDays: overrides.analysisWindowDays ?? DEFAULT_INTELLIGENCE_CONFIG.analysisWindowDays,
    recoveryWindowDays: overrides.recoveryWindowDays ?? DEFAULT_INTELLIGENCE_CONFIG.recoveryWindowDays,
    benchmarkWindowDays: overrides.benchmarkWindowDays ?? DEFAULT_INTELLIGENCE_CONFIG.benchmarkWindowDays,
    pbWindowDays: overrides.pbWindowDays ?? DEFAULT_INTELLIGENCE_CONFIG.pbWindowDays,
    thresholds: {
      ...DEFAULT_INTELLIGENCE_CONFIG.thresholds,
      ...overrides.thresholds,
    },
    compositeWeights: {
      readiness: {
        ...DEFAULT_INTELLIGENCE_CONFIG.compositeWeights.readiness,
        ...overrides.compositeWeights?.readiness,
      },
      fitness: {
        ...DEFAULT_INTELLIGENCE_CONFIG.compositeWeights.fitness,
        ...overrides.compositeWeights?.fitness,
      },
      fatigue: {
        ...DEFAULT_INTELLIGENCE_CONFIG.compositeWeights.fatigue,
        ...overrides.compositeWeights?.fatigue,
      },
    },
  };
}
