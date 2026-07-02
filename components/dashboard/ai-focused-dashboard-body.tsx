import Link from "next/link";

import { AscensionNextUp } from "@/components/dashboard/ascension-next-up";
import { DashboardQuickLog } from "@/components/dashboard/dashboard-quick-log";
import { ScoreRing } from "@/components/ui/score-ring";
import { buttonVariants } from "@/components/ui/button";
import type { AchievementEngineResult } from "@/features/athlete-achievements/engine/types";
import type { DashboardIntelligenceBundle } from "@/features/dashboard/load-dashboard-intelligence";
import type { SportView } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

type Props = {
  score: number;
  scoreLabel: string;
  scoreSublabel?: string;
  sportView: SportView;
  profileComplete: boolean;
  profileBanner?: React.ReactNode;
  intelligence: DashboardIntelligenceBundle;
  achievementResult?: AchievementEngineResult | null;
  className?: string;
};

export function AiFocusedDashboardBody({
  score,
  scoreLabel,
  scoreSublabel,
  sportView,
  profileComplete,
  profileBanner,
  intelligence,
  achievementResult,
  className,
}: Props) {
  return (
    <div className={cn("mx-auto flex max-w-lg flex-col gap-5", className)}>
      {profileBanner}

      {intelligence.showGettingStarted && (
        <div className="rounded-xl border border-dashed border-lime/30 bg-lime/5 px-4 py-4 text-center space-y-3">
          <p className="text-sm font-medium text-foreground">Get started in 2 steps</p>
          <ol className="text-xs text-muted-foreground space-y-1 text-left max-w-xs mx-auto">
            <li>1. Complete your profile</li>
            <li>2. Log your first workout below</li>
          </ol>
          {!profileComplete && (
            <Link href="/profile" className={buttonVariants({ size: "sm" })}>
              Complete profile
            </Link>
          )}
        </div>
      )}

      <section className="flex flex-col items-center py-1">
        <ScoreRing score={score} size={220} strokeWidth={9} label={scoreLabel} sublabel={scoreSublabel} />
      </section>

      <DashboardQuickLog sportView={sportView} focusArea={intelligence.focusArea} />

      {achievementResult && (
        <AscensionNextUp result={achievementResult} variant="compact" />
      )}

      <p className="text-center text-[11px] text-muted-foreground pb-2">
        <Link href="/achievements" className="hover:text-foreground transition-colors">
          Ascension
        </Link>
        <span className="mx-2 opacity-30">·</span>
        <Link href="/coach" className="hover:text-foreground transition-colors">
          Coach
        </Link>
        <span className="mx-2 opacity-30">·</span>
        <Link href="/analytics" className="hover:text-foreground transition-colors">
          Analytics
        </Link>
      </p>
    </div>
  );
}
