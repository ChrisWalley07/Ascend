import type { AchievementDefinition } from "../types/definition";
import type { AchievementEvaluationContext } from "../types/context";
import type { AchievementEvaluatorOptions } from "../types/context";
import type { AchievementId } from "../types/ids";
import type { ResolvedAchievement } from "../types/state";
import { resolveAchievement } from "../types/state";
import { createCompletedProgress } from "../types/progress";

import {
  buildAchievementProgress,
  buildLockedProgress,
} from "./evaluate-requirement";
import { arePrerequisitesMet, resolveCompletionSet, resolveUnlockSet } from "./unlock";
import { resolveXpAward } from "./xp";
import type { AchievementEngineInput, AchievementEngineOptions, AchievementEngineResult } from "./types";

function filterDefinitions(
  definitions: readonly AchievementDefinition[],
  context: AchievementEvaluationContext,
  options?: AchievementEvaluatorOptions,
): AchievementDefinition[] {
  return definitions.filter((definition) => {
    if (options?.categories && !options.categories.includes(definition.category)) {
      return false;
    }

    if (
      !options?.categories &&
      context.activeCategories.length > 0 &&
      !context.activeCategories.includes(definition.category)
    ) {
      return false;
    }

    if (!options?.includeHidden && definition.hidden) {
      return false;
    }

    return true;
  });
}

function buildSeedCompleted(
  context: AchievementEvaluationContext,
  options?: AchievementEngineOptions,
): Set<AchievementId> {
  const seed = new Set(context.completedAchievementIds);

  if (options?.priorCompleted) {
    for (const id of options.priorCompleted.keys()) {
      seed.add(id);
    }
  }

  return seed;
}

function buildResolvedAchievement(
  definition: AchievementDefinition,
  context: AchievementEvaluationContext,
  completedIds: ReadonlySet<AchievementId>,
  unlockedIds: ReadonlySet<AchievementId>,
  options?: AchievementEngineOptions,
): ResolvedAchievement {
  const isCompleted = completedIds.has(definition.id);
  const isUnlocked = unlockedIds.has(definition.id);
  const prior = options?.priorCompleted?.get(definition.id);
  const evaluatedAt = context.asOf.toISOString();

  if (isCompleted) {
    const progress = createCompletedProgress(
      buildAchievementProgress(definition.requirements, context.metrics).requirements,
    );
    const xp = resolveXpAward(definition, prior);

    return resolveAchievement(definition, {
      achievementId: definition.id,
      completed: true,
      completedAt: prior?.completedAt ?? evaluatedAt,
      unlockedAt: prior?.unlockedAt ?? prior?.completedAt ?? evaluatedAt,
      progress,
      unlocked: true,
      unlockStatus: "completed",
      xpAwarded: xp.awardedXp,
    });
  }

  if (!isUnlocked) {
    return resolveAchievement(definition, {
      achievementId: definition.id,
      completed: false,
      completedAt: null,
      unlockedAt: null,
      progress: buildLockedProgress(definition.requirements),
      unlocked: false,
      unlockStatus: "locked",
      xpAwarded: 0,
    });
  }

  const progress = buildAchievementProgress(definition.requirements, context.metrics);

  return resolveAchievement(definition, {
    achievementId: definition.id,
    completed: false,
    completedAt: null,
    unlockedAt: prior?.unlockedAt ?? evaluatedAt,
    progress,
    unlocked: true,
    unlockStatus: "unlocked",
    xpAwarded: 0,
  });
}

function pickNextAchievements(
  available: readonly ResolvedAchievement[],
  limit: number,
): ResolvedAchievement[] {
  return [...available]
    .sort((a, b) => {
      if (b.progress.percent !== a.progress.percent) {
        return b.progress.percent - a.progress.percent;
      }
      return b.xp - a.xp;
    })
    .slice(0, limit);
}

/**
 * Pure achievement engine — evaluates catalog definitions against athlete metrics.
 */
export function runAchievementEngine(input: AchievementEngineInput): AchievementEngineResult {
  const { definitions, context, options } = input;
  const scopedDefinitions = filterDefinitions(definitions, context, options);
  const seedCompleted = buildSeedCompleted(context, options);

  const completedIds = resolveCompletionSet(
    scopedDefinitions,
    context.metrics,
    seedCompleted,
  );
  const unlockedIds = resolveUnlockSet(scopedDefinitions, completedIds);

  const initialUnlocked = resolveUnlockSet(scopedDefinitions, seedCompleted);

  const all = scopedDefinitions.map((definition) =>
    buildResolvedAchievement(definition, context, completedIds, unlockedIds, options),
  );

  const completed = all.filter((achievement) => achievement.completed);
  const available = all.filter(
    (achievement) => achievement.unlocked && !achievement.completed,
  );
  const locked = all.filter((achievement) => !achievement.unlocked);

  const earnedXp = completed.reduce((total, achievement) => total + achievement.xpAwarded, 0);
  const completionPercent =
    scopedDefinitions.length > 0
      ? Math.round((completed.length / scopedDefinitions.length) * 100)
      : 0;

  const newlyCompleted = [...completedIds].filter((id) => !seedCompleted.has(id));
  const newlyUnlocked = [...unlockedIds].filter((id) => !initialUnlocked.has(id));

  const newlyEarnedXp = newlyCompleted.reduce((total, id) => {
    const definition = scopedDefinitions.find((item) => item.id === id);
    if (!definition) return total;
    return total + resolveXpAward(definition, options?.priorCompleted?.get(id)).awardedXp;
  }, 0);

  const nextLimit = options?.nextAchievementsLimit ?? 5;

  return {
    evaluatedAt: context.asOf.toISOString(),
    userId: context.userId,
    completionPercent,
    earnedXp,
    locked,
    available,
    completed,
    nextAchievements: pickNextAchievements(available, nextLimit),
    newlyCompleted,
    newlyUnlocked,
    newlyEarnedXp,
    all,
  };
}

/**
 * Convenience wrapper — loads definitions from a registry-like source.
 */
export function runAchievementEngineForDefinitions(
  definitions: readonly AchievementDefinition[],
  context: AchievementEvaluationContext,
  options?: AchievementEngineOptions,
): AchievementEngineResult {
  return runAchievementEngine({ definitions, context, options });
}

export { arePrerequisitesMet } from "./unlock";
