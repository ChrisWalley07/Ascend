import type { SportDepartment } from "@prisma/client";
import { Dumbbell, Flame, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { SportView } from "@/lib/sports/types";

export type SportFocusArea = {
  id: string;
  label: string;
  scoreKey: string;
};

export type SportConfig = {
  id: SportDepartment;
  label: string;
  shortLabel: string;
  description: string;
  tagline: string;
  icon: LucideIcon;
  accentClass: string;
  focusAreas: SportFocusArea[];
  highlights: string[];
  /** Dashboard views this athlete type can access */
  views: SportView[];
  allowsViewSwitch: boolean;
};

export const SPORTS: Record<SportDepartment, SportConfig> = {
  CROSSFIT: {
    id: "CROSSFIT",
    label: "CrossFit",
    shortLabel: "CrossFit",
    description: "Functional fitness — strength, WODs, benchmarks, and competition prep.",
    tagline: "Every rep counts. Every WOD tracked.",
    icon: Dumbbell,
    accentClass: "text-lime",
    views: ["crossfit"],
    allowsViewSwitch: false,
    focusAreas: [
      { id: "strength", label: "Strength", scoreKey: "strengthScore" },
      { id: "olympic", label: "Olympic Lifting", scoreKey: "olympicLiftingScore" },
      { id: "gymnastics", label: "Gymnastics", scoreKey: "gymnasticsScore" },
      { id: "engine", label: "Engine / Conditioning", scoreKey: "engineScore" },
      { id: "power", label: "Power & Speed", scoreKey: "powerScore" },
      { id: "mobility", label: "Mobility", scoreKey: "mobilityScore" },
      { id: "recovery", label: "Recovery", scoreKey: "recoveryScore" },
      { id: "bodyweight", label: "Bodyweight Skills", scoreKey: "gymnasticsScore" },
    ],
    highlights: ["Benchmark WODs", "Barbell PRs", "Gymnastics skills", "Competition prep"],
  },
  HYROX: {
    id: "HYROX",
    label: "Hyrox",
    shortLabel: "Hyrox",
    description: "Hybrid racing — running, sled work, stations, and race-day pacing.",
    tagline: "Train the race. Own the stations.",
    icon: Flame,
    accentClass: "text-orange-400",
    views: ["hyrox"],
    allowsViewSwitch: false,
    focusAreas: [
      { id: "running", label: "Running", scoreKey: "runningScore" },
      { id: "sled", label: "Sled Push / Pull", scoreKey: "powerScore" },
      { id: "rowing", label: "Rowing", scoreKey: "engineScore" },
      { id: "wallballs", label: "Wall Balls", scoreKey: "powerScore" },
      { id: "burpees", label: "Burpee Broad Jumps", scoreKey: "engineScore" },
      { id: "strength", label: "Functional Strength", scoreKey: "strengthScore" },
      { id: "hybrid", label: "Station Transitions", scoreKey: "workCapacityScore" },
      { id: "recovery", label: "Recovery", scoreKey: "recoveryScore" },
    ],
    highlights: ["8×1km runs", "Station pacing", "Race simulations", "Hybrid engine"],
  },
  HYBRID: {
    id: "HYBRID",
    label: "Hybrid",
    shortLabel: "Hybrid",
    description: "Train both CrossFit and Hyrox — switch dashboards without changing your athlete type.",
    tagline: "Two sports. One ascent.",
    icon: Layers,
    accentClass: "text-violet-400",
    views: ["crossfit", "hyrox"],
    allowsViewSwitch: true,
    focusAreas: [
      { id: "strength", label: "Strength", scoreKey: "strengthScore" },
      { id: "running", label: "Running", scoreKey: "runningScore" },
      { id: "engine", label: "Engine", scoreKey: "engineScore" },
      { id: "power", label: "Power", scoreKey: "powerScore" },
      { id: "recovery", label: "Recovery", scoreKey: "recoveryScore" },
    ],
    highlights: ["CrossFit WODs", "Hyrox stations", "Dual dashboards", "Unified history"],
  },
};

export const SPORT_LIST = Object.values(SPORTS);

export function getSportConfig(department: SportDepartment | null | undefined): SportConfig {
  if (department && department in SPORTS) return SPORTS[department];
  return SPORTS.CROSSFIT;
}

export function isValidSport(value: string): value is SportDepartment {
  return value in SPORTS;
}

export function getSportFocusScoreKey(
  focusId: string,
  department: SportDepartment | null | undefined,
): string | null {
  const config = getSportConfig(department);
  return config.focusAreas.find((f) => f.id === focusId)?.scoreKey ?? null;
}

/** @deprecated Use SPORTS / getSportConfig */
export const DEPARTMENTS = SPORTS;
export const DEPARTMENT_LIST = SPORT_LIST;
export type DepartmentId = SportDepartment;
export type DepartmentConfig = SportConfig;
export const getDepartmentConfig = getSportConfig;
export const isValidDepartment = isValidSport;
export const getDepartmentFocusScoreKey = getSportFocusScoreKey;
