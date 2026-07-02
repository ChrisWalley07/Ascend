export type WeeklyDigest = {
  weekLabel: string;
  scoreDelta: number | null;
  headline: string;
  bullets: string[];
  focusArea: string | null;
  readinessTrend: "up" | "down" | "stable" | null;
};
