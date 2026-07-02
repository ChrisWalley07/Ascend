import type { PrismaClient } from "@prisma/client";

import { mergeEngineConfig } from "./config";
import { DEFAULT_ANALYZERS } from "./analyzers";
import { collectIntelligenceData } from "./collectors/data-collector";
import { getSportPlugin } from "./sports/registry";
import {
  buildPredictions,
  buildRecommendations,
  buildWarnings,
  synthesizeCompositeScores,
} from "./synthesizers/report-synthesizer";
import type {
  AnalyzerContext,
  AthleteIntelligenceReport,
  CompositeWeights,
  DomainAnalyzer,
  DomainSignal,
  IntelligenceDomain,
  IntelligenceEngineOptions,
  IntelligenceRawData,
} from "./types";

function mergeConfigWithPlugin(
  options: IntelligenceEngineOptions,
  pluginWeights?: Partial<CompositeWeights>,
) {
  const base = mergeEngineConfig(options.config);
  if (!pluginWeights) return base;

  return mergeEngineConfig({
    ...options.config,
    compositeWeights: {
      readiness: { ...base.compositeWeights.readiness, ...pluginWeights.readiness },
      fitness: { ...base.compositeWeights.fitness, ...pluginWeights.fitness },
      fatigue: { ...base.compositeWeights.fatigue, ...pluginWeights.fatigue },
    },
  });
}

function resolveAnalyzers(
  sportView: "crossfit" | "hyrox",
  pluginOverrides?: Partial<Record<IntelligenceDomain, DomainAnalyzer>>,
): DomainAnalyzer[] {
  const byDomain = new Map<IntelligenceDomain, DomainAnalyzer>(
    DEFAULT_ANALYZERS.map((analyzer) => [analyzer.domain, analyzer]),
  );

  if (pluginOverrides) {
    for (const [domain, analyzer] of Object.entries(pluginOverrides) as [
      IntelligenceDomain,
      DomainAnalyzer,
    ][]) {
      if (analyzer) byDomain.set(domain, analyzer);
    }
  }

  return Array.from(byDomain.values());
}

function runAnalyzers(
  analyzers: DomainAnalyzer[],
  ctx: AnalyzerContext,
): Record<IntelligenceDomain, DomainSignal> {
  const domains = {} as Record<IntelligenceDomain, DomainSignal>;
  for (const analyzer of analyzers) {
    domains[analyzer.domain] = analyzer.analyze(ctx);
  }
  return domains;
}

function emptyDomainSignal(domain: IntelligenceDomain): DomainSignal {
  return {
    domain,
    score: 0,
    momentum: "insufficient_data",
    confidence: 0,
    metrics: [],
    summary: "No data available.",
  };
}

function buildEmptyReport(data: IntelligenceRawData): AthleteIntelligenceReport {
  const domains = {
    training_load: emptyDomainSignal("training_load"),
    weekly_volume: emptyDomainSignal("weekly_volume"),
    workout_frequency: emptyDomainSignal("workout_frequency"),
    recovery: emptyDomainSignal("recovery"),
    running_progress: emptyDomainSignal("running_progress"),
    strength_progress: emptyDomainSignal("strength_progress"),
    consistency: emptyDomainSignal("consistency"),
    benchmarks: emptyDomainSignal("benchmarks"),
    personal_bests: emptyDomainSignal("personal_bests"),
    race_results: emptyDomainSignal("race_results"),
  };

  return {
    generatedAt: data.collectedAt.toISOString(),
    sportView: data.sportView,
    athleteType: data.athleteType,
    readiness: 0,
    fitness: 0,
    fatigue: 0,
    momentum: "insufficient_data",
    confidence: 0,
    domains,
    recommendations: [],
    warnings: [],
    predictions: [],
  };
}

export async function generateAthleteIntelligence(
  prisma: PrismaClient,
  userId: string,
  options: IntelligenceEngineOptions = {},
): Promise<AthleteIntelligenceReport | null> {
  const rawData = await collectIntelligenceData(prisma, userId, options);
  if (!rawData) return null;

  return analyzeAthleteIntelligence(rawData, options);
}

export function analyzeAthleteIntelligence(
  data: IntelligenceRawData,
  options: IntelligenceEngineOptions = {},
): AthleteIntelligenceReport {
  const plugin = getSportPlugin(data.sportView);
  const config = mergeConfigWithPlugin(options, plugin?.compositeWeights);
  const ctx: AnalyzerContext = { data, config, now: data.collectedAt };

  if (data.workouts.length === 0 && data.recoveryLogs.length === 0) {
    return buildEmptyReport(data);
  }

  const analyzers = resolveAnalyzers(data.sportView, plugin?.analyzers);
  const domains = runAnalyzers(analyzers, ctx);
  const composite = synthesizeCompositeScores(domains, ctx);

  let report: AthleteIntelligenceReport = {
    generatedAt: data.collectedAt.toISOString(),
    sportView: data.sportView,
    athleteType: data.athleteType,
    ...composite,
    domains,
    recommendations: buildRecommendations(domains, ctx),
    warnings: buildWarnings(domains, ctx),
    predictions: buildPredictions(domains, ctx),
  };

  if (plugin?.enrich) {
    report = plugin.enrich(report, ctx);
  }

  return report;
}
