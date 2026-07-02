"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import type { AchievementEngineResult } from "@/features/athlete-achievements/engine/types";
import type { AchievementId } from "@/features/athlete-achievements/types/ids";
import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";
import { AchievementTile } from "@/components/achievements/achievement-tile";
import {
  ASCENSION,
  ASCENSION_GRID_FILTERS,
  type AscensionGridFilter,
} from "@/lib/ascension/labels";
import { getAscensionNextUp, sortForAscensionGrid } from "@/lib/ascension/partition";
import { cn } from "@/lib/utils";

const AchievementDetailModal = dynamic(
  () =>
    import("@/components/achievements/achievement-detail-modal").then(
      (mod) => mod.AchievementDetailModal,
    ),
  { ssr: false },
);

type Props = {
  result: AchievementEngineResult;
  className?: string;
};

function shouldCelebrate(
  achievement: ResolvedAchievement,
  newlyCompleted: readonly AchievementId[],
  newlyUnlocked: readonly AchievementId[],
): boolean {
  if (newlyCompleted.includes(achievement.id)) return true;
  if (achievement.completed) return false;
  return newlyUnlocked.includes(achievement.id);
}

function filterAchievements(
  achievements: ResolvedAchievement[],
  filter: AscensionGridFilter,
  nextIds: Set<AchievementId>,
): ResolvedAchievement[] {
  switch (filter) {
    case "next":
      return achievements.filter((a) => nextIds.has(a.id));
    case "active":
      return achievements.filter((a) => a.unlocked && !a.completed);
    case "locked":
      return achievements.filter((a) => !a.unlocked);
    case "completed":
      return achievements.filter((a) => a.completed);
    default:
      return achievements;
  }
}

export function AscensionGrid({ result, className }: Props) {
  const [filter, setFilter] = useState<AscensionGridFilter>("all");
  const [selected, setSelected] = useState<ResolvedAchievement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const sorted = useMemo(() => sortForAscensionGrid(result), [result]);
  const nextUp = useMemo(() => getAscensionNextUp(result, 8), [result]);
  const nextIds = useMemo(() => new Set(nextUp.map((a) => a.id)), [nextUp]);
  const visible = useMemo(
    () => filterAchievements(sorted, filter, nextIds),
    [sorted, filter, nextIds],
  );

  const handlePress = (achievement: ResolvedAchievement) => {
    setSelected(achievement);
    setCelebrate(
      shouldCelebrate(achievement, result.newlyCompleted, result.newlyUnlocked),
    );
    setModalOpen(true);
  };

  useEffect(() => {
    if (!selected || !modalOpen) return;
    const fresh = result.all.find((item) => item.id === selected.id);
    if (fresh) setSelected(fresh);
  }, [result, selected, modalOpen]);

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-wrap gap-2">
        {ASCENSION_GRID_FILTERS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              filter === tab.id
                ? "bg-lime text-background"
                : "bg-white/6 text-muted-foreground hover:bg-white/10 hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="surface rounded-2xl p-8 text-center text-sm text-muted-foreground">
          {ASCENSION.emptyGrid}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((achievement, index) => (
            <AchievementTile
              key={achievement.id}
              achievement={achievement}
              allAchievements={result.all}
              index={index}
              isNextTarget={nextIds.has(achievement.id)}
              onPress={handlePress}
            />
          ))}
        </div>
      )}

      <AchievementDetailModal
        achievement={selected}
        allAchievements={result.all}
        open={modalOpen}
        onOpenChange={setModalOpen}
        celebrate={celebrate}
      />
    </div>
  );
}
