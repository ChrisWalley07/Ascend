import { format } from "date-fns";
import { Medal } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { getDepartmentSummary } from "@/app/actions/department";
import { BenchmarkForms } from "@/components/benchmarks/benchmark-forms";
import { LazyBenchmarkTrendChart } from "@/components/benchmarks/lazy-benchmark-trend-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { ensureHyroxBenchmarks } from "@/lib/hyrox/benchmarks";
import { benchmarkWhereForView } from "@/lib/sport/workout-filter";
import { getPrismaClient } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const defaultBenchmarks = [
  { name: "Fran", type: "GIRLS" as const, description: "21-15-9 Thrusters and Pull-Ups for time", scoringMode: "LOWER_IS_BETTER" as const, scoreUnit: "seconds" },
  { name: "Grace", type: "GIRLS" as const, description: "30 Clean and Jerks (135/95 lb) for time", scoringMode: "LOWER_IS_BETTER" as const, scoreUnit: "seconds" },
  { name: "Helen", type: "GIRLS" as const, description: "3 rounds: 400m Run, 21 KB Swings, 12 Pull-Ups", scoringMode: "LOWER_IS_BETTER" as const, scoreUnit: "seconds" },
  { name: "Murph", type: "HERO" as const, description: "1 mile run, 100 pull-ups, 200 push-ups, 300 squats, 1 mile run", scoringMode: "LOWER_IS_BETTER" as const, scoreUnit: "seconds" },
  { name: "Open 24.1", type: "OPEN" as const, description: "As many reps as possible in 15 minutes", scoringMode: "HIGHER_IS_BETTER" as const, scoreUnit: "reps" },
];

type BenchmarkWithAttempts = Prisma.BenchmarkGetPayload<{
  include: {
    attempts: {
      select: { score: true; scoreValue: true; date: true };
    };
  };
}>;

function summarizeAttempts(
  attempts: { scoreValue: number; score: string; date: Date }[],
  scoringMode: "LOWER_IS_BETTER" | "HIGHER_IS_BETTER",
) {
  if (attempts.length === 0) {
    return { best: "—", worst: "—", average: "—", improvement: "—", trendData: [] as { label: string; value: number }[], improved: false };
  }

  const sorted = [...attempts].sort((a, b) => a.scoreValue - b.scoreValue);
  const bestAttempt = scoringMode === "LOWER_IS_BETTER" ? sorted[0] : sorted[sorted.length - 1];
  const worstAttempt = scoringMode === "LOWER_IS_BETTER" ? sorted[sorted.length - 1] : sorted[0];
  const average = attempts.reduce((acc, i) => acc + i.scoreValue, 0) / attempts.length;

  const first = attempts[0];
  const latest = attempts[attempts.length - 1];
  const improvementRaw =
    scoringMode === "LOWER_IS_BETTER"
      ? ((first.scoreValue - latest.scoreValue) / Math.max(first.scoreValue, 1)) * 100
      : ((latest.scoreValue - first.scoreValue) / Math.max(first.scoreValue, 1)) * 100;

  return {
    best: bestAttempt.score,
    worst: worstAttempt.score,
    average: average.toFixed(1),
    improvement: `${improvementRaw >= 0 ? "+" : ""}${improvementRaw.toFixed(1)}%`,
    improved: improvementRaw >= 0,
    trendData: attempts.map((a) => ({ label: format(a.date, "MMM d"), value: a.scoreValue })),
  };
}

async function getBenchmarkData(
  userId: string,
  activeView: "crossfit" | "hyrox",
): Promise<{ benchmarks: BenchmarkWithAttempts[] }> {
  const prisma = getPrismaClient();
  if (!prisma) return { benchmarks: [] };

  const count = await prisma.benchmark.count();
  if (count === 0) {
    await prisma.benchmark.createMany({ data: defaultBenchmarks, skipDuplicates: true });
  }

  if (activeView === "hyrox") {
    await ensureHyroxBenchmarks(prisma).catch(() => undefined);
  }

  const sportFilter = await benchmarkWhereForView(prisma, activeView);

  const benchmarks = await prisma.benchmark.findMany({
    where: sportFilter,
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: {
      attempts: {
        where: { userId },
        orderBy: { date: "asc" },
        select: { score: true, scoreValue: true, date: true },
      },
    },
  });

  return { benchmarks };
}

export default async function BenchmarksPage() {
  const user = await requireUser();
  const summary = await getDepartmentSummary(user.id);
  const { benchmarks } = await getBenchmarkData(user.id, summary.activeView);
  const isHyrox = summary.activeView === "hyrox";

  const typeLabel: Record<string, string> = {
    GIRLS: "Girls WODs",
    HERO: "Hero WODs",
    OPEN: "CrossFit Open",
    CUSTOM: isHyrox ? "Hyrox Benchmarks" : "Custom",
  };

  const grouped = benchmarks.reduce<Record<string, BenchmarkWithAttempts[]>>(
    (acc, b) => {
      const key = b.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(b);
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen">
      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
        <PageHeader
          title="Benchmarks"
          subtitle={
            isHyrox
              ? "Track station tests, running benchmarks, and race-specific performance."
              : "Track WOD performance with trend charts and improvement metrics."
          }
          icon={Medal}
          accentIcon
        />

        <BenchmarkForms benchmarks={benchmarks.map((b) => ({ id: b.id, name: b.name }))} />

        {Object.entries(grouped).map(([type, list]) => (
          <div key={type} className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {typeLabel[type] ?? type}
            </p>
            <div className="grid gap-4">
              {list.map((benchmark) => {
                const summary = summarizeAttempts(benchmark.attempts, benchmark.scoringMode);
                const hasAttempts = benchmark.attempts.length > 0;

                return (
                  <div key={benchmark.id} className="surface p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-foreground">{benchmark.name}</p>
                          {hasAttempts && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                summary.improved
                                  ? "bg-lime/10 text-lime"
                                  : "bg-red-500/10 text-red-400",
                              )}
                            >
                              {summary.improvement}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{benchmark.description}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {benchmark.attempts.length} attempts
                      </span>
                    </div>

                    {hasAttempts ? (
                      <>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {[
                            { label: "Best", value: summary.best },
                            { label: "Worst", value: summary.worst },
                            { label: "Average", value: summary.average },
                            { label: "Improvement", value: summary.improvement },
                          ].map(({ label, value }) => (
                            <div key={label} className="rounded-xl bg-white/4 p-3">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {label}
                              </p>
                              <p className="mt-1.5 text-sm font-bold tabular-nums text-foreground">{value}</p>
                            </div>
                          ))}
                        </div>
                        <LazyBenchmarkTrendChart data={summary.trendData} />
                      </>
                    ) : (
                      <EmptyState
                        icon={Medal}
                        title="No attempts yet"
                        description="Log a score to start tracking your progression."
                        className="py-8"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
