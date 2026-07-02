import type { CoachSectionId } from "./types";

export const COACH_SECTION_META: Record<
  CoachSectionId,
  { label: string; description: string }
> = {
  todays_recommendation: {
    label: "Today's Recommendation",
    description: "Your highest-impact action for today based on readiness and load.",
  },
  recovery_advice: {
    label: "Recovery Advice",
    description: "How to manage fatigue and readiness before your next session.",
  },
  training_focus: {
    label: "Training Focus",
    description: "Where to direct your effort this training block.",
  },
  biggest_improvement: {
    label: "Biggest Improvement",
    description: "The area showing the strongest positive signal.",
  },
  risk_factors: {
    label: "Risk Factors",
    description: "Patterns that could limit progress or increase injury risk.",
  },
  next_milestone: {
    label: "Next Milestone",
    description: "The nearest achievable target on your horizon.",
  },
};

export const COACH_THRESHOLDS = {
  lowReadiness: 55,
  highSoreness: 7,
  highAcwr: 1.5,
  optimalAcwrMin: 0.8,
  optimalAcwrMax: 1.3,
  minSessionsPerWeek: 3,
  lowConsistencyScore: 50,
  minWorkoutsForCoach: 2,
  minRecoveryLogs: 2,
} as const;
