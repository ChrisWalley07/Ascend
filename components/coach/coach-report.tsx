import type { CoachReport } from "@/features/ai-coach";
import { CoachConfidenceScore } from "@/components/coach/coach-confidence-score";
import { CoachSectionCard } from "@/components/coach/coach-section-card";
import { CoachRecommendationCard } from "@/components/coach/coach-recommendation-card";

type Props = {
  report: CoachReport;
};

export function CoachReportView({ report }: Props) {
  const today = report.sections.find((s) => s.id === "todays_recommendation");
  const recovery = report.sections.find((s) => s.id === "recovery_advice");
  const focus = report.sections.find((s) => s.id === "training_focus");
  const improvement = report.sections.find((s) => s.id === "biggest_improvement");
  const risks = report.sections.find((s) => s.id === "risk_factors");
  const milestone = report.sections.find((s) => s.id === "next_milestone");

  const secondarySections = [recovery, focus, improvement, risks, milestone].filter(Boolean);

  return (
    <div className="space-y-6">
      <CoachConfidenceScore score={report.confidenceScore} />

      {today && <CoachSectionCard section={today} featured />}

      <div className="grid gap-4 lg:grid-cols-2">
        {secondarySections.map(
          (section) => section && <CoachSectionCard key={section.id} section={section} />,
        )}
      </div>

      {report.allRecommendations.length > 3 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              All Signals
            </p>
            <p className="text-[10px] text-muted-foreground">
              {report.allRecommendations.length} rules matched
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {report.allRecommendations.slice(0, 6).map((rec) => (
              <CoachRecommendationCard key={rec.id} recommendation={rec} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
