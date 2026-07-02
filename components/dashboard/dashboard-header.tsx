import Link from "next/link";
import { format } from "date-fns";
import type { ReactNode } from "react";

import { SportViewToggle } from "@/components/sport/sport-view-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SportView } from "@/lib/sports/types";

type Props = {
  today: string;
  athleteName: string;
  greeting: string;
  badgeLabel: string;
  badgeIcon: ReactNode;
  activeView: SportView;
  canSwitchViews: boolean;
  logHref: string;
  logLabel: string;
  logIcon: ReactNode;
};

export function DashboardHeader({
  today,
  athleteName,
  greeting,
  badgeLabel,
  badgeIcon,
  activeView,
  canSwitchViews,
  logHref,
  logLabel,
  logIcon,
}: Props) {
  return (
    <div className="sticky top-0 z-20 border-b border-white/7 bg-background/80 backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">{today}</p>
            <span className="inline-flex items-center gap-1 rounded-md bg-lime/10 px-2 py-0.5 text-[10px] font-semibold text-lime ring-1 ring-lime/20">
              {badgeIcon}
              {badgeLabel}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground truncate">
            Hey {athleteName} — <span className="text-lime">{greeting}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SportViewToggle activeView={activeView} canSwitch={canSwitchViews} />
          <Link href={logHref} className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            {logIcon}
            {logLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function formatToday() {
  return format(new Date(), "EEEE, MMMM d");
}
