import Link from "next/link";
import { format } from "date-fns";
import { Flag, Plus } from "lucide-react";

import { getHyroxRaces } from "@/app/actions/hyrox";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatHyroxTime } from "@/lib/hyrox/catalog";
import { cn } from "@/lib/utils";

export default async function HyroxRacesPage() {
  const user = await requireUser();
  const races = await getHyroxRaces(user.id);

  const upcoming = races.filter((r) => !r.finishTimeSeconds && r.raceDate >= new Date());
  const completed = races.filter((r) => r.finishTimeSeconds || r.raceDate < new Date());

  return (
    <div className="min-h-screen">
      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
        <PageHeader
          title="Hyrox Races"
          subtitle="Race results, predictions, and upcoming events."
          icon={Flag}
          accentIcon
          action={
            <Link href="/hyrox/races/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
              <Plus className="h-3.5 w-3.5" />
              Log race
            </Link>
          }
        />

        {upcoming.length > 0 && (
          <section className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Upcoming
            </p>
            {upcoming.map((race) => (
              <div key={race.id} className="surface p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{race.name ?? "Hyrox Race"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(race.raceDate, "EEEE, MMM d, yyyy")}
                    {race.division ? ` · ${race.division}` : ""}
                  </p>
                </div>
                <span className="rounded-lg bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-300">
                  Scheduled
                </span>
              </div>
            ))}
          </section>
        )}

        <section className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Race history
          </p>
          {completed.length > 0 ? (
            <div className="space-y-3">
              {completed.map((race) => (
                <div key={race.id} className="surface p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-bold text-foreground">{race.name ?? "Hyrox Race"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(race.raceDate, "MMM d, yyyy")}
                        {race.division ? ` · ${race.division}` : ""}
                        {race.ageGroup ? ` · ${race.ageGroup}` : ""}
                      </p>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-lime shrink-0">
                      {race.finishTimeSeconds ? formatHyroxTime(race.finishTimeSeconds) : "—"}
                    </p>
                  </div>
                  {race.splits.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {race.splits.slice(0, 5).map((split) => (
                        <div key={split.id} className="rounded-lg bg-white/4 px-2 py-1.5">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground truncate">
                            {split.stationSlug.replace(/-/g, " ")}
                          </p>
                          <p className="text-xs font-semibold tabular-nums">
                            {split.timeSeconds ? formatHyroxTime(split.timeSeconds) : "—"}
                          </p>
                        </div>
                      ))}
                      {race.splits.length > 5 && (
                        <div className="rounded-lg bg-white/4 px-2 py-1.5 flex items-center justify-center">
                          <p className="text-xs text-muted-foreground">+{race.splits.length - 5} more</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Flag}
              title="No races logged"
              description="Log a race result or schedule your next event to unlock predictions and station analytics."
              action={
                <Link href="/hyrox/races/new" className={buttonVariants({ size: "sm" })}>
                  Log your first race
                </Link>
              }
              className="py-12"
            />
          )}
        </section>
      </div>
    </div>
  );
}
