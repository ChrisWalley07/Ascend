import Link from "next/link";
import { Flame } from "lucide-react";

import { getHyroxDashboardData } from "@/app/actions/hyrox";
import { syncAchievementsForUser } from "@/app/actions/achievements";
import { AiFocusedDashboardBody } from "@/components/dashboard/ai-focused-dashboard-body";
import { DashboardHeader, formatToday } from "@/components/dashboard/dashboard-header";
import { buttonVariants } from "@/components/ui/button";
import { loadDashboardIntelligence } from "@/features/dashboard/load-dashboard-intelligence";
import { getPrismaClient } from "@/lib/prisma";
import { getSportConfig } from "@/lib/sports/registry";
import type { SportView } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

type Props = {
  userId: string;
  activeView: SportView;
  canSwitchViews: boolean;
};

export async function HyroxDashboard({ userId, activeView, canSwitchViews }: Props) {
  const prisma = getPrismaClient();
  const data = await getHyroxDashboardData(userId);
  const achievementResult = await syncAchievementsForUser(userId, "hyrox");
  const viewConfig = getSportConfig("HYROX");
  const DeptIcon = viewConfig.icon;
  const overallScore = Math.round(data.score.overallScore);

  const intelligence =
    prisma != null
      ? await loadDashboardIntelligence(prisma, userId, "hyrox", {
          overallScore,
          profileComplete: data.profileComplete,
          workoutCount: data.weeklySessionCount,
          goals: data.goals.map((g) => ({
            id: g.id,
            title: g.title,
            targetValue: g.targetValue,
            currentValue: g.currentValue,
            unit: g.unit ?? "",
            progressPct: Math.min(100, (g.currentValue / g.targetValue) * 100),
            deadline: g.targetDate ?? null,
          })),
        })
      : null;

  if (!intelligence) {
    return <div className="p-8 text-center text-muted-foreground">Database not configured.</div>;
  }

  return (
    <div className="min-h-screen animate-in fade-in duration-300">
      <DashboardHeader
        today={formatToday()}
        athleteName={data.athleteName}
        greeting={viewConfig.tagline.split(".")[0]}
        badgeLabel={viewConfig.label}
        badgeIcon={<DeptIcon className="h-3 w-3" />}
        activeView={activeView}
        canSwitchViews={canSwitchViews}
        logHref="/workouts/hyrox/new"
        logLabel="Log session"
        logIcon={<Flame className="h-3.5 w-3.5" />}
      />

      <div className="px-5 py-6 lg:px-8 lg:py-8">
        <AiFocusedDashboardBody
          score={overallScore}
          scoreLabel="Hyrox Score"
          scoreSublabel={`Level ${data.score.level}`}
          sportView="hyrox"
          profileComplete={data.profileComplete}
          achievementResult={achievementResult}
          profileBanner={
            !data.profileComplete ? (
              <div className="rounded-xl border border-orange-500/25 bg-orange-500/8 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-orange-300">Complete your profile for race-ready coaching.</p>
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
