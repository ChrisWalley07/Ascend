/**
 * Icon descriptor — resolved by the presentation layer (web, React Native, etc.).
 * Achievements never import UI components directly.
 */
export type AchievementIconLibrary = "lucide" | "custom" | "emoji" | "ionicons" | "material";

export type AchievementIcon = {
  /** Stable key consumed by the icon resolver (e.g. "flame", "trophy"). */
  name: string;
  library?: AchievementIconLibrary;
  /** Optional fallback when the primary icon is unavailable on a platform. */
  fallback?: string;
};
