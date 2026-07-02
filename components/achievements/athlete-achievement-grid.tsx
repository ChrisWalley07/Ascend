"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import type { AchievementEngineResult } from "@/features/athlete-achievements/engine/types";
import type { AchievementId } from "@/features/athlete-achievements/types/ids";
import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";
import { AchievementGridSummary } from "@/components/achievements/achievement-grid-summary";
import { AchievementTile } from "@/components/achievements/achievement-tile";
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

export function AthleteAchievementGrid({ result, className }: Props) {
  const [selected, setSelected] = useState<ResolvedAchievement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const handlePress = (achievement: ResolvedAchievement) => {
    setSelected(achievement);
    setCelebrate(
      shouldCelebrate(achievement, result.newlyCompleted, result.newlyUnlocked),
    );
    setModalOpen(true);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {result.all.map((achievement, index) => (
          <AchievementTile
            key={achievement.id}
            achievement={achievement}
            index={index}
            onPress={handlePress}
          />
        ))}
      </div>

      <AchievementDetailModal
        achievement={selected}
        open={modalOpen}
        onOpenChange={setModalOpen}
        celebrate={celebrate}
      />
    </div>
  );
}

export { AchievementGridSummary } from "./achievement-grid-summary";
