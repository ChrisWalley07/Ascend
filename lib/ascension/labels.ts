/** User-facing copy for the gamified progression system (Ascend brand). */
export const ASCENSION = {
  name: "Ascension",
  navLabel: "Ascend",
  pageSubtitle:
    "Unlock tiles in order — easier skills open the path to harder ones. Train, log, and level up.",
  viewAllCta: "Open Ascension",
  completionStat: "Ascension",
  profileEyebrow: "Your ascent",
  profileHeading: "Next unlocks",
  recentUnlocksEyebrow: "Recent ascents",
  recentUnlocksHeading: "Latest unlocks",
  dashboardEyebrow: "Ascension",
  dashboardHeading: "Your next unlock",
  emptyUnlocks: "Keep training — tiles unlock automatically from your logs and PRs.",
  emptyGrid: "No tiles match this filter yet. Log a workout or switch filters.",
} as const;

/** Display name for achievement points (not experience points). */
export const RX = "RX" as const;

export function formatRx(amount: number, options?: { signed?: boolean }): string {
  const prefix = options?.signed && amount > 0 ? "+" : "";
  return `${prefix}${amount.toLocaleString()} ${RX}`;
}

export type AscensionGridFilter = "all" | "next" | "active" | "locked" | "completed";

export const ASCENSION_GRID_FILTERS: { id: AscensionGridFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "next", label: "Next up" },
  { id: "active", label: "In progress" },
  { id: "locked", label: "Locked" },
  { id: "completed", label: "Completed" },
];
