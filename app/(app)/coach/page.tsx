import { Brain, RefreshCw } from "lucide-react";

import { getCoachReportForUser, refreshCoachReportAction } from "@/app/actions/coach";
import { getDepartmentSummary } from "@/app/actions/department";
import { CoachReportView } from "@/components/coach/coach-report";
import { InsightList } from "@/components/coach/insight-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { generateAiInsights } from "@/lib/ai-coach";
import { getPrismaClient } from "@/lib/prisma";

async function getLegacyInsights(userId: string) {
  const prisma = getPrismaClient();
  if (!prisma) return [];

  let insights = await prisma.aIInsight.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  if (insights.length === 0) {
    await generateAiInsights(userId);
    insights = await prisma.aIInsight.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  }

  return insights;
}

export default async function CoachPage() {
  const user = await requireUser();
  const summary = await getDepartmentSummary(user.id);
  const report = await getCoachReportForUser();
  const legacyInsights = await getLegacyInsights(user.id);
  const isHyrox = summary.activeView === "hyrox";

  const hasReport =
    report &&
    report.sections.some((section) => section.recommendation != null);

  return (
    <div className="min-h-screen">
      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6 max-w-5xl mx-auto">
        <PageHeader
          title="AI Coach"
          subtitle={
            isHyrox
              ? "Explainable coaching from your race data, recovery, and training trends."
              : "Personalised, rule-based coaching from your workouts, recovery, and goals."
          }
          icon={Brain}
          accentIcon
          action={
            <form action={refreshCoachReportAction}>
              <Button type="submit" variant="outline" size="sm">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </form>
          }
        />

        {hasReport && report ? (
          <CoachReportView report={report} />
        ) : (
          <EmptyState
            icon={Brain}
            title="Building your coaching profile"
            description="Log at least 2 workouts and a few recovery check-ins. The coach uses deterministic rules — no guesswork, fully explainable."
            action={
              <form action={refreshCoachReportAction}>
                <Button type="submit">
                  <RefreshCw className="h-4 w-4" />
                  Re-analyse
                </Button>
              </form>
            }
            className="mt-8"
          />
        )}

        {legacyInsights.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground px-1">
              Recent Insight History
            </p>
            <InsightList insights={legacyInsights} />
          </div>
        )}
      </div>
    </div>
  );
}
