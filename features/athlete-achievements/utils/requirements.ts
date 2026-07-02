import type {
  AchievementRequirement,
  RequirementKind,
} from "../types";

export function isRequirementKind<K extends RequirementKind>(
  requirement: AchievementRequirement,
  kind: K,
): requirement is Extract<AchievementRequirement, { kind: K }> {
  return requirement.kind === kind;
}

export function flattenRequirements(
  requirement: AchievementRequirement,
): AchievementRequirement[] {
  if (requirement.kind !== "compound") {
    return [requirement];
  }

  return requirement.requirements.flatMap(flattenRequirements);
}
