import type { AchievementId } from "@/features/athlete-achievements/types/ids";
import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";
import type { RequirementProgress } from "@/features/athlete-achievements/types/progress";

export type PrerequisiteItem = {
  id: AchievementId;
  title: string;
  completed: boolean;
};

export function resolvePrerequisites(
  achievement: ResolvedAchievement,
  all: readonly ResolvedAchievement[],
): PrerequisiteItem[] {
  return achievement.prerequisites.map((id) => {
    const prereq = all.find((item) => item.id === id);
    return {
      id,
      title: prereq?.title ?? id,
      completed: prereq?.completed ?? false,
    };
  });
}

export function prerequisitesMet(achievement: ResolvedAchievement, all: readonly ResolvedAchievement[]): boolean {
  if (achievement.prerequisites.length === 0) return true;
  return resolvePrerequisites(achievement, all).every((item) => item.completed);
}

export function getActionableRequirements(
  achievement: ResolvedAchievement,
): RequirementProgress[] {
  return [...achievement.progress.requirements];
}
