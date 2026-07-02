import type {
  ExperienceLevel,
  Gender,
  SportDepartment,
  TrainingEnvironment,
  TrainingGoal,
} from "@prisma/client";

export type AthleteProfile = {
  userId: string;
  name: string | null;
  age: number | null;
  gender: Gender | null;
  heightCm: number | null;
  weightKg: number | null;
  trainingAgeMonths: number | null;
  experienceLevel: ExperienceLevel | null;
  primaryGoal: TrainingGoal | null;
  trainingDaysPerWeek: number | null;
  trainingEnvironment: TrainingEnvironment | null;
  sportDepartment: SportDepartment | null;
  activeSportView: SportDepartment | null;
  injuriesNotes: string | null;
  focusAreas: string[];
  strongAreas: string[];
  sleepTargetHours: number | null;
  competitionTarget: string | null;
  coachNotes: string | null;
  profileCompleted: boolean;
};

export type AthleteScoreSnapshot = {
  overallScore: number;
  strengthScore: number;
  olympicLiftingScore: number;
  engineScore: number;
  gymnasticsScore: number;
  powerScore: number;
  consistencyScore: number;
  recoveryScore: number;
  mobilityScore: number;
  strongestCategory: string;
  weakestCategory: string;
};

export type HyroxScoreSnapshot = {
  overallScore: number;
  runningScore: number;
  engineScore: number;
  strengthScore: number;
  powerScore: number;
  gripScore: number;
  recoveryScore: number;
  workCapacityScore: number;
  mobilityScore: number;
  mentalScore: number;
  level: number;
};

export type ProfileAnalysis = {
  completenessPercent: number;
  missingFields: string[];
  bmi: number | null;
  bmiLabel: string;
  trainingMaturityLabel: string;
  goalAlignmentScore: number;
  goalInsights: string[];
  recommendations: string[];
  focusGapInsights: string[];
};
