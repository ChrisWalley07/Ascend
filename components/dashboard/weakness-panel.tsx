import { ArrowDownRight, ArrowUpRight, Target, TrendingDown, TrendingUp } from "lucide-react";

import {
  ATTRIBUTE_LABELS,
  ICON_BY_ATTRIBUTE,
  type WeaknessReport,
} from "@/features/weakness-detection";
import { AppIcon } from "@/components/ui/app-icon";
import { EmptyState } from "@/components/ui/empty-state";
import type { IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

type Props = {
  report: WeaknessReport | null;
  className?: string;
};

const SEVERITY_STYLES = {
  critical: "border-red-500/30 bg-red-500/10 text-red-300",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  moderate: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  low: "border-blue-500/30 bg-blue-500/10 text-blue-300",
} as const;

function AttributeChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral" | "improved" | "regressed";
}) {
  const toneStyles = {
    positive: "border-lime/25 bg-lime/8 text-lime",
    negative: "border-amber-500/25 bg-amber-500/8 text-amber-300",
    neutral: "border-white/10 bg-white/5 text-foreground",
    improved: "border-emerald-500/25 bg-emerald-500/8 text-emerald-300",
    regressed: "border-red-500/25 bg-red-500/8 text-red-300",
  };

  const icons = {
    positive: TrendingUp,
    negative: Target,
    neutral: Target,
    improved: ArrowUpRight,
    regressed: ArrowDownRight,
  };

  const Icon = icons[tone];

  return (
    <div className={cn("rounded-2xl border px-3 py-2.5", toneStyles[tone])}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

export function WeaknessPanel({ report, className }: Props) {
  if (!report) {
    return (
      <section className={cn("surface p-5", className)}>
        <EmptyState
          icon={Target}
          title="Weakness analysis unavailable"
          description="Complete your profile and log workouts to unlock weekly attribute detection."
          className="py-10"
        />
      </section>
    );
  }

  const topWeaknesses = report.weaknesses.slice(0, 4);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent p-5 lg:p-6",
        className,
      )}
    >
      <div className="absolute inset-0 gradient-radial-lime pointer-events-none opacity-40" />

      <div className="relative space-y-5">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Weekly Weakness Detection
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{report.weekLabel}</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            {report.overallConfidence}% confidence
          </div>
        </header>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <AttributeChip
            label="Strongest"
            value={ATTRIBUTE_LABELS[report.strongestAttribute]}
            tone="positive"
          />
          <AttributeChip
            label="Weakest"
            value={ATTRIBUTE_LABELS[report.weakestAttribute]}
            tone="negative"
          />
          <AttributeChip
            label="Most Improved"
            value={ATTRIBUTE_LABELS[report.mostImproved]}
            tone="improved"
          />
          <AttributeChip
            label="Most Regressed"
            value={ATTRIBUTE_LABELS[report.mostRegressed]}
            tone="regressed"
          />
        </div>

        {report.priorityList.length > 0 ? (
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Training Priority
            </p>
            <ol className="space-y-2">
              {report.priorityList.slice(0, 5).map((item, index) => (
                <li
                  key={item.category}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-[10px] font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <AppIcon
                        name={ICON_BY_ATTRIBUTE[item.category] as IconName}
                        className="h-3.5 w-3.5 text-muted-foreground"
                      />
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.reason}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="rounded-2xl border border-lime/20 bg-lime/8 px-4 py-3 text-sm text-lime">
            All attributes are within target range this week. Maintain current training balance.
          </div>
        )}

        {topWeaknesses.length > 0 ? (
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Detected Weaknesses
            </p>
            <div className="space-y-3">
              {topWeaknesses.map((weakness) => (
                <article
                  key={weakness.category}
                  className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3.5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <AppIcon
                        name={ICON_BY_ATTRIBUTE[weakness.category] as IconName}
                        className="h-4 w-4 text-muted-foreground"
                      />
                      <h3 className="text-sm font-semibold text-foreground">
                        {ATTRIBUTE_LABELS[weakness.category]}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        SEVERITY_STYLES[weakness.severity],
                      )}
                    >
                      {weakness.severity}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {weakness.confidence}% confidence · score {weakness.currentScore}
                      {weakness.weeklyDelta !== 0 && (
                        <span className={weakness.weeklyDelta > 0 ? " text-emerald-400" : " text-red-400"}>
                          {" "}
                          ({weakness.weeklyDelta > 0 ? "+" : ""}
                          {weakness.weeklyDelta})
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {weakness.recommendation}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={TrendingDown}
            title="No critical weaknesses"
            description="Your attribute scores are balanced. Focus on maintaining your strongest areas."
            className="py-6 border-0 bg-transparent"
          />
        )}
      </div>
    </section>
  );
}
