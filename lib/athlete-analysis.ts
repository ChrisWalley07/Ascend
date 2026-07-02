import type {
  ExperienceLevel,
  Gender,
  SportDepartment,
  TrainingEnvironment,
  TrainingGoal,
} from "@prisma/client";

import { getDepartmentConfig, getDepartmentFocusScoreKey } from "@/lib/departments";
import { FOCUS_AREAS, REQUIRED_PROFILE_FIELDS } from "@/lib/profile-constants";
import type { AthleteScoreSnapshot } from "@/lib/athlete-score";

export type ProfileInput = {
  name: string;
  age: number | null;
  gender: Gender | null;
  heightCm: number | null;
  weightKg: number | null;
  trainingAgeMonths: number | null;
  experienceLevel: ExperienceLevel | null;
  primaryGoal: TrainingGoal | null;
  trainingDaysPerWeek: number | null;
  trainingEnvironment: TrainingEnvironment | null;
  injuriesNotes: string | null;
  focusAreas: string[];
  strongAreas: string[];
  sleepTargetHours: number | null;
  competitionTarget: string | null;
  coachNotes: string | null;
  sportDepartment: SportDepartment | null;
  profileCompleted: boolean;
};

export type TrainingStats = {
  workoutsPerWeek: number;
  recentWorkoutCount: number;
  pbCount: number;
  categoryScores: Pick<
    AthleteScoreSnapshot,
    | "strengthScore"
    | "olympicLiftingScore"
    | "engineScore"
    | "gymnasticsScore"
    | "powerScore"
    | "consistencyScore"
    | "recoveryScore"
    | "mobilityScore"
  >;
};

type CategoryScoreKey = keyof TrainingStats["categoryScores"];

const HYROX_SCORE_FALLBACK: Record<string, CategoryScoreKey> = {
  runningScore: "engineScore",
  gripScore: "strengthScore",
  workCapacityScore: "consistencyScore",
  mentalScore: "recoveryScore",
};

function resolveCategoryScore(stats: TrainingStats, scoreKey: string): number | null {
  if (scoreKey in stats.categoryScores) {
    return stats.categoryScores[scoreKey as CategoryScoreKey];
  }
  const fallback = HYROX_SCORE_FALLBACK[scoreKey];
  return fallback ? stats.categoryScores[fallback] : null;
}

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

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  age: "Age",
  gender: "Gender",
  heightCm: "Height",
  weightKg: "Weight",
  trainingAgeMonths: "Training age",
  experienceLevel: "Experience level",
  primaryGoal: "Primary goal",
  trainingDaysPerWeek: "Training days per week",
  trainingEnvironment: "Training environment",
  focusAreas: "Focus areas",
};

function calcBmi(heightCm: number | null, weightKg: number | null) {
  if (!heightCm || !weightKg) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

function bmiLabel(bmi: number | null) {
  if (bmi === null) return "Unknown";
  if (bmi < 18.5) return "Underweight range";
  if (bmi < 25) return "Healthy range";
  if (bmi < 30) return "Overweight range";
  return "Higher BMI range";
}

function trainingMaturity(profile: ProfileInput) {
  const months = profile.trainingAgeMonths ?? 0;
  const level = profile.experienceLevel;
  if (level === "COMPETITOR") return "Competition-focused athlete";
  if (months < 12 || level === "BEGINNER") return "Building foundations";
  if (months < 36 || level === "INTERMEDIATE") return "Developing athlete";
  if (months < 60 || level === "ADVANCED") return "Experienced athlete";
  return "Veteran athlete";
}

const GOAL_CATEGORY_MAP: Record<TrainingGoal, (keyof TrainingStats["categoryScores"])[]> = {
  GENERAL_FITNESS: ["consistencyScore", "recoveryScore", "engineScore"],
  STRENGTH: ["strengthScore", "powerScore"],
  ENGINE: ["engineScore", "consistencyScore"],
  COMPETITION: ["strengthScore", "engineScore", "gymnasticsScore", "olympicLiftingScore"],
  HYBRID: ["strengthScore", "engineScore", "gymnasticsScore"],
  WEIGHT_MANAGEMENT: ["consistencyScore", "engineScore", "recoveryScore"],
  SKILL_MASTERY: ["gymnasticsScore", "olympicLiftingScore", "mobilityScore"],
};

export function getProfileCompleteness(profile: ProfileInput) {
  const missing: string[] = [];
  const focusAreas = profile.focusAreas ?? [];

  for (const field of REQUIRED_PROFILE_FIELDS) {
    if (field === "focusAreas") {
      if (!focusAreas.length) missing.push(FIELD_LABELS.focusAreas);
      continue;
    }
    const value = profile[field as keyof ProfileInput];
    if (value === null || value === undefined || value === "") {
      missing.push(FIELD_LABELS[field] ?? field);
    }
  }

  const total = REQUIRED_PROFILE_FIELDS.length;
  const complete = total - missing.length;
  return {
    completenessPercent: Math.round((complete / total) * 100),
    missingFields: missing,
  };
}

export function analyzeAthleteProfile(
  profile: ProfileInput,
  stats: TrainingStats,
): ProfileAnalysis {
  const { completenessPercent, missingFields } = getProfileCompleteness(profile);
  const bmi = calcBmi(profile.heightCm, profile.weightKg);

  const goalInsights: string[] = [];
  const recommendations: string[] = [];
  const focusGapInsights: string[] = [];

  let goalAlignmentScore = 0;

  if (profile.primaryGoal) {
    const priorityCategories = GOAL_CATEGORY_MAP[profile.primaryGoal];
    goalAlignmentScore = Math.round(
      priorityCategories
        .map((key) => stats.categoryScores[key])
        .reduce((a, b) => a + b, 0) / Math.max(priorityCategories.length, 1),
    );

    if (profile.primaryGoal === "STRENGTH" && stats.categoryScores.strengthScore < 65) {
      goalInsights.push(
        "Your strength score is below target for a strength-focused athlete — prioritise heavy compounds 2–3× per week.",
      );
    } else if (profile.primaryGoal === "ENGINE" && stats.categoryScores.engineScore < 65) {
      goalInsights.push(
        "Engine is your stated priority but scores suggest more monostructural and interval work would help.",
      );
    } else if (profile.primaryGoal === "COMPETITION") {
      goalInsights.push(
        "Competition mode: balance strength, engine, and gymnastics — your weakest category needs dedicated weekly work.",
      );
    } else if (goalAlignmentScore >= 70) {
      goalInsights.push("Your recent training aligns well with your primary goal.");
    } else {
      goalInsights.push("Your training mix hasn't fully matched your primary goal yet — adjust session focus.");
    }
  } else {
    goalInsights.push("Complete your profile to unlock goal-specific analysis.");
  }

  if (profile.trainingDaysPerWeek) {
    const delta = stats.workoutsPerWeek - profile.trainingDaysPerWeek;
    if (delta < -1) {
      recommendations.push(
        `You're averaging ${stats.workoutsPerWeek.toFixed(1)} sessions/week vs your ${profile.trainingDaysPerWeek}-day target. Add ${Math.ceil(Math.abs(delta))} more session${Math.abs(delta) > 1 ? "s" : ""}.`,
      );
    } else if (delta > 1.5) {
      recommendations.push(
        `You're training ${stats.workoutsPerWeek.toFixed(1)}×/week — above your ${profile.trainingDaysPerWeek}-day plan. Watch recovery if performance dips.`,
      );
    } else if (profile.profileCompleted) {
      recommendations.push("Training frequency matches your weekly target — good consistency.");
    }
  }

  for (const focus of profile.focusAreas ?? []) {
    const scoreKey = getDepartmentFocusScoreKey(focus, profile.sportDepartment);
    if (!scoreKey) continue;
    const deptFocus = getDepartmentConfig(profile.sportDepartment).focusAreas.find(
      (a) => a.id === focus,
    );
    const label =
      deptFocus?.label ?? FOCUS_AREAS.find((a) => a.id === focus)?.label ?? focus;
    const score = resolveCategoryScore(stats, scoreKey);
    if (score == null) continue;
    if (score < 60) {
      focusGapInsights.push(
        `${label} is a focus area but currently one of your lower scores (${score}/100).`,
      );
    }
  }

  for (const strong of profile.strongAreas ?? []) {
    const scoreKey = getDepartmentFocusScoreKey(strong, profile.sportDepartment);
    if (!scoreKey) continue;
    const deptFocus = getDepartmentConfig(profile.sportDepartment).focusAreas.find(
      (a) => a.id === strong,
    );
    const label =
      deptFocus?.label ?? FOCUS_AREAS.find((a) => a.id === strong)?.label ?? strong;
    const score = resolveCategoryScore(stats, scoreKey);
    if (score == null) continue;
    if (score >= 70) {
      focusGapInsights.push(
        `${label} is a declared strength and your data backs it up (${score}/100).`,
      );
    }
  }

  if (profile.injuriesNotes?.trim()) {
    recommendations.push(
      "Train around injury limitations — prioritise quality movement and extra warm-up on affected areas.",
    );
  }

  if (profile.sleepTargetHours && profile.sleepTargetHours < 7) {
    recommendations.push(
      "Your sleep target is under 7 hours — consider 7–9h for better recovery and PR potential.",
    );
  }

  if (profile.competitionTarget?.trim()) {
    recommendations.push(
      `Competition target: "${profile.competitionTarget}" — work backwards from event date in your Goals.`,
    );
  }

  if (completenessPercent < 100) {
    recommendations.push(
      `Complete your profile (${completenessPercent}%) for more accurate scoring and coaching.`,
    );
  }

  return {
    completenessPercent,
    missingFields,
    bmi,
    bmiLabel: bmiLabel(bmi),
    trainingMaturityLabel: trainingMaturity(profile),
    goalAlignmentScore,
    goalInsights,
    recommendations: recommendations.slice(0, 5),
    focusGapInsights: focusGapInsights.slice(0, 4),
  };
}

export function applyProfileToScores(
  snapshot: AthleteScoreSnapshot,
  profile: ProfileInput,
  workoutsPerWeek: number,
): AthleteScoreSnapshot {
  if (getProfileCompleteness(profile).completenessPercent < 80) {
    return snapshot;
  }

  let consistencyScore = snapshot.consistencyScore;
  if (profile.trainingDaysPerWeek) {
    const adherence = Math.min(1, workoutsPerWeek / profile.trainingDaysPerWeek);
    consistencyScore = Math.round(consistencyScore * 0.6 + adherence * 100 * 0.4);
  }

  let recoveryScore = snapshot.recoveryScore;
  if (profile.sleepTargetHours) {
    const sleepFactor = Math.min(1, profile.sleepTargetHours / 8);
    recoveryScore = Math.round(recoveryScore * 0.7 + sleepFactor * 100 * 0.3);
  }

  const weighted = { ...snapshot, consistencyScore, recoveryScore };

  if (profile.primaryGoal === "STRENGTH") {
    weighted.overallScore = Math.round(
      weighted.strengthScore * 0.22 +
        weighted.olympicLiftingScore * 0.1 +
        weighted.engineScore * 0.12 +
        weighted.gymnasticsScore * 0.1 +
        weighted.powerScore * 0.16 +
        weighted.consistencyScore * 0.14 +
        weighted.recoveryScore * 0.1 +
        weighted.mobilityScore * 0.06,
    );
  } else if (profile.primaryGoal === "ENGINE") {
    weighted.overallScore = Math.round(
      weighted.strengthScore * 0.12 +
        weighted.olympicLiftingScore * 0.08 +
        weighted.engineScore * 0.24 +
        weighted.gymnasticsScore * 0.1 +
        weighted.powerScore * 0.1 +
        weighted.consistencyScore * 0.16 +
        weighted.recoveryScore * 0.12 +
        weighted.mobilityScore * 0.08,
    );
  } else if (profile.primaryGoal === "COMPETITION") {
    weighted.overallScore = Math.round(
      weighted.strengthScore * 0.16 +
        weighted.olympicLiftingScore * 0.14 +
        weighted.engineScore * 0.16 +
        weighted.gymnasticsScore * 0.14 +
        weighted.powerScore * 0.12 +
        weighted.consistencyScore * 0.14 +
        weighted.recoveryScore * 0.08 +
        weighted.mobilityScore * 0.06,
    );
  }

  const entries = Object.entries(weighted).filter(
    ([key]) => key.endsWith("Score") && key !== "overallScore",
  ) as [string, number][];
  const strongest = entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best), entries[0]);
  const weakest = entries.reduce((worst, cur) => (cur[1] < worst[1] ? cur : worst), entries[0]);

  return {
    ...weighted,
    strongestCategory: strongest[0],
    weakestCategory: weakest[0],
  };
}

export function toProfileInput(
  row: {
    name: string;
    age: number | null;
    gender: Gender | null;
    heightCm: number | null;
    weightKg: number | null;
    trainingAgeMonths: number | null;
    experienceLevel: ExperienceLevel | null;
    primaryGoal: TrainingGoal | null;
    trainingDaysPerWeek: number | null;
    trainingEnvironment: TrainingEnvironment | null;
    injuriesNotes: string | null;
    focusAreas: string[];
    strongAreas: string[];
    sleepTargetHours: number | null;
    competitionTarget: string | null;
    coachNotes: string | null;
    sportDepartment: SportDepartment | null;
    profileCompleted: boolean;
  } | null,
): ProfileInput {
  if (!row) {
    return {
      name: "",
      age: null,
      gender: null,
      heightCm: null,
      weightKg: null,
      trainingAgeMonths: null,
      experienceLevel: null,
      primaryGoal: null,
      trainingDaysPerWeek: null,
      trainingEnvironment: null,
      injuriesNotes: null,
      focusAreas: [],
      strongAreas: [],
      sleepTargetHours: null,
      competitionTarget: null,
      coachNotes: null,
      sportDepartment: null,
      profileCompleted: false,
    };
  }
  return {
    name: row.name ?? "",
    age: row.age ?? null,
    gender: row.gender ?? null,
    heightCm: row.heightCm ?? null,
    weightKg: row.weightKg ?? null,
    trainingAgeMonths: row.trainingAgeMonths ?? null,
    experienceLevel: row.experienceLevel ?? null,
    primaryGoal: row.primaryGoal ?? null,
    trainingDaysPerWeek: row.trainingDaysPerWeek ?? null,
    trainingEnvironment: row.trainingEnvironment ?? null,
    injuriesNotes: row.injuriesNotes ?? null,
    focusAreas: row.focusAreas ?? [],
    strongAreas: row.strongAreas ?? [],
    sleepTargetHours: row.sleepTargetHours ?? null,
    competitionTarget: row.competitionTarget ?? null,
    coachNotes: row.coachNotes ?? null,
    sportDepartment: row.sportDepartment ?? null,
    profileCompleted: row.profileCompleted ?? false,
  };
}
