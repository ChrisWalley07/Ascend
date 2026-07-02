import type { AthleteIntelligenceReport, AnalyzerContext, SportIntelligencePlugin } from "../types";

export const crossfitPlugin: SportIntelligencePlugin = {
  sportView: "crossfit",
  compositeWeights: {
    fitness: {
      strength: 0.3,
      running: 0.15,
      benchmarks: 0.2,
      consistency: 0.2,
      personalBests: 0.15,
    },
  },
  enrich(report: AthleteIntelligenceReport, ctx: AnalyzerContext): AthleteIntelligenceReport {
    if (ctx.data.benchmarkAttempts.length === 0 && report.fitness >= 60) {
      return {
        ...report,
        recommendations: [
          {
            id: "cf-benchmark-baseline",
            domain: "benchmarks",
            title: "Establish benchmark baselines",
            message: "Log Fran, Grace, or a hero WOD to anchor your engine and benchmark progress.",
            severity: "info",
            priority: 65,
          },
          ...report.recommendations,
        ],
      };
    }
    return report;
  },
};
