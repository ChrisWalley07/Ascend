import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Medal } from "lucide-react";

import type { ProfilePrPreview } from "@/app/actions/profile-screen";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  recentPrs: ProfilePrPreview[];
  className?: string;
};

export function ProfilePersonalRecordsSection({ recentPrs, className }: Props) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Personal records
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground">Recent PRs</h2>
        </div>
        <Link href="/pbs" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-lime")}>
          View board
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      {recentPrs.length === 0 ? (
        <div className="surface rounded-2xl p-6 text-center">
          <Medal className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">Log workouts or PBs to populate your record board.</p>
          <Link href="/pbs" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
            Open PB board
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {recentPrs.map((pr) => (
            <div key={pr.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{pr.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {format(new Date(pr.achievedAt), "MMM d, yyyy")}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums text-lime">{pr.displayValue}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{pr.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
