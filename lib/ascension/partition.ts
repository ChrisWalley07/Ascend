import type { AchievementEngineResult } from "@/features/athlete-achievements/engine/types";
import { ACHIEVEMENT_DIFFICULTY_META } from "@/features/athlete-achievements/types/difficulty";
import { SKILL_TREES } from "@/features/athlete-achievements/skill-trees";
import { skillTreeAchievementId } from "@/features/athlete-achievements/skill-trees";
import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";

/** Chain order for path achievements so the grid reads easy → hard. */
const PATH_ORDER = new Map(
  SKILL_TREES.flatMap((tree) =>
    tree.nodeSlugs.map((slug, index) => [skillTreeAchievementId(slug), index] as const),
  ),
);

function pathSortKey(achievement: ResolvedAchievement): number {
  return PATH_ORDER.get(achievement.id) ?? Number.MAX_SAFE_INTEGER;
}

function difficultySortKey(achievement: ResolvedAchievement): number {
  return ACHIEVEMENT_DIFFICULTY_META[achievement.difficulty].sortOrder;
}

/** Grid order: path chains first (easy→hard), then everything else by difficulty. */
export function sortForAscensionGrid(result: AchievementEngineResult): ResolvedAchievement[] {
  return [...result.all].sort((a, b) => {
    const pathA = PATH_ORDER.has(a.id);
    const pathB = PATH_ORDER.has(b.id);
    if (pathA && pathB) return pathSortKey(a) - pathSortKey(b);
    if (pathA !== pathB) return pathA ? -1 : 1;
    const diff = difficultySortKey(a) - difficultySortKey(b);
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title);
  });
}

export function getAscensionNextUp(
  result: AchievementEngineResult,
  limit = 3,
): ResolvedAchievement[] {
  return result.nextAchievements.slice(0, limit);
}
