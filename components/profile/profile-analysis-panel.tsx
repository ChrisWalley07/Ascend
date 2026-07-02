import type { ProfileAnalysis } from "@/lib/athlete-analysis";
import { ScoreRing } from "@/components/ui/score-ring";
import { cn } from "@/lib/utils";

export function ProfileAnalysisPanel({
  analysis,
  athleteName,
}: {
  analysis: ProfileAnalysis | null;
  athleteName?: string;
}) {
  if (!analysis) {
    return (
      <div className="surface p-6 text-center">
        <p className="text-sm text-muted-foreground">Save your profile to see personalised analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="surface p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Profile Analysis
        </p>
        <div className="flex items-center gap-5">
          <ScoreRing score={analysis.completenessPercent} size={100} strokeWidth={8} label="Complete" />
          <div className="space-y-1 min-w-0">
            <p className="text-lg font-bold text-foreground truncate">
              {athleteName ?? "Athlete"}
            </p>
            <p className="text-sm text-muted-foreground">{analysis.trainingMaturityLabel}</p>
            {analysis.bmi !== null && (
              <p className="text-xs text-muted-foreground">
                BMI {analysis.bmi} · {analysis.bmiLabel}
              </p>
            )}
          </div>
        </div>
      </div>

      {analysis.goalAlignmentScore > 0 && (
        <div className="surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Goal Alignment
          </p>
          <p className="text-3xl font-bold tabular-nums text-lime">{analysis.goalAlignmentScore}%</p>
          <p className="text-xs text-muted-foreground mt-1">How well recent training matches your primary goal</p>
        </div>
      )}

      {analysis.missingFields.length > 0 && (
        <div className="surface p-5 border-amber-500/20 bg-amber-500/5">
          <p className="text-sm font-semibold text-amber-400 mb-2">Required fields missing</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {analysis.missingFields.map((field) => (
              <li key={field}>· {field}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.goalInsights.length > 0 && (
        <InsightBlock title="Goal insights" items={analysis.goalInsights} tone="lime" />
      )}

      {analysis.focusGapInsights.length > 0 && (
        <InsightBlock title="Focus vs performance" items={analysis.focusGapInsights} tone="amber" />
      )}

      {analysis.recommendations.length > 0 && (
        <InsightBlock title="Recommendations" items={analysis.recommendations} tone="blue" />
      )}
    </div>
  );
}

function InsightBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "lime" | "amber" | "blue";
}) {
  const styles = {
    lime: "border-lime/20 bg-lime/5",
    amber: "border-amber-500/20 bg-amber-500/5",
    blue: "border-blue-500/20 bg-blue-500/5",
  };

  return (
    <div className={cn("surface p-5 border", styles[tone])}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-muted-foreground leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
