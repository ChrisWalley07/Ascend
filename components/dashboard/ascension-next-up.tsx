"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ArrowRight, Lock } from "lucide-react";

import type { AchievementEngineResult } from "@/features/athlete-achievements/engine/types";
import type { AchievementId } from "@/features/athlete-achievements/types/ids";
import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";
import { AchievementTile } from "@/components/achievements/achievement-tile";
import { resolveAchievementIcon } from "@/lib/achievements/resolve-achievement-icon";
import { ASCENSION, formatRx } from "@/lib/ascension/labels";
import { getAscensionNextUp } from "@/lib/ascension/partition";
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
  variant?: "compact" | "full";
  className?: string;
};

export function AscensionNextUp({ result, variant = "full", className }: Props) {
  const limit = variant === "compact" ? 2 : 3;
  const nextUp = getAscensionNextUp(result, limit);
  const nextIds = new Set<AchievementId>(nextUp.map((a) => a.id));
  const [selected, setSelected] = useState<ResolvedAchievement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openDetail = (achievement: ResolvedAchievement) => {
    setSelected(achievement);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!selected || !modalOpen) return;
    const fresh = result.all.find((item) => item.id === selected.id);
    if (fresh) setSelected(fresh);
  }, [result, selected, modalOpen]);

  if (nextUp.length === 0) return null;

  if (variant === "compact") {
    return (
      <>
        <section className={cn("rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5", className)}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {ASCENSION.dashboardHeading}
            </p>
            <Link
              href="/achievements"
              className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground hover:text-lime transition-colors"
            >
              {ASCENSION.name}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {nextUp.map((achievement) => {
              const Icon = resolveAchievementIcon(achievement.icon);
              const locked = !achievement.unlocked;
              const progress = achievement.completed ? 100 : achievement.progress.percent;

              return (
                <button
                  key={achievement.id}
                  type="button"
                  onClick={() => openDetail(achievement)}
                  className="group/row flex w-full items-center gap-2.5 rounded-lg border border-white/6 bg-black/20 px-2.5 py-2 text-left transition-colors hover:border-lime/25 hover:bg-lime/5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    {locked ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 text-lime" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{achievement.title}</p>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/30">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          achievement.completed ? "bg-lime" : locked ? "bg-zinc-700" : "bg-yellow-400",
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold tabular-nums text-lime">
                    {formatRx(achievement.xp, { signed: true })}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <AchievementDetailModal
          achievement={selected}
          allAchievements={result.all}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </>
    );
  }

  return (
    <>
      <section
        className={cn(
          "rounded-2xl border border-lime/15 bg-gradient-to-br from-lime/5 to-transparent p-5",
          className,
        )}
      >
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-lime/80">
              {ASCENSION.dashboardEyebrow}
            </p>
            <h2 className="mt-0.5 text-base font-bold text-foreground">{ASCENSION.dashboardHeading}</h2>
          </div>
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-lime transition-colors shrink-0"
          >
            {ASCENSION.viewAllCta}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {nextUp.map((achievement, index) => (
            <AchievementTile
              key={achievement.id}
              achievement={achievement}
              allAchievements={result.all}
              index={index}
              isNextTarget={nextIds.has(achievement.id)}
              onPress={openDetail}
            />
          ))}
        </div>
      </section>

      <AchievementDetailModal
        achievement={selected}
        allAchievements={result.all}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
