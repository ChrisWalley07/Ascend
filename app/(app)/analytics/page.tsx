import { BarChart3 } from "lucide-react";

import { getDepartmentSummary } from "@/app/actions/department";
import { getPerformancePredictionsForUser } from "@/app/actions/performance-prediction";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts.client";
import { AnalyticsCrossfitContent } from "@/components/analytics/analytics-content.client";
import { HyroxAnalyticsPanel } from "@/components/analytics/hyrox-analytics-panel";
import { getCrossfitAnalyticsForUser, getHyroxAnalyticsForUser } from "@/features/analytics";
import { requireUser } from "@/lib/auth";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const summary = await getDepartmentSummary(user.id);

  if (summary.activeView === "hyrox") {
    const [data, predictionReport] = await Promise.all([
      getHyroxAnalyticsForUser(user.id),
      getPerformancePredictionsForUser(),
    ]);
    if (!data) {
      return (
        <div className="px-5 py-8 lg:px-8">
          <PageHeader title="Hyrox Analytics" subtitle="Race and station performance" icon={BarChart3} accentIcon />
          <EmptyState icon={BarChart3} title="Database not configured" description="Add your DB settings to unlock analytics." className="mt-16" />
        </div>
      );
    }
    return (
      <div className="min-h-screen">
        <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
          <PageHeader
            title="Hyrox Analytics"
            subtitle="Weekly volume, running pace, station progress, and race predictions."
            icon={BarChart3}
            accentIcon
          />
          <HyroxAnalyticsPanel data={data} />
          <AnalyticsCharts kind="predictions" predictionReport={predictionReport} />
        </div>
      </div>
    );
  }

  const [analytics, predictionReport] = await Promise.all([
    getCrossfitAnalyticsForUser(user.id),
    getPerformancePredictionsForUser(),
  ]);

  if (!analytics) {
    return (
      <div className="px-5 py-8 lg:px-8">
        <PageHeader
          title="Analytics"
          subtitle="Deep performance metrics"
          icon={BarChart3}
          accentIcon
        />
        <EmptyState
          icon={BarChart3}
          title="Database not configured"
          description="Add your DB settings to unlock historical analytics."
          className="mt-16"
        />
      </div>
    );
  }

  const { score, frequencyData, volumeData, rpeData, prData, scoreSeries, radarData, totalPrs } = analytics;

  return (
    <div className="min-h-screen">
      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
        <PageHeader
          title="Analytics"
          subtitle="Training frequency, volume, PR momentum, and score evolution."
          icon={BarChart3}
          accentIcon
        />

        <section className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Athlete Score"
            value={Math.round(score.overallScore)}
            unit="/ 100"
            iconName="trophy"
            accentColor="lime"
            animate
          />
          <StatCard
            label="Total PRs"
            value={totalPrs}
            subtitle="All time"
            iconName="medal"
            accentColor="amber"
            animate
          />
          <StatCard
            label="Strongest"
            value={score.strongestCategory.replace("Score", "").replace(/([A-Z])/g, " $1").trim()}
            subtitle="Your peak category"
            iconName="zap"
            accentColor="lime"
          />
          <StatCard
            label="Focus Area"
            value={score.weakestCategory.replace("Score", "").replace(/([A-Z])/g, " $1").trim()}
            subtitle="Needs most work"
            iconName="bar-chart"
            accentColor="blue"
          />
        </section>

        <AnalyticsCrossfitContent
          radarData={radarData}
          scoreSeries={scoreSeries}
          overallScore={score.overallScore}
          frequencyData={frequencyData}
          volumeData={volumeData}
          prData={prData}
          rpeData={rpeData}
          predictionReport={predictionReport}
        />
      </div>
    </div>
  );
}
