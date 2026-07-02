import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { getAthleteProfileScreenData } from "@/app/actions/profile-screen";
import { getTodayRecoveryCheckIn } from "@/app/actions/recovery";
import { getUserSportDepartment } from "@/app/actions/department";
import { AscensionNextUp } from "@/components/dashboard/ascension-next-up";
import { DailyCheckIn } from "@/components/dashboard/daily-check-in";
import { ProfileBenchmarksSection } from "@/components/profile/profile-benchmarks-section";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfilePersonalRecordsSection } from "@/components/profile/profile-prs-section";
import { ProfileRecentUnlocks } from "@/components/profile/profile-recent-unlocks";
import { ProfileStatsSection } from "@/components/profile/profile-stats-section";
import { buttonVariants } from "@/components/ui/button";
import { ASCENSION } from "@/lib/ascension/labels";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
  const user = await requireUser();
  const sportDepartment = await getUserSportDepartment(user.id);
  if (!sportDepartment) {
    redirect("/onboarding/department");
  }

  const data = await getAthleteProfileScreenData();
  const todayCheckIn = await getTodayRecoveryCheckIn();

  return (
    <div className="min-h-screen gradient-radial-lime">
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-6 lg:px-8 lg:py-8">
        <ProfileHero
          name={data.name}
          profileImageUrl={data.profileImageUrl}
          sportLabel={data.sportLabel}
          xpProgress={data.xpProgress}
          achievementResult={data.achievementResult}
        />

        {!data.profileCompleted && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm text-amber-200/90">
            Complete your athlete details for personalised coaching and goal alignment scoring.{" "}
            <a href="/profile/edit" className="font-semibold text-amber-100 underline underline-offset-2">
              Edit profile →
            </a>
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {ASCENSION.profileEyebrow}
              </p>
              <h2 className="mt-1 text-lg font-bold text-foreground">{ASCENSION.profileHeading}</h2>
            </div>
            <Link
              href="/achievements"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-lime")}
            >
              {ASCENSION.viewAllCta}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <AscensionNextUp result={data.achievementResult} />
        </section>

        <div className="space-y-8 border-t border-border/60 pt-8">
          <section className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Recovery
              </p>
              <h2 className="mt-1 text-lg font-bold text-foreground">Daily check-in</h2>
            </div>
            <DailyCheckIn todayCheckIn={todayCheckIn} />
          </section>
          <ProfileStatsSection stats={data.stats} />
          <ProfileBenchmarksSection benchmarks={data.benchmarks} />
          <ProfilePersonalRecordsSection recentPrs={data.recentPrs} />
          <ProfileRecentUnlocks unlocks={data.recentUnlocks} />
        </div>
      </div>
    </div>
  );
}
