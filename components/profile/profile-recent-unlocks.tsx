"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";
import { DifficultyBadge } from "@/lib/achievements/difficulty-badge";
import { resolveAchievementIcon } from "@/lib/achievements/resolve-achievement-icon";
import { ASCENSION, formatRx } from "@/lib/ascension/labels";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  unlocks: ResolvedAchievement[];
  className?: string;
};

export function ProfileRecentUnlocks({ unlocks, className }: Props) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {ASCENSION.recentUnlocksEyebrow}
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground">{ASCENSION.recentUnlocksHeading}</h2>
        </div>
        <Link href="/achievements" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-lime")}>
          {ASCENSION.viewAllCta}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      {unlocks.length === 0 ? (
        <div className="surface rounded-2xl p-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{ASCENSION.emptyUnlocks}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {unlocks.map((achievement, index) => {
            const Icon = resolveAchievementIcon(achievement.icon);

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="surface-raised flex items-center gap-4 p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime/10 ring-1 ring-lime/25">
                  <Icon className="h-5 w-5 text-lime" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{achievement.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={achievement.difficulty} />
                    <span className="text-xs font-semibold tabular-nums text-lime">{formatRx(achievement.xp, { signed: true })}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
