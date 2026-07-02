import { format, startOfWeek } from "date-fns";

import type { CoachReport } from "@/features/ai-coach";
import type { RecoveryReadinessReport } from "@/features/recovery-readiness/types";
import { ATTRIBUTE_LABELS, type WeaknessReport } from "@/features/weakness-detection";
import type { CoachGoalContext } from "@/features/ai-coach/types";

import type { WeeklyDigest } from "./types";

export function buildWeeklyDigest(input: {
  coach: CoachReport | null;
  weakness: WeaknessReport | null;
  recovery: RecoveryReadinessReport | null;
  goals: CoachGoalContext[];
  priorScore?: number | null;
  currentScore?: number | null;
}): WeeklyDigest {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const focusArea = input.weakness ? ATTRIBUTE_LABELS[input.weakness.weakestAttribute] : null;

  const scoreDelta =
    input.priorScore != null && input.currentScore != null
      ? Math.round(input.currentScore - input.priorScore)
      : null;

  const trainingFocus = input.coach?.sections.find((s) => s.id === "training_focus")?.recommendation;
  const improvement = input.coach?.sections.find((s) => s.id === "biggest_improvement")?.recommendation;
  const topGoal = input.goals[0];

  const bullets: string[] = [];

  if (topGoal) {
    bullets.push(
      `Goal "${topGoal.title}" is at ${Math.round(topGoal.progressPct)}% — ${topGoal.deadline ? `deadline ${format(topGoal.deadline, "MMM d")}` : "keep building momentum"}.`,
    );
  }

  if (focusArea) {
    bullets.push(`Priority focus: ${focusArea}.`);
  }

  if (trainingFocus?.action) {
    bullets.push(trainingFocus.action);
  } else if (improvement?.reason) {
    bullets.push(improvement.reason);
  }

  if (input.recovery?.recommendation.summary) {
    bullets.push(input.recovery.recommendation.summary);
  }

  if (bullets.length === 0) {
    bullets.push("Log workouts and daily check-ins to unlock your weekly digest.");
  }

  const readinessDelta = input.weakness?.attributes.find((a) => a.category === "recovery")?.weeklyDelta;
  const readinessTrend =
    readinessDelta == null ? null : readinessDelta > 2 ? "up" : readinessDelta < -2 ? "down" : "stable";

  const headline =
    scoreDelta != null && scoreDelta !== 0
      ? `Athlete score ${scoreDelta > 0 ? "up" : "down"} ${Math.abs(scoreDelta)} this week`
      : focusArea
        ? `This week: sharpen ${focusArea}`
        : "Your week in training";

  return {
    weekLabel: `Week of ${format(weekStart, "MMM d")}`,
    scoreDelta,
    headline,
    bullets: bullets.slice(0, 3),
    focusArea,
    readinessTrend,
  };
}
