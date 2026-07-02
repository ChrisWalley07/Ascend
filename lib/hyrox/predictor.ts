import { HYROX_STATIONS, formatHyroxTime } from "@/lib/hyrox/catalog";

export type RaceSplitInput = {
  stationSlug: string;
  sequence: number;
  timeSeconds?: number | null;
  distanceMeters?: number | null;
  pacePerKmSeconds?: number | null;
};

export type RacePrediction = {
  predictedFinishSeconds: number;
  predictedDisplay: string;
  averageRunPaceSeconds: number | null;
  fastestStation: { slug: string; name: string; timeSeconds: number } | null;
  slowestStation: { slug: string; name: string; timeSeconds: number } | null;
  transitionTimeSeconds: number;
  weakestStation: { slug: string; name: string } | null;
  strongestStation: { slug: string; name: string } | null;
};

export function analyzeRaceSplits(splits: RaceSplitInput[]): RacePrediction {
  const timed = splits.filter((s) => s.timeSeconds && s.timeSeconds > 0);
  const stationMap = Object.fromEntries(HYROX_STATIONS.map((s) => [s.slug, s]));

  const totalStationTime = timed.reduce((sum, s) => sum + (s.timeSeconds ?? 0), 0);
  const transitionTimeSeconds = Math.round(totalStationTime * 0.04);

  const runSplits = timed.filter((s) => stationMap[s.stationSlug]?.isRun);
  const avgRunPace =
    runSplits.length > 0
      ? Math.round(
          runSplits.reduce((sum, s) => {
            const dist = s.distanceMeters ?? 1000;
            return sum + ((s.timeSeconds ?? 0) / dist) * 1000;
          }, 0) / runSplits.length,
        )
      : null;

  const sorted = [...timed].sort((a, b) => (a.timeSeconds ?? 0) - (b.timeSeconds ?? 0));
  const fastest = sorted[0];
  const slowest = sorted[sorted.length - 1];

  const predictedFinishSeconds = totalStationTime + transitionTimeSeconds;

  const nonRun = timed.filter((s) => !stationMap[s.stationSlug]?.isRun);
  const slowestNonRun = [...nonRun].sort((a, b) => (b.timeSeconds ?? 0) - (a.timeSeconds ?? 0))[0];
  const fastestNonRun = [...nonRun].sort((a, b) => (a.timeSeconds ?? 0) - (b.timeSeconds ?? 0))[0];

  return {
    predictedFinishSeconds,
    predictedDisplay: formatHyroxTime(predictedFinishSeconds),
    averageRunPaceSeconds: avgRunPace,
    fastestStation: fastest
      ? {
          slug: fastest.stationSlug,
          name: stationMap[fastest.stationSlug]?.name ?? fastest.stationSlug,
          timeSeconds: fastest.timeSeconds!,
        }
      : null,
    slowestStation: slowest
      ? {
          slug: slowest.stationSlug,
          name: stationMap[slowest.stationSlug]?.name ?? slowest.stationSlug,
          timeSeconds: slowest.timeSeconds!,
        }
      : null,
    transitionTimeSeconds,
    weakestStation: slowestNonRun
      ? {
          slug: slowestNonRun.stationSlug,
          name: stationMap[slowestNonRun.stationSlug]?.name ?? slowestNonRun.stationSlug,
        }
      : null,
    strongestStation: fastestNonRun
      ? {
          slug: fastestNonRun.stationSlug,
          name: stationMap[fastestNonRun.stationSlug]?.name ?? fastestNonRun.stationSlug,
        }
      : null,
  };
}

export function predictFinishFromSessions(
  recentFinishSeconds: number[],
  weeklySessions: number,
): { weeks: number; targetDisplay: string } | null {
  if (recentFinishSeconds.length === 0 || weeklySessions < 2) return null;
  const current = recentFinishSeconds[0];
  const target = current - 300;
  if (target <= 0) return null;
  const weeks = Math.max(4, Math.round((current - target) / (weeklySessions * 15)));
  return { weeks, targetDisplay: formatHyroxTime(target) };
}
