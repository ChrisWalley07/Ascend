import { buildCrossfitAchievements } from "./shared";
import { beginnerSpecs } from "./tiers/beginner";
import { eliteSpecs } from "./tiers/elite";
import { intermediateSpecs } from "./tiers/intermediate";
import { legendarySpecs } from "./tiers/legendary";
import { rxSpecs } from "./tiers/rx";
import { skillTreeSpecs } from "./tiers/skill-trees";

const tierSpecs = [
  ...beginnerSpecs,
  ...intermediateSpecs,
  ...rxSpecs,
  ...eliteSpecs,
  ...legendarySpecs,
] as const;

if (tierSpecs.length !== 100) {
  throw new Error(`Expected 100 CrossFit tier achievements, got ${tierSpecs.length}`);
}

export const crossfitAchievements = [
  ...buildCrossfitAchievements(tierSpecs),
  ...buildCrossfitAchievements(skillTreeSpecs),
];

export {
  beginnerSpecs,
  intermediateSpecs,
  rxSpecs,
  eliteSpecs,
  legendarySpecs,
  skillTreeSpecs,
};
