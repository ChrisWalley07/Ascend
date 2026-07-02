"use client";

import { useCallback, useRef, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Copy,
  RefreshCw,
  Share2,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { refreshAchievementsAction } from "@/app/actions/achievements";
import type { ResolvedAchievement } from "@/features/athlete-achievements/types/state";
import { AchievementCompleteCelebration } from "@/components/achievements/achievement-complete-celebration";
import { AchievementRequirementsPanel } from "@/components/achievements/achievement-requirements-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
} from "@/components/ui/dialog";
import { DifficultyBadge } from "@/lib/achievements/difficulty-badge";
import { resolveAchievementIcon } from "@/lib/achievements/resolve-achievement-icon";
import {
  resolveTileStatus,
  TILE_STATUS_STYLES,
} from "@/lib/achievements/tile-status";
import { formatRx } from "@/lib/ascension/labels";
import { cn } from "@/lib/utils";

type Props = {
  achievement: ResolvedAchievement | null;
  allAchievements?: readonly ResolvedAchievement[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  celebrate?: boolean;
};

function buildShareText(achievement: ResolvedAchievement): string {
  const progress = achievement.completed ? 100 : achievement.progress.percent;
  const status = achievement.completed ? "completed" : achievement.unlocked ? "in progress" : "locked";
  return `🏆 ${achievement.title} — ${progress}% ${status} on ASCEND\n${achievement.description}\n${formatRx(achievement.xp, { signed: true })} reward`;
}

export function AchievementDetailModal({
  achievement,
  allAchievements = [],
  open,
  onOpenChange,
  celebrate = false,
}: Props) {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");
  const [refreshing, setRefreshing] = useState(false);
  const celebrationTimerRef = useRef<number | null>(null);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (celebrationTimerRef.current) {
        window.clearTimeout(celebrationTimerRef.current);
        celebrationTimerRef.current = null;
      }

      if (nextOpen && achievement && celebrate && (achievement.completed || achievement.unlocked)) {
        setShowCelebration(true);
        celebrationTimerRef.current = window.setTimeout(() => {
          celebrationTimerRef.current = null;
          setShowCelebration(false);
        }, 2400);
      }

      if (!nextOpen) {
        setShowCelebration(false);
      }
      onOpenChange(nextOpen);
    },
    [achievement, celebrate, onOpenChange],
  );

  const handleShare = useCallback(async () => {
    if (!achievement) return;

    const text = buildShareText(achievement);
    const shareData = {
      title: achievement.title,
      text,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareLabel("Shared!");
      } else {
        await navigator.clipboard.writeText(text);
        setShareLabel("Copied!");
      }
    } catch {
      setShareLabel("Share");
      return;
    }

    window.setTimeout(() => setShareLabel("Share"), 2000);
  }, [achievement]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAchievementsAction();
    router.refresh();
    setRefreshing(false);
  }, [router]);

  if (!achievement) return null;

  const status = resolveTileStatus(achievement);
  const styles = TILE_STATUS_STYLES[status];
  // eslint-disable-next-line react-hooks/static-components
  const Icon = resolveAchievementIcon(achievement.icon);
  const progress = achievement.completed ? 100 : achievement.progress.percent;
  const primaryRequirement = achievement.progress.requirements[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="relative max-w-md overflow-hidden p-0">
        <AchievementCompleteCelebration active={showCelebration} title={achievement.title} />

        <div className="relative">
          <div
            className={cn(
              "flex flex-col items-center px-6 pt-8 pb-5 text-center",
              "border-b border-border bg-gradient-to-b from-white/[0.04] to-transparent",
            )}
          >
            <motion.div
              key={achievement.id}
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className={cn(
                "relative mb-4 flex h-24 w-24 items-center justify-center rounded-3xl border-2",
                styles.tile,
                styles.glow,
              )}
            >
              {/* eslint-disable-next-line react-hooks/static-components */}
              <Icon className={cn("h-12 w-12", styles.icon)} />
              {achievement.completed && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white shadow-lg"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </motion.span>
              )}
            </motion.div>

            <h2 className="text-xl font-bold tracking-tight text-foreground">{achievement.title}</h2>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <DifficultyBadge difficulty={achievement.difficulty} />
              <span className="inline-flex items-center gap-1 rounded-full border border-lime/30 bg-lime/10 px-2.5 py-0.5 text-xs font-semibold text-lime">
                <Sparkles className="h-3 w-3" />
                {formatRx(achievement.xp)}
              </span>
            </div>
          </div>

          <DialogBody className="space-y-5 px-6 py-5">
            <section className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Current progress
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">{progress}%</p>
                </div>
                {primaryRequirement && achievement.unlocked && !achievement.completed && (
                  <p className="text-right text-xs text-muted-foreground">
                    {primaryRequirement.current}/{primaryRequirement.target}
                    {primaryRequirement.unit ? ` ${primaryRequirement.unit}` : ""}
                  </p>
                )}
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-black/30">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    status === "locked" && "bg-zinc-600",
                    status === "in_progress" && "bg-yellow-400",
                    status === "completed" && "bg-green-400",
                    status === "elite" && "bg-amber-400",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </section>

            <AchievementRequirementsPanel
              achievement={achievement}
              allAchievements={allAchievements}
            />

            {achievement.unlockedAt && (
              <section className="flex items-center gap-2 rounded-lg border border-border bg-muted/15 px-3 py-2.5 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Unlocked</span>
                <span className="ml-auto font-medium">
                  {format(new Date(achievement.unlockedAt), "MMM d, yyyy")}
                </span>
              </section>
            )}

            {achievement.completed && achievement.completedAt && (
              <section className="flex items-center gap-2 rounded-lg border border-green-500/25 bg-green-500/8 px-3 py-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-muted-foreground">Completed</span>
                <span className="ml-auto font-medium text-green-300">
                  {format(new Date(achievement.completedAt), "MMM d, yyyy")}
                </span>
              </section>
            )}
          </DialogBody>

          <div className="flex flex-col gap-2 border-t border-border px-6 py-4">
            {!achievement.completed && (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={refreshing}
                onClick={handleRefresh}
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                {refreshing ? "Updating…" : "Update progress"}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleShare}
            >
              {shareLabel === "Share" ? (
                <Share2 className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {shareLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
