export const ACHIEVEMENT_RARITIES = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
] as const;

export type AchievementRarity = (typeof ACHIEVEMENT_RARITIES)[number];

export type AchievementRarityMeta = {
  key: AchievementRarity;
  label: string;
  sortOrder: number;
};

export const ACHIEVEMENT_RARITY_META: Record<AchievementRarity, AchievementRarityMeta> = {
  common: { key: "common", label: "Common", sortOrder: 1 },
  uncommon: { key: "uncommon", label: "Uncommon", sortOrder: 2 },
  rare: { key: "rare", label: "Rare", sortOrder: 3 },
  epic: { key: "epic", label: "Epic", sortOrder: 4 },
  legendary: { key: "legendary", label: "Legendary", sortOrder: 5 },
};

export function isAchievementRarity(value: string): value is AchievementRarity {
  return (ACHIEVEMENT_RARITIES as readonly string[]).includes(value);
}
