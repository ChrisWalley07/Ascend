import type {
  AchievementCategory,
  AchievementDefinition,
  AchievementId,
  AchievementRegistry,
  AchievementRegistryQuery,
  CatalogValidationResult,
} from "../types";
import { validateAchievementCatalog } from "../utils/validate-catalog";

function matchesQuery(
  definition: AchievementDefinition,
  query?: AchievementRegistryQuery,
): boolean {
  if (!query) return true;

  if (query.category && definition.category !== query.category) {
    return false;
  }

  if (query.ids && !query.ids.includes(definition.id)) {
    return false;
  }

  if (!query.includeHidden && definition.hidden) {
    return false;
  }

  if (query.tags && query.tags.length > 0) {
    const defTags = definition.tags ?? [];
    if (!query.tags.some((tag) => defTags.includes(tag))) {
      return false;
    }
  }

  return true;
}

export function createAchievementRegistry(
  definitions: readonly AchievementDefinition[],
  version = "1.0.0",
): AchievementRegistry {
  const byId = new Map<AchievementId, AchievementDefinition>(
    definitions.map((definition) => [definition.id, definition]),
  );

  const byCategory = definitions.reduce<Record<AchievementCategory, AchievementDefinition[]>>(
    (acc, definition) => {
      acc[definition.category].push(definition);
      return acc;
    },
    {
      crossfit: [],
      hyrox: [],
      running: [],
      weightlifting: [],
    },
  );

  const dependents = new Map<AchievementId, AchievementDefinition[]>();
  for (const definition of definitions) {
    for (const prereqId of definition.prerequisites) {
      const list = dependents.get(prereqId) ?? [];
      list.push(definition);
      dependents.set(prereqId, list);
    }
  }

  return {
    version,
    size: definitions.length,

    getAll(query?: AchievementRegistryQuery) {
      return definitions.filter((definition) => matchesQuery(definition, query));
    },

    getById(id: AchievementId) {
      return byId.get(id);
    },

    getByCategory(category: AchievementCategory) {
      return byCategory[category];
    },

    getPrerequisites(id: AchievementId) {
      const definition = byId.get(id);
      if (!definition) return [];
      return definition.prerequisites
        .map((prereqId) => byId.get(prereqId))
        .filter((d): d is AchievementDefinition => d != null);
    },

    getDependents(id: AchievementId) {
      return dependents.get(id) ?? [];
    },

    validate(): CatalogValidationResult {
      return validateAchievementCatalog(definitions);
    },

    has(id: AchievementId) {
      return byId.has(id);
    },
  };
}
