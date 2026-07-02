import { buildMasterCatalog, CATALOG_VERSION } from "../catalog";
import { createAchievementRegistry } from "./achievement-registry";

let cachedRegistry: ReturnType<typeof createAchievementRegistry> | null = null;

/**
 * Singleton registry backed by the compiled TypeScript catalog.
 * Swap this factory when loading from JSON or remote config.
 */
export function getAchievementRegistry() {
  if (!cachedRegistry) {
    const catalog = buildMasterCatalog();
    cachedRegistry = createAchievementRegistry(catalog.all, CATALOG_VERSION);
  }
  return cachedRegistry;
}

export function resetAchievementRegistry(): void {
  cachedRegistry = null;
}

export { createAchievementRegistry } from "./achievement-registry";
