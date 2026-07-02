"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronRight,
  DatabaseBackup,
  Flag,
  Medal,
  PencilLine,
  Plug,
  Route,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import { AscendLogo } from "@/components/brand/ascend-logo";
import { DepartmentSwitcher } from "@/components/department/department-switcher";
import { useSport } from "@/components/sport/sport-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ASCENSION } from "@/lib/ascension/labels";
import type { SportDepartment } from "@prisma/client";

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
        active
          ? "bg-lime/10 text-lime"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-lime" />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active ? "text-lime" : "text-muted-foreground group-hover:text-foreground",
        )}
      />
      {label}
      {active && <ChevronRight className="ml-auto h-3 w-3 text-lime/60" />}
    </Link>
  );
}

export function Sidebar({ sportDepartment }: { sportDepartment: SportDepartment }) {
  const pathname = usePathname();
  const { activeView } = useSport();
  const isHyrox = activeView === "hyrox";

  const workoutHref = isHyrox ? "/workouts/hyrox/new" : "/workouts/new";
  const workoutLabel = isHyrox ? "Log Session" : "Log Workout";

  const primaryNav = [
    { href: "/dashboard", label: "Dashboard", icon: Trophy },
    { href: "/achievements", label: ASCENSION.name, icon: Route },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/pbs", label: "Personal Bests", icon: Medal },
    { href: workoutHref, label: workoutLabel, icon: PencilLine },
    { href: "/goals", label: "Goals", icon: Flag },
  ];

  const secondaryNav = [
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/benchmarks", label: "Benchmarks", icon: Medal },
    { href: "/coach", label: "AI Coach", icon: Sparkles },
    ...(isHyrox ? [{ href: "/hyrox/races", label: "Races", icon: Flag }] : []),
  ];

  const toolsNav = [
    { href: "/integrations", label: "Integrations", icon: Plug },
    { href: "/data", label: "Data Tools", icon: DatabaseBackup },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col w-[220px] shrink-0 min-h-screen bg-sidebar border-r border-sidebar-border"
      role="navigation"
      aria-label="Main navigation"
    >
      <Link href="/dashboard" className="flex items-center px-5 py-6 border-b border-sidebar-border/60">
        <AscendLogo size="sm" showTagline />
      </Link>

      <DepartmentSwitcher currentDepartment={sportDepartment} />

      <div className="flex flex-col gap-6 flex-1 px-3 py-5 overflow-y-auto scrollbar-none">
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              }
            />
          ))}
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Insights
          </p>
          <div className="space-y-0.5">
            {secondaryNav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Tools
          </p>
          <div className="space-y-0.5">
            {toolsNav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname === item.href}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-sidebar-border/60 px-3 py-4">
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground text-xs"
          >
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}
