import type { SportDepartment } from "@prisma/client";

export type SportSlug = "crossfit" | "hyrox" | "hybrid";
export type SportView = "crossfit" | "hyrox";

export const SPORT_VIEW_COOKIE = "ascend-sport-view";

export type SportContext = {
  athleteType: SportDepartment;
  activeView: SportView;
  canSwitchViews: boolean;
};

export function toSportSlug(department: SportDepartment): SportSlug {
  return department.toLowerCase() as SportSlug;
}

export function toSportDepartment(slug: SportSlug): SportDepartment {
  return slug.toUpperCase() as SportDepartment;
}

export function toSportView(department: SportDepartment): SportView | null {
  if (department === "CROSSFIT") return "crossfit";
  if (department === "HYROX") return "hyrox";
  return null;
}

export function isSportView(value: string): value is SportView {
  return value === "crossfit" || value === "hyrox";
}

export function resolveActiveView(
  athleteType: SportDepartment,
  activeSportView: SportDepartment | null | undefined,
): SportView {
  if (athleteType === "CROSSFIT") return "crossfit";
  if (athleteType === "HYROX") return "hyrox";
  if (activeSportView === "HYROX") return "hyrox";
  return "crossfit";
}

export function canSwitchViews(athleteType: SportDepartment): boolean {
  return athleteType === "HYBRID";
}

export function buildSportContext(
  athleteType: SportDepartment,
  activeSportView: SportDepartment | null | undefined,
): SportContext {
  return {
    athleteType,
    activeView: resolveActiveView(athleteType, activeSportView),
    canSwitchViews: canSwitchViews(athleteType),
  };
}
