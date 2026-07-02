import { METRIC_CONFIG, PB_SLUGS } from "../config";
import type { PerformancePrediction } from "../types";
import {
  buildProjectionTimeline,
  estimateVo2From5k,
  extractWorkoutMaxWeightSeries,
  projectLinearTrend,
  toTimeSeries,
} from "../utils/trend";
import { formatMetricValue } from "../utils/format";
import type { PredictionModelContext } from "../collectors/data-collector";
import { pbSeries, raceFinishSeries } from "../collectors/data-collector";
import { buildPrediction, type PredictionModel } from "./base";

function predictFromSeries(
  key: keyof typeof METRIC_CONFIG,
  ctx: PredictionModelContext,
  series: Array<{ date: Date; value: number }>,
  direction: "lower_is_better" | "higher_is_better",
  extraFactors: PerformancePrediction["factors"] = [],
): PerformancePrediction | null {
  const config = METRIC_CONFIG[key];
  const trend = projectLinearTrend(
    series,
    config.defaultHorizonDays,
    direction,
    config.minSamples,
    config.idealSamples,
  );

  if (!trend) {
    return buildPrediction(key, ctx, {
      label: config.label,
      unit: config.unit,
      direction,
      current: null,
      currentDisplay: "—",
      projected: null,
      projectedDisplay: "—",
      horizonDays: config.defaultHorizonDays,
      confidence: 0,
      supported: false,
      factors: [
        {
          label: "Insufficient data",
          impact: "neutral",
          description: `Log ${config.label.toLowerCase()} results to unlock this prediction.`,
        },
      ],
      history: [],
      projectionTimeline: [],
    });
  }

  const history = toTimeSeries(series);
  const factors = [...trend.factors, ...extraFactors];

  return buildPrediction(key, ctx, {
    label: config.label,
    unit: config.unit,
    direction,
    current: trend.current,
    currentDisplay: formatMetricValue(trend.current, config.unit),
    projected: trend.projected,
    projectedDisplay: formatMetricValue(trend.projected, config.unit),
    horizonDays: config.defaultHorizonDays,
    confidence: trend.confidence,
    supported: series.length >= config.minSamples,
    factors,
    history,
    projectionTimeline: buildProjectionTimeline(
      history,
      trend.projected,
      config.defaultHorizonDays,
      ctx.collectedAt,
    ),
  });
}

export const hyroxFinishModel: PredictionModel = {
  key: "hyrox_finish",
  predict(ctx) {
    if (ctx.sportView !== "hyrox") return null;
    const series = raceFinishSeries(ctx);
    const domain = ctx.intelligence.domains.race_results;
    const extra: PerformancePrediction["factors"] = [];

    if (domain.momentum === "improving") {
      extra.push({
        label: "Race momentum",
        impact: "positive",
        description: domain.summary,
      });
    }

    return predictFromSeries("hyrox_finish", ctx, series, "lower_is_better", extra);
  },
};

export const run5kModel: PredictionModel = {
  key: "run_5k",
  predict(ctx) {
    let series = pbSeries(ctx, PB_SLUGS.run5k);
    if (series.length === 0) {
      series = ctx.raw.workouts
        .flatMap((w) =>
          w.exercises
            .filter((ex) => Math.abs((ex.distanceMeters ?? 0) - 5000) < 200 && (ex.timeSeconds ?? 0) > 0)
            .map((ex) => ({ date: w.date, value: ex.timeSeconds as number })),
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    const running = ctx.intelligence.domains.running_progress;
    return predictFromSeries("run_5k", ctx, series, "lower_is_better", [
      {
        label: "Running domain",
        impact: running.momentum === "improving" ? "positive" : running.momentum === "declining" ? "negative" : "neutral",
        description: running.summary,
      },
    ]);
  },
};

export const run10kModel: PredictionModel = {
  key: "run_10k",
  predict(ctx) {
    let series = pbSeries(ctx, PB_SLUGS.run10k);
    if (series.length === 0) {
      series = ctx.raw.workouts
        .flatMap((w) =>
          w.exercises
            .filter((ex) => Math.abs((ex.distanceMeters ?? 0) - 10000) < 300 && (ex.timeSeconds ?? 0) > 0)
            .map((ex) => ({ date: w.date, value: ex.timeSeconds as number })),
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    return predictFromSeries("run_10k", ctx, series, "lower_is_better");
  },
};

export const squatModel: PredictionModel = {
  key: "squat",
  predict(ctx) {
    let series = pbSeries(ctx, PB_SLUGS.squat);
    if (series.length === 0) {
      series = extractWorkoutMaxWeightSeries(ctx.raw.workouts, ["squat"]);
    }
    const strength = ctx.intelligence.domains.strength_progress;
    return predictFromSeries("squat", ctx, series, "higher_is_better", [
      {
        label: "Strength trend",
        impact: strength.momentum === "improving" ? "positive" : strength.momentum === "declining" ? "negative" : "neutral",
        description: strength.summary,
      },
    ]);
  },
};

export const deadliftModel: PredictionModel = {
  key: "deadlift",
  predict(ctx) {
    let series = pbSeries(ctx, PB_SLUGS.deadlift);
    if (series.length === 0) {
      series = extractWorkoutMaxWeightSeries(ctx.raw.workouts, ["deadlift"]);
    }
    return predictFromSeries("deadlift", ctx, series, "higher_is_better");
  },
};

export const benchModel: PredictionModel = {
  key: "bench",
  predict(ctx) {
    let series = pbSeries(ctx, PB_SLUGS.bench);
    if (series.length === 0) {
      series = extractWorkoutMaxWeightSeries(ctx.raw.workouts, ["bench"]);
    }
    return predictFromSeries("bench", ctx, series, "higher_is_better");
  },
};

export const vo2EstimateModel: PredictionModel = {
  key: "vo2_estimate",
  predict(ctx) {
    const run5k = pbSeries(ctx, PB_SLUGS.run5k);
    const paceSamples = ctx.raw.workouts
      .flatMap((w) =>
        w.exercises
          .filter((ex) => (ex.distanceMeters ?? 0) >= 1000 && (ex.timeSeconds ?? 0) > 0)
          .map((ex) => ({
            date: w.date,
            value: estimateVo2From5k(
              ((ex.timeSeconds ?? 0) / ((ex.distanceMeters ?? 1) / 1000)) * 5,
            ),
          })),
      );

    const series =
      run5k.length > 0
        ? run5k.map((p) => ({ date: p.date, value: estimateVo2From5k(p.value) }))
        : paceSamples.sort((a, b) => a.date.getTime() - b.date.getTime());

    return predictFromSeries("vo2_estimate", ctx, series, "higher_is_better", [
      {
        label: "Estimation method",
        impact: "neutral",
        description: "VO2 max is estimated from running pace using a Cooper-style formula — not lab tested.",
      },
    ]);
  },
};

export const engineScoreModel: PredictionModel = {
  key: "engine_score",
  predict(ctx) {
    const history =
      ctx.sportView === "hyrox" ? ctx.hyroxScoreHistory : ctx.crossfitScoreHistory;
    const series = history.map((row) => ({ date: row.date, value: row.engineScore }));
    const engineDomain = ctx.intelligence.domains.training_load;

    return predictFromSeries("engine_score", ctx, series, "higher_is_better", [
      {
        label: "Training load",
        impact: engineDomain.score >= 60 ? "positive" : "negative",
        description: engineDomain.summary,
      },
    ]);
  },
};

export const fitnessScoreModel: PredictionModel = {
  key: "fitness_score",
  predict(ctx) {
    const history =
      ctx.sportView === "hyrox" ? ctx.hyroxScoreHistory : ctx.crossfitScoreHistory;
    const series = history.map((row) => ({ date: row.date, value: row.overallScore }));

    if (series.length === 0 && ctx.intelligence.fitness > 0) {
      series.push({ date: ctx.collectedAt, value: ctx.intelligence.fitness });
    }

    return predictFromSeries("fitness_score", ctx, series, "higher_is_better", [
      {
        label: "Composite fitness",
        impact: ctx.intelligence.momentum === "improving" ? "positive" : "neutral",
        description: `Intelligence fitness index: ${ctx.intelligence.fitness}/100.`,
      },
    ]);
  },
};

export const PREDICTION_MODELS: PredictionModel[] = [
  hyroxFinishModel,
  run5kModel,
  run10kModel,
  squatModel,
  deadliftModel,
  benchModel,
  vo2EstimateModel,
  engineScoreModel,
  fitnessScoreModel,
];
