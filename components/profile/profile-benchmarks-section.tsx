import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";

import type { ProfileBenchmarkPreview } from "@/app/actions/profile-screen";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  benchmarks: ProfileBenchmarkPreview[];
  className?: string;
};

export function ProfileBenchmarksSection({ benchmarks, className }: Props) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Benchmarks
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground">Performance tests</h2>
        </div>
        <Link href="/benchmarks" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-lime")}>
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      {benchmarks.length === 0 ? (
        <div className="surface rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">No benchmark attempts yet.</p>
          <Link href="/benchmarks" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
            Log a benchmark
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {benchmarks.map((benchmark) => (
            <div
              key={benchmark.id}
              className="surface-raised flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{benchmark.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {benchmark.attemptCount} attempt{benchmark.attemptCount === 1 ? "" : "s"}
                  {benchmark.lastAttemptDate ? ` · ${benchmark.lastAttemptDate}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Best
                  </p>
                  <p className="text-sm font-bold tabular-nums text-lime">{benchmark.bestScore}</p>
                </div>
                {benchmark.improved ? (
                  <TrendingUp className="h-4 w-4 text-lime" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
