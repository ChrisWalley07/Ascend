import { COACH_SECTION_META } from "./config";
import { getRulesForView } from "./rules";
import type {
  CoachDataContext,
  CoachRecommendation,
  CoachReport,
  CoachSection,
  CoachSectionId,
} from "./types";

const SECTION_ORDER: CoachSectionId[] = [
  "todays_recommendation",
  "recovery_advice",
  "training_focus",
  "biggest_improvement",
  "risk_factors",
  "next_milestone",
];

function rankScore(rec: CoachRecommendation): number {
  return rec.priority * 0.6 + rec.confidence * 0.4;
}

function pickBestForSection(
  recommendations: CoachRecommendation[],
  section: CoachSectionId,
): CoachRecommendation | null {
  const candidates = recommendations.filter((r) => r.section === section);
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => rankScore(b) - rankScore(a))[0];
}

function computeConfidenceScore(
  ctx: CoachDataContext,
  recommendations: CoachRecommendation[],
): number {
  const intelConfidence = ctx.intelligence?.confidence ?? 0;
  const dataFactor = Math.min(100, ctx.recentWorkoutCount * 12 + (ctx.avgReadiness != null ? 20 : 0));
  const recFactor =
    recommendations.length > 0
      ? recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
      : 30;
  return Math.round(intelConfidence * 0.5 + dataFactor * 0.25 + recFactor * 0.25);
}

export function generateCoachReport(ctx: CoachDataContext): CoachReport {
  const rules = getRulesForView(ctx.sportView);
  const allRecommendations: CoachRecommendation[] = [];

  for (const rule of rules) {
    const result = rule.evaluate(ctx);
    if (result) allRecommendations.push(result);
  }

  const sections: CoachSection[] = SECTION_ORDER.map((id) => ({
    id,
    label: COACH_SECTION_META[id].label,
    description: COACH_SECTION_META[id].description,
    recommendation: pickBestForSection(allRecommendations, id),
  }));

  return {
    generatedAt: ctx.collectedAt.toISOString(),
    sportView: ctx.sportView,
    athleteName: ctx.athleteName,
    confidenceScore: computeConfidenceScore(ctx, allRecommendations),
    sections,
    allRecommendations: [...allRecommendations].sort((a, b) => rankScore(b) - rankScore(a)),
  };
}
