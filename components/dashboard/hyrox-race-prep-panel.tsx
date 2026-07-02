import Link from "next/link";
import { Calendar, Flag } from "lucide-react";

import { cn } from "@/lib/utils";

export type RacePrepData = {
  raceName: string;
  raceDate: Date;
  weeksOut: number;
  daysOut: number;
  focusStation: string | null;
  focusAttribute: string | null;
  weeklyAction: string;
};

type Props = {
  prep: RacePrepData | null;
  className?: string;
};

export function HyroxRacePrepPanel({ prep, className }: Props) {
  if (!prep) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/8 to-transparent p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-orange-400" />
          <p className="text-sm font-semibold text-foreground">Race prep</p>
        </div>
        <span className="text-xs font-bold tabular-nums text-orange-300">
          {prep.weeksOut}w out
        </span>
      </div>

      <p className="mt-2 text-sm text-foreground font-medium">{prep.raceName}</p>
      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
        <Calendar className="h-3 w-3" />
        {prep.daysOut} days · {prep.raceDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
      </p>

      <div className="mt-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-300/80">
          This week&apos;s focus
        </p>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {prep.focusStation
            ? `Sharpen ${prep.focusStation}${prep.focusAttribute ? ` (${prep.focusAttribute})` : ""}. `
            : prep.focusAttribute
              ? `Build ${prep.focusAttribute}. `
              : ""}
          {prep.weeklyAction}
        </p>
      </div>

      <Link
        href="/hyrox/races"
        className="inline-block mt-3 text-xs text-orange-300 hover:text-orange-200 transition-colors"
      >
        Race details →
      </Link>
    </section>
  );
}
