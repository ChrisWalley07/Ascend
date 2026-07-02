export { DEFAULT_INTELLIGENCE_CONFIG, mergeEngineConfig } from "./config";
export { generateAthleteIntelligence, analyzeAthleteIntelligence } from "./engine";
export { collectIntelligenceData } from "./collectors/data-collector";
export { DEFAULT_ANALYZERS } from "./analyzers";
export { getSportPlugin, registerSportPlugin, listSportPlugins } from "./sports/registry";
export { crossfitPlugin } from "./sports/crossfit-plugin";
export { hyroxPlugin } from "./sports/hyrox-plugin";

export type {
  AthleteIntelligenceReport,
  IntelligenceDomain,
  IntelligenceRecommendation,
  IntelligenceWarning,
  IntelligencePrediction,
  DomainSignal,
  DomainMetric,
  MomentumDirection,
  TrendDirection,
  IntelligenceSeverity,
  IntelligenceRawData,
  IntelligenceEngineConfig,
  IntelligenceEngineOptions,
  SportIntelligencePlugin,
  DomainAnalyzer,
  AnalyzerContext,
  WorkoutSnapshot,
  RecoverySnapshot,
  BenchmarkAttemptSnapshot,
  PersonalBestSnapshot,
  RaceSnapshot,
  ProfileSnapshot,
} from "./types";
