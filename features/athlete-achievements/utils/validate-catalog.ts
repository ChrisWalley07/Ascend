import type {
  AchievementDefinition,
  AchievementId,
  CatalogValidationIssue,
  CatalogValidationResult,
} from "../types";
import { isAchievementMetricKey } from "../types";
import { flattenRequirements } from "./requirements";

function detectCircularPrerequisites(
  definitions: readonly AchievementDefinition[],
): CatalogValidationIssue[] {
  const byId = new Map(definitions.map((d) => [d.id, d]));
  const issues: CatalogValidationIssue[] = [];
  const visiting = new Set<AchievementId>();
  const visited = new Set<AchievementId>();

  function visit(id: AchievementId, path: AchievementId[]): void {
    if (visiting.has(id)) {
      issues.push({
        code: "circular_prerequisite",
        achievementId: id,
        message: `Circular prerequisite chain: ${[...path, id].join(" → ")}`,
      });
      return;
    }
    if (visited.has(id)) return;

    visiting.add(id);
    const def = byId.get(id);
    if (def) {
      for (const prereq of def.prerequisites) {
        visit(prereq, [...path, id]);
      }
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const def of definitions) {
    visit(def.id, []);
  }

  return issues;
}

export function validateAchievementCatalog(
  definitions: readonly AchievementDefinition[],
): CatalogValidationResult {
  const issues: CatalogValidationIssue[] = [];
  const seenIds = new Set<AchievementId>();

  for (const def of definitions) {
    if (seenIds.has(def.id)) {
      issues.push({
        code: "duplicate_id",
        achievementId: def.id,
        message: `Duplicate achievement id: ${def.id}`,
      });
    }
    seenIds.add(def.id);

    for (const prereqId of def.prerequisites) {
      if (!definitions.some((d) => d.id === prereqId)) {
        issues.push({
          code: "missing_prerequisite",
          achievementId: def.id,
          message: `Missing prerequisite "${prereqId}" for "${def.id}"`,
        });
      }
    }

    for (const req of flattenRequirements(def.requirements)) {
      if (req.kind === "compound") continue;
      if (!isAchievementMetricKey(req.metric)) {
        issues.push({
          code: "invalid_metric",
          achievementId: def.id,
          message: `Unknown metric "${req.metric}" in requirement "${req.id}"`,
        });
      }
    }
  }

  issues.push(...detectCircularPrerequisites(definitions));

  return {
    valid: issues.length === 0,
    issues,
  };
}
