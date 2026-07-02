"use client";

import type { AchievementEngineResult } from "@/features/athlete-achievements/engine/types";
import type { AchievementCategory } from "@/features/athlete-achievements/types/category";
import { getSkillTreesForCategory } from "@/features/athlete-achievements/skill-trees";
import { SkillTreeView } from "@/components/achievements/skill-tree/skill-tree-view";
import { cn } from "@/lib/utils";

type Props = {
  result: AchievementEngineResult;
  categories?: readonly AchievementCategory[];
  className?: string;
};

export function AchievementSkillTrees({
  result,
  categories = ["crossfit"],
  className,
}: Props) {
  const trees = categories.flatMap((category) => getSkillTreesForCategory(category));

  if (trees.length === 0) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {trees.map((tree) => (
        <SkillTreeView key={tree.id} tree={tree} result={result} />
      ))}
    </div>
  );
}
