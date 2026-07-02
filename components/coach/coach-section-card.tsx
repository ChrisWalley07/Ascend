import type { CoachSection } from "@/features/ai-coach";
import { CoachRecommendationCard } from "@/components/coach/coach-recommendation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  section: CoachSection;
  featured?: boolean;
  className?: string;
};

export function CoachSectionCard({ section, featured = false, className }: Props) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent",
        featured ? "p-6 lg:p-7" : "p-5",
        className,
      )}
    >
      <header className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {section.label}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/80 leading-relaxed">{section.description}</p>
      </header>

      {section.recommendation ? (
        <CoachRecommendationCard recommendation={section.recommendation} compact={!featured} />
      ) : (
        <EmptyState
          icon={Lightbulb}
          title="Not enough signal yet"
          description="Log more workouts and recovery data to unlock this section."
          className="py-8 border-0 bg-transparent"
        />
      )}
    </section>
  );
}
