import type { AchievementCategory } from "../types/category";
import { achievementId } from "../types/ids";

export type SkillTreeDefinition = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  /** Ordered top → bottom. Each slug maps to `crossfit.{slug}`. */
  nodeSlugs: readonly string[];
};

export const GYMNASTICS_PULL_SKILL_TREE: SkillTreeDefinition = {
  id: "gymnastics-pull",
  title: "Pull Mastery Path",
  description:
    "Climb from your first strict pull-up to muscle-ups and high-volume unbroken sets — each tier unlocks the next.",
  category: "crossfit",
  nodeSlugs: [
    "strict-pull-up",
    "chest-to-bar",
    "bar-muscle-up",
    "ring-muscle-up",
    "thirty-unbroken-pullups",
    "fifty-unbroken-pullups",
  ],
};

export const SKILL_TREES: readonly SkillTreeDefinition[] = [GYMNASTICS_PULL_SKILL_TREE];

export function skillTreeAchievementId(slug: string) {
  return achievementId(`crossfit.${slug}`);
}

export function getSkillTreesForCategory(category: AchievementCategory) {
  return SKILL_TREES.filter((tree) => tree.category === category);
}

/** All mastery paths — shown regardless of active sport view when paths exist. */
export function getAllSkillTrees() {
  return SKILL_TREES;
}
