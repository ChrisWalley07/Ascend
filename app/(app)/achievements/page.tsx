import { Route } from "lucide-react";

import { getAchievementPageData } from "@/app/actions/achievements";
import { AchievementGridSummary } from "@/components/achievements/achievement-grid-summary";
import { AscensionGrid } from "@/components/achievements/ascension-grid";
import { XpLevelCard } from "@/components/achievements/xp-level-card";
import { PageHeader } from "@/components/ui/page-header";
import { ASCENSION } from "@/lib/ascension/labels";
import { requireUser } from "@/lib/auth";

export default async function AchievementsPage() {
  await requireUser();
  const { result, xpProgress } = await getAchievementPageData();

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
      <PageHeader
        title={ASCENSION.name}
        subtitle={ASCENSION.pageSubtitle}
        icon={Route}
        accentIcon
      />

      <XpLevelCard progress={xpProgress} />

      <AchievementGridSummary result={result} />

      <AscensionGrid result={result} />
    </div>
  );
}
