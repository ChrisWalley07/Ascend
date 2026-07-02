import type { SportIntelligencePlugin } from "../types";
import { crossfitPlugin } from "./crossfit-plugin";
import { hyroxPlugin } from "./hyrox-plugin";

const PLUGIN_REGISTRY: SportIntelligencePlugin[] = [crossfitPlugin, hyroxPlugin];

export function getSportPlugin(sportView: "crossfit" | "hyrox"): SportIntelligencePlugin | undefined {
  return PLUGIN_REGISTRY.find((plugin) => plugin.sportView === sportView);
}

export function registerSportPlugin(plugin: SportIntelligencePlugin): void {
  const index = PLUGIN_REGISTRY.findIndex((p) => p.sportView === plugin.sportView);
  if (index >= 0) {
    PLUGIN_REGISTRY[index] = plugin;
    return;
  }
  PLUGIN_REGISTRY.push(plugin);
}

export function listSportPlugins(): SportIntelligencePlugin[] {
  return [...PLUGIN_REGISTRY];
}
