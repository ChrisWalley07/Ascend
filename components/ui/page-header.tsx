import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accentIcon?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  accentIcon = false,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl shrink-0",
              accentIcon ? "bg-lime/15 ring-1 ring-lime/30" : "bg-white/5",
            )}
          >
            <Icon
              className={cn("h-5 w-5", accentIcon ? "text-lime" : "text-muted-foreground")}
            />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
