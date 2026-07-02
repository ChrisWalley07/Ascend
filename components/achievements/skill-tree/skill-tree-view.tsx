"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

import type { AchievementEngineResult } from "@/features/athlete-achievements/engine/types";
import type { SkillTreeDefinition } from "@/features/athlete-achievements/skill-trees";
import { skillTreeAchievementId } from "@/features/athlete-achievements/skill-trees";
import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";
import { SkillTreeConnector } from "@/components/achievements/skill-tree/skill-tree-connector";
import { SkillTreeNode } from "@/components/achievements/skill-tree/skill-tree-node";
import { useLightMotion } from "@/lib/hooks/use-light-motion";
import { cn } from "@/lib/utils";

const AchievementDetailModal = dynamic(
  () =>
    import("@/components/achievements/achievement-detail-modal").then(
      (mod) => mod.AchievementDetailModal,
    ),
  { ssr: false },
);

type Props = {
  tree: SkillTreeDefinition;
  result: AchievementEngineResult;
  className?: string;
};

function resolveConnectorState(
  from: ResolvedAchievement,
  to: ResolvedAchievement,
): "locked" | "active" | "completed" {
  if (from.completed) return "completed";
  if (from.unlocked && (to.unlocked || from.progress.percent > 0)) return "active";
  return "locked";
}

export function SkillTreeView({ tree, result, className }: Props) {
  const lightMotion = useLightMotion();
  const [selected, setSelected] = useState<ResolvedAchievement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const nodes = useMemo(() => {
    return tree.nodeSlugs.map((slug) => {
      const id = skillTreeAchievementId(slug);
      return result.all.find((item) => item.id === id) ?? null;
    });
  }, [tree.nodeSlugs, result.all]);

  const resolvedNodes = nodes.filter((node): node is ResolvedAchievement => node != null);
  const completedCount = resolvedNodes.filter((node) => node.completed).length;
  const nextTargetIndex = resolvedNodes.findIndex((node) => node.unlocked && !node.completed);

  const handlePress = (achievement: ResolvedAchievement) => {
    setSelected(achievement);
    setModalOpen(true);
  };

  if (resolvedNodes.length === 0) return null;

  const panelClass = cn(
    "relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-card via-card to-black/40 p-6 sm:p-8",
    lightMotion && "animate-fade-in",
    className,
  );

  const panelContent = (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(182,255,59,0.06),transparent_55%)]" />

      <div className="relative mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lime/80">
            Ascension
          </p>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground">{tree.title}</h3>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">{tree.description}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/25 px-4 py-2.5 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Path progress
          </p>
          <p className="text-lg font-bold tabular-nums text-lime">
            {completedCount}/{resolvedNodes.length}
          </p>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        {resolvedNodes.map((achievement, index) => (
          <div key={achievement.id} className="flex w-full flex-col items-center">
            <SkillTreeNode
              achievement={achievement}
              index={index}
              isNextTarget={index === nextTargetIndex}
              onPress={handlePress}
            />
            {index < resolvedNodes.length - 1 && (
              <SkillTreeConnector
                state={resolveConnectorState(achievement, resolvedNodes[index + 1]!)}
              />
            )}
          </div>
        ))}
      </div>

      <AchievementDetailModal
        achievement={selected}
        open={modalOpen}
        onOpenChange={setModalOpen}
        celebrate={false}
      />
    </>
  );

  if (lightMotion) {
    return <div className={panelClass}>{panelContent}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={panelClass}
    >
      {panelContent}
    </motion.div>
  );
}
