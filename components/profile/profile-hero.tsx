"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Settings, Zap } from "lucide-react";

import type { AchievementEngineResult } from "@/features/athlete-achievements/engine/types";
import type { XpPlayerProgress } from "@/features/athlete-achievements/xp";
import { AnimatedPercentCounter } from "@/components/achievements/animations/animated-percent-counter";
import { buttonVariants } from "@/components/ui/button";
import { useLightMotion } from "@/lib/hooks/use-light-motion";
import { ASCENSION, formatRx, RX } from "@/lib/ascension/labels";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  profileImageUrl: string | null;
  sportLabel: string;
  xpProgress: XpPlayerProgress;
  achievementResult: AchievementEngineResult;
  className?: string;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileHero({
  name,
  profileImageUrl,
  sportLabel,
  xpProgress,
  achievementResult,
  className,
}: Props) {
  const lightMotion = useLightMotion();
  const sectionClass = cn(
    "relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-lime/8 via-card to-card p-6 sm:p-8",
    lightMotion && "animate-fade-in",
    className,
  );

  const content = (
    <>
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-lime/60 via-lime/20 to-transparent opacity-80" />
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-lime/30 bg-black/40 sm:h-28 sm:w-28">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <span className="text-2xl font-bold tracking-tight text-gradient-lime sm:text-3xl">
                  {initials(name)}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-lime/40 bg-black ring-2 ring-background">
              <span className="text-xs font-bold tabular-nums text-lime">{xpProgress.currentLevel}</span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {sportLabel}
            </p>
            <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {name}
            </h1>
            <p className="mt-1 text-sm font-medium text-lime">{xpProgress.levelTitle}</p>
          </div>
        </div>

        <Link
          href="/profile/edit"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 border-white/10 bg-white/5")}
        >
          <Settings className="mr-2 h-4 w-4" />
          Edit profile
        </Link>
      </div>

      <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/6 bg-black/20 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-lime" />
            Total {RX}
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
            {xpProgress.totalXp.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatRx(xpProgress.xpToNextLevel)} to Level {xpProgress.currentLevel + 1}
          </p>
        </div>

        <div className="rounded-2xl border border-white/6 bg-black/20 p-4 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Level progress
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-lime">
            {xpProgress.progressPercent}%
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            {lightMotion ? (
              <div
                className="h-full rounded-full bg-lime transition-[width] duration-500 ease-out"
                style={{ width: `${xpProgress.progressPercent}%` }}
              />
            ) : (
              <motion.div
                className="h-full rounded-full bg-lime"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.progressPercent}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-lime/20 bg-lime/5 p-4 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {ASCENSION.completionStat}
          </p>
          <p className="mt-2 text-2xl font-bold">
            <AnimatedPercentCounter value={achievementResult.completionPercent} />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {achievementResult.completed.length} completed ·{" "}
            {achievementResult.available.length + achievementResult.completed.length} unlocked
          </p>
        </div>
      </div>
    </>
  );

  if (lightMotion) {
    return <section className={sectionClass}>{content}</section>;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={sectionClass}
    >
      {content}
    </motion.section>
  );
}
