"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BarChart3 } from "lucide-react";

import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

const BenchmarkTrendChart = dynamic(
  () => import("@/components/benchmarks/benchmark-trend-chart").then((m) => m.BenchmarkTrendChart),
  {
    ssr: false,
    loading: () => <div className="h-[140px] w-full rounded-xl bg-white/5 animate-pulse" />,
  },
);

type TrendPoint = { label: string; value: number };

export function LazyBenchmarkTrendChart({ data }: { data: TrendPoint[] }) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(!isMobile);

  if (data.length < 2) return null;

  if (isMobile && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl border border-white/10",
          "bg-white/5 px-4 py-3 text-sm font-medium text-lime transition-colors active:bg-white/10",
        )}
      >
        <BarChart3 className="h-4 w-4" />
        Show trend chart
      </button>
    );
  }

  return <BenchmarkTrendChart data={data} />;
}
