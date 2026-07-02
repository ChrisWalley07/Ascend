import type { SportDepartment } from "@prisma/client";

import type { SportView } from "@/domain/models/sport";
import type { AthleteIntelligenceReport } from "@/services/athlete-intelligence";

export type CoachSectionId =
  | "todays_recommendation"
  | "recovery_advice"
  | "training_focus"
  | "biggest_improvement"
  | "risk_factors"
  | "next_milestone";

export type CoachRecommendation = {
  id: string;
  section: CoachSectionId;
  title: string;
  reason: string;
  priority: number;
  confidence: number;
  action: string;
  tags: string[];
};

export type CoachSection = {
  id: CoachSectionId;
  label: string;
  description: string;
  recommendation: CoachRecommendation | null;
};

export type CoachGoalContext = {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  progressPct: number;
  deadline: Date | null;
};

export type CoachRaceContext = {
  name: string;
  raceDate: Date;
  finishTimeSeconds: number | null;
  isUpcoming: boolean;
  weakestStation: string | null;
  strongestStation: string | null;
};

export type CoachDataContext = {
  userId: string;
  sportView: SportView;
  athleteType: SportDepartment;
  collectedAt: Date;
  athleteName: string;
  trainingDaysPerWeek: number | null;
  competitionTarget: string | null;
  intelligence: AthleteIntelligenceReport | null;
  goals: CoachGoalContext[];
  race: CoachRaceContext | null;
  recentWorkoutCount: number;
  sessionsPerWeek: number;
  avgReadiness: number | null;
  avgSoreness: number | null;
  acwr: number | null;
  profileComplete: boolean;
};

export type CoachReport = {
  generatedAt: string;
  sportView: SportView;
  athleteName: string;
  confidenceScore: number;
  sections: CoachSection[];
  allRecommendations: CoachRecommendation[];
};

export type CoachRule = {
  id: string;
  section: CoachSectionId;
  evaluate: (ctx: CoachDataContext) => CoachRecommendation | null;
};

export type CoachEngineOptions = {
  sportView?: SportView;
};
