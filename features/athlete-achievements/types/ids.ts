/**
 * Branded identifier for achievement definitions.
 * Prevents accidental mixing with generic strings across the system.
 */
export type AchievementId = string & { readonly __brand: "AchievementId" };

export function achievementId(id: string): AchievementId {
  return id as AchievementId;
}

export function isAchievementId(value: string): value is AchievementId {
  return value.length > 0;
}
