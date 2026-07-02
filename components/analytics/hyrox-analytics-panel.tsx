import { PerformanceLineChart } from "@/components/analytics/performance-line-chart";
import { AthleteScoreRadar } from "@/components/analytics/athlete-score-radar";
import { StatCard } from "@/components/ui/stat-card";
import type { getHyroxAnalyticsData } from "@/app/actions/hyrox-analytics";

type AnalyticsData = NonNullable<Awaited<ReturnType<typeof getHyroxAnalyticsData>>>;

export function HyroxAnalyticsPanel({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Hyrox Score"
          value={Math.round(data.score.overallScore)}
          unit="/ 100"
          iconName="trophy"
          accentColor="amber"
          animate
        />
        <StatCard
          label="Races Logged"
          value={data.totalRaces}
          subtitle="All time"
          iconName="flag"
          accentColor="amber"
          animate
        />
        <StatCard
          label="Avg Run Pace"
          value={data.averageRunPace}
          subtitle="Latest race"
          iconName="gauge"
          accentColor="blue"
        />
        <StatCard
          label="Sessions (90d)"
          value={data.totalSessions}
          subtitle="Hyrox training"
          iconName="flame"
          accentColor="lime"
          animate
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Hyrox Athlete Radar
          </p>
          <AthleteScoreRadar data={data.radarData} showPrevious />
        </div>
        <PerformanceLineChart
          title="Fitness Score"
          description="Hyrox athlete score over time"
          data={
            data.scoreSeries.length > 0
              ? data.scoreSeries
              : [{ label: "Today", value: Math.round(data.score.overallScore) }]
          }
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <PerformanceLineChart
          title="Weekly Volume"
          description="Hyrox sessions per week"
          data={data.weeklyVolume}
        />
        <PerformanceLineChart
          title="Monthly Training"
          description="Total training minutes per month"
          data={data.monthlyTraining}
        />
        <PerformanceLineChart
          title="Race Predictions"
          description="Finish times (minutes)"
          data={data.racePredictions}
        />
        <PerformanceLineChart
          title="Running Pace"
          description="Avg pace progression (min/km)"
          data={data.paceProgression}
        />
        <PerformanceLineChart
          title="Training Load"
          description="Average session RPE by month"
          data={data.rpeData}
        />
      </section>

      {data.stationProgress.length > 0 && (
        <section className="surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Station Progress — Personal Bests
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {data.stationProgress.map((station) => (
              <div key={station.station} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
                <p className="text-xs font-medium text-foreground truncate">{station.station}</p>
                <p className="text-lg font-bold tabular-nums text-lime mt-1">{station.bestDisplay}</p>
                <p className="text-[10px] text-muted-foreground">{station.attempts} attempts</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
