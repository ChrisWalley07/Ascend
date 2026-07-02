import { format } from "date-fns";
import { AlertTriangle, ArrowUpRight, Info, Lightbulb, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

type Insight = {
  id: string;
  title: string;
  content: string;
  severity: string;
  createdAt: Date;
};

const severityConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    borderClass: string;
    bgClass: string;
    iconClass: string;
    badge: string;
    badgeClass: string;
  }
> = {
  SUCCESS: {
    icon: TrendingUp,
    borderClass: "border-lime/20",
    bgClass: "bg-lime/5",
    iconClass: "text-lime",
    badge: "Trending Up",
    badgeClass: "bg-lime/10 text-lime",
  },
  WARNING: {
    icon: AlertTriangle,
    borderClass: "border-amber-500/20",
    bgClass: "bg-amber-500/5",
    iconClass: "text-amber-400",
    badge: "Attention",
    badgeClass: "bg-amber-500/10 text-amber-400",
  },
  CRITICAL: {
    icon: AlertTriangle,
    borderClass: "border-red-500/20",
    bgClass: "bg-red-500/5",
    iconClass: "text-red-400",
    badge: "Critical",
    badgeClass: "bg-red-500/10 text-red-400",
  },
  INFO: {
    icon: Info,
    borderClass: "border-blue-500/20",
    bgClass: "bg-blue-500/5",
    iconClass: "text-blue-400",
    badge: "Insight",
    badgeClass: "bg-blue-500/10 text-blue-400",
  },
};

const fallback = {
  icon: Lightbulb,
  borderClass: "border-white/8",
  bgClass: "bg-white/3",
  iconClass: "text-muted-foreground",
  badge: "Note",
  badgeClass: "bg-white/8 text-muted-foreground",
};

export function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {insights.map((insight) => {
        const cfg = severityConfig[insight.severity.toUpperCase()] ?? fallback;
        const Icon = cfg.icon;

        return (
          <div
            key={insight.id}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.01]",
              cfg.borderClass,
              cfg.bgClass,
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5", cfg.iconClass)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold text-foreground leading-tight">{insight.title}</p>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", cfg.badgeClass)}>
                    {cfg.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{insight.content}</p>
                <p className="mt-3 text-[10px] text-muted-foreground/50">
                  {format(insight.createdAt, "MMM d, yyyy")}
                </p>
              </div>
            </div>

            {/* Subtle hover arrow */}
            <ArrowUpRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground/20 transition-all group-hover:text-muted-foreground/40" />
          </div>
        );
      })}
    </div>
  );
}
