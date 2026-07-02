export type RaceSplit = {
  stationSlug: string;
  sequence: number;
  timeSeconds: number | null;
  distanceMeters: number | null;
  pacePerKmSeconds: number | null;
};

export type CompetitionRace = {
  id: string;
  userId: string;
  name: string;
  raceDate: Date;
  division: string | null;
  finishTimeSeconds: number | null;
  predictedFinishSeconds: number | null;
  weakestStationSlug: string | null;
  strongestStationSlug: string | null;
  splits: RaceSplit[];
};

export type RacePrediction = {
  predictedFinishSeconds: number;
  predictedDisplay: string;
  averageRunPaceSeconds: number | null;
  transitionTimeSeconds: number | null;
  weakestStation: { slug: string; name: string } | null;
  strongestStation: { slug: string; name: string } | null;
};

export type StationProgress = {
  slug: string;
  name: string;
  bestSeconds: number | null;
  averageSeconds: number | null;
  trend: "up" | "down" | "flat";
};
