import { achievementId, defineAchievement } from "../../types";
import type { AchievementDifficulty } from "../../types/difficulty";
import type { AchievementId } from "../../types/ids";
import type { AchievementRarity } from "../../types/rarity";
import type { AchievementRequirement } from "../../types/requirements";
import type { AchievementMetricKey } from "../../types/metrics";

/** UI label "RX" maps to the `advanced` difficulty tier. */
export type CrossfitTier = AchievementDifficulty;

export type CrossfitAchievementSpec = {
  slug: string;
  tier: CrossfitTier;
  title: string;
  description: string;
  icon: string;
  xp: number;
  rarity: AchievementRarity;
  tags?: string[];
  prerequisiteSlugs?: string[];
  requirement: AchievementRequirement;
};

const TIER_TAG: Record<CrossfitTier, string> = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "rx",
  elite: "elite",
  legendary: "legendary",
};

export function countReq(
  id: string,
  label: string,
  metric: AchievementMetricKey,
  target: number,
): AchievementRequirement {
  return { id, label, kind: "count", metric, target };
}

export function gteReq(
  id: string,
  label: string,
  metric: AchievementMetricKey,
  target: number,
): AchievementRequirement {
  return { id, label, kind: "numeric", metric, operator: "gte", target };
}

export function lteReq(
  id: string,
  label: string,
  metric: AchievementMetricKey,
  target: number,
): AchievementRequirement {
  return { id, label, kind: "numeric", metric, operator: "lte", target };
}

export function streakReq(id: string, label: string, days: number): AchievementRequirement {
  return { id, label, kind: "streak", metric: "streak_days", targetDays: days };
}

export function boolReq(
  id: string,
  label: string,
  metric: AchievementMetricKey,
): AchievementRequirement {
  return { id, label, kind: "boolean", metric, expected: true };
}

export function buildCrossfitAchievements(specs: readonly CrossfitAchievementSpec[]) {
  const idBySlug = new Map<string, AchievementId>(
    specs.map((spec) => [spec.slug, achievementId(`crossfit.${spec.slug}`)]),
  );

  return specs.map((spec) =>
    defineAchievement({
      id: idBySlug.get(spec.slug)!,
      title: spec.title,
      description: spec.description,
      category: "crossfit",
      difficulty: spec.tier,
      icon: { name: spec.icon, library: "lucide" },
      xp: spec.xp,
      prerequisites: (spec.prerequisiteSlugs ?? []).map((slug) => idBySlug.get(slug)!),
      rarity: spec.rarity,
      tags: [TIER_TAG[spec.tier], ...(spec.tags ?? [])],
      requirements: spec.requirement,
    }),
  );
}
