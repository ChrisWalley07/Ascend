import type { CoachReport } from "@/features/ai-coach";
import type { RecoveryReadinessReport } from "@/features/recovery-readiness/types";
import { ATTRIBUTE_LABELS, type WeaknessReport } from "@/features/weakness-detection";

export type DashboardInsight = {
  headline: string;
  body: string;
  action: string;
  focusArea: string | null;
  readinessScore: number | null;
  readinessZone: "green" | "yellow" | "red" | null;
  confidence: number;
};

export function buildDashboardInsight(
  coach: CoachReport | null,
  recovery: RecoveryReadinessReport | null,
  weakness: WeaknessReport | null,
): DashboardInsight {
  const today =
    coach?.sections.find((s) => s.id === "todays_recommendation")?.recommendation ?? null;
  const recoveryRec =
    coach?.sections.find((s) => s.id === "recovery_advice")?.recommendation ?? null;
  const focusRec =
    coach?.sections.find((s) => s.id === "training_focus")?.recommendation ?? null;

  const focusArea = weakness ? ATTRIBUTE_LABELS[weakness.weakestAttribute] : null;
  const readinessScore = recovery?.scores.readiness.score ?? null;
  const readinessZone = recovery?.overallZone ?? null;

  const fallbackHeadline = focusArea
    ? `Focus on ${focusArea} this week`
    : "Log a session to unlock coaching";

  const headline = today?.title ?? focusRec?.title ?? fallbackHeadline;

  const bodyParts: string[] = [];
  if (today?.reason) bodyParts.push(today.reason);
  else if (focusRec?.reason) bodyParts.push(focusRec.reason);

  if (recoveryRec?.reason && recoveryRec.id !== today?.id) {
    bodyParts.push(recoveryRec.reason);
  } else if (recovery?.recommendation.summary) {
    bodyParts.push(recovery.recommendation.summary);
  }

  if (bodyParts.length === 0) {
    bodyParts.push(
      "Describe today's workout below — I'll categorize it and update your athlete profile.",
    );
  }

  const action =
    today?.action ??
    recoveryRec?.action ??
    focusRec?.action ??
    recovery?.recommendation.actions[0] ??
    "Log your latest session to refine recommendations.";

  const confidence = Math.round(
    coach?.confidenceScore ??
      recovery?.overallConfidence ??
      weakness?.overallConfidence ??
      0,
  );

  return {
    headline,
    body: bodyParts.slice(0, 2).join(" "),
    action,
    focusArea,
    readinessScore,
    readinessZone,
    confidence,
  };
}
