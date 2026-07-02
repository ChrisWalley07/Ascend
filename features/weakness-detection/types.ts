import type { SportView } from "@/domain/models/sport";

export type WeaknessAttributeCategory =
  | "running"
  | "grip"
  | "engine"
  | "mobility"
  | "strength"
  | "recovery"
  | "work_capacity"
  | "explosiveness";

export type WeaknessSeverity = "critical" | "high" | "moderate" | "low";

export type AttributeSnapshot = {
  category: WeaknessAttributeCategory;
  label: string;
  currentScore: number;
  priorScore: number;
  weeklyDelta: number;
  confidence: number;
  trend: "improving" | "stable" | "declining" | "unknown";
};

export type WeaknessItem = {
  category: WeaknessAttributeCategory;
  severity: WeaknessSeverity;
  confidence: number;
  recommendation: string;
  currentScore: number;
  weeklyDelta: number;
};

export type PriorityItem = {
  category: WeaknessAttributeCategory;
  label: string;
  priority: number;
  reason: string;
};

export type WeaknessReport = {
  generatedAt: string;
  sportView: SportView;
  weekLabel: string;
  strongestAttribute: WeaknessAttributeCategory;
  weakestAttribute: WeaknessAttributeCategory;
  mostImproved: WeaknessAttributeCategory;
  mostRegressed: WeaknessAttributeCategory;
  attributes: AttributeSnapshot[];
  weaknesses: WeaknessItem[];
  priorityList: PriorityItem[];
  overallConfidence: number;
};

export type WeaknessEngineOptions = {
  sportView?: SportView;
};

export type CrossfitScoreInput = {
  strengthScore: number;
  olympicLiftingScore: number;
  engineScore: number;
  gymnasticsScore: number;
  powerScore: number;
  consistencyScore: number;
  recoveryScore: number;
  mobilityScore: number;
};

export type HyroxScoreInput = {
  runningScore: number;
  engineScore: number;
  strengthScore: number;
  powerScore: number;
  gripScore: number;
  recoveryScore: number;
  workCapacityScore: number;
  mobilityScore: number;
};

export type WeeklyWeaknessContext = {
  sportView: SportView;
  collectedAt: Date;
  current: Record<WeaknessAttributeCategory, number>;
  prior: Record<WeaknessAttributeCategory, number>;
  confidenceByCategory: Record<WeaknessAttributeCategory, number>;
  recentWorkoutCount: number;
  priorWorkoutCount: number;
};
