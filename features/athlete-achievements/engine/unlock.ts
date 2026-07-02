import type { AchievementDefinition } from "../types/definition";
import type { AchievementId } from "../types/ids";
import { isRequirementMet } from "./evaluate-requirement";
import type { AchievementMetricSnapshot } from "../types";

export function arePrerequisitesMet(
  prerequisites: readonly AchievementId[],
  completedIds: ReadonlySet<AchievementId>,
): boolean {
  return prerequisites.every((id) => completedIds.has(id));
}

/**
 * Resolves the full completion set, including chained unlock-and-complete passes.
 */
export function resolveCompletionSet(
  definitions: readonly AchievementDefinition[],
  metrics: AchievementMetricSnapshot,
  seedCompleted: ReadonlySet<AchievementId>,
): Set<AchievementId> {
  const completed = new Set(seedCompleted);
  let changed = true;

  while (changed) {
    changed = false;

    for (const definition of definitions) {
      if (completed.has(definition.id)) continue;
      if (!arePrerequisitesMet(definition.prerequisites, completed)) continue;
      if (!isRequirementMet(definition.requirements, metrics)) continue;

      completed.add(definition.id);
      changed = true;
    }
  }

  return completed;
}

export function resolveUnlockSet(
  definitions: readonly AchievementDefinition[],
  completedIds: ReadonlySet<AchievementId>,
): Set<AchievementId> {
  const unlocked = new Set<AchievementId>();

  for (const definition of definitions) {
    if (completedIds.has(definition.id)) {
      unlocked.add(definition.id);
      continue;
    }
    if (arePrerequisitesMet(definition.prerequisites, completedIds)) {
      unlocked.add(definition.id);
    }
  }

  return unlocked;
}
