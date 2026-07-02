import Link from "next/link";
import { Dumbbell } from "lucide-react";

import { syncAchievementsForUser } from "@/app/actions/achievements";
import { getDepartmentSummary } from "@/app/actions/department";
import { AiFocusedDashboardBody } from "@/components/dashboard/ai-focused-dashboard-body";
import { DashboardHeader, formatToday } from "@/components/dashboard/dashboard-header";
import { HyroxDashboard } from "@/components/dashboard/hyrox-dashboard";
import { buttonVariants } from "@/components/ui/button";
import { getCrossfitDashboardForUser } from "@/features/dashboard";
import { loadDashboardIntelligence } from "@/features/dashboard/load-dashboard-intelligence";
import { requireUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const prisma = getPrismaClient();
  const summary = await getDepartmentSummary(user.id);

  if (summary.activeView === "hyrox") {
    return (
      <HyroxDashboard
        userId={user.id}
        activeView={summary.activeView}
        canSwitchViews={summary.canSwitchViews}
      />
    );
  }

  const data = await getCrossfitDashboardForUser(user.id, summary.activeView);
  const achievementResult = await syncAchievementsForUser(user.id, summary.activeView);
  const overallScore = Math.round(data.scoreSnapshot?.overallScore ?? 72);
  const workoutCount = prisma
    ? await prisma.workout.count({ where: { userId: user.id } }).catch(() => 0)
    : 0;

  const intelligence =
    prisma != null
      ? await loadDashboardIntelligence(prisma, user.id, "crossfit", {
          overallScore,
          profileComplete: data.profileComplete,
          workoutCount,
          goals: data.goals.map((g) => ({
            id: g.id,
            title: g.title,
            targetValue: g.targetValue,
            currentValue: g.currentValue,
            unit: g.unit ?? "",
            progressPct: Math.min(100, (g.currentValue / Math.max(g.targetValue, 1)) * 100),
            deadline: g.targetDate ?? null,
          })),
        })
      : null;

  const DeptIcon = summary.viewConfig.icon;

  if (!intelligence) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Database not configured.
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-in fade-in duration-300">
      <DashboardHeader
        today={formatToday()}
        athleteName={data.athleteName}
        greeting={summary.viewConfig.tagline.split(".")[0]}
        badgeLabel={summary.viewConfig.label}
        badgeIcon={<DeptIcon className="h-3 w-3" />}
        activeView={summary.activeView}
        canSwitchViews={summary.canSwitchViews}
        logHref="/workouts/new"
        logLabel="Log workout"
        logIcon={<Dumbbell className="h-3.5 w-3.5" />}
      />

      <div className="px-5 py-6 lg:px-8 lg:py-8">
        <AiFocusedDashboardBody
          score={overallScore}
          scoreLabel="Athlete Score"
          sportView="crossfit"
          profileComplete={data.profileComplete}
          achievementResult={achievementResult}
          profileBanner={
            !data.profileComplete ? (
              <div className="rounded-xl border border-lime/25 bg-lime/8 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-lime">Complete your profile for personalised coaching.</p>
                <Link href="/profile" className={cn(buttonVariants({ size: "sm" }), "shrink-0")}>
                  Set up
                </Link>
              </div>
            ) : undefined
          }
          intelligence={intelligence}
        />
      </div>
    </div>
  );
}
