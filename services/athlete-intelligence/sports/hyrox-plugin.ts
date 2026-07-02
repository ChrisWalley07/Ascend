import type { AthleteIntelligenceReport, AnalyzerContext, SportIntelligencePlugin } from "../types";
import { raceResultsAnalyzer } from "../analyzers";

export const hyroxPlugin: SportIntelligencePlugin = {
  sportView: "hyrox",
  analyzers: {
    race_results: raceResultsAnalyzer,
  },
  compositeWeights: {
    fitness: {
      strength: 0.15,
      running: 0.3,
      benchmarks: 0.1,
      consistency: 0.2,
      personalBests: 0.25,
    },
    readiness: {
      recovery: 0.4,
      fatigueInverse: 0.4,
      consistency: 0.2,
    },
  },
  enrich(report: AthleteIntelligenceReport, ctx: AnalyzerContext): AthleteIntelligenceReport {
    const weakest = ctx.data.races.at(-1)?.weakestStationSlug;
    if (!weakest) return report;

    return {
      ...report,
      recommendations: [
        {
          id: "hyrox-station-focus",
          domain: "race_results",
          title: "Station focus block",
          message: `Your latest race flagged ${weakest.replace(/-/g, " ")} as a limiter. Add station-specific practice this week.`,
          severity: "info",
          priority: 75,
        },
        ...report.recommendations,
      ],
    };
  },
};
