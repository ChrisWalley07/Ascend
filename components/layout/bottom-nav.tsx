"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Medal, PencilLine, Route, Trophy, User } from "lucide-react";

import { useSport } from "@/components/sport/sport-provider";
import { ASCENSION } from "@/lib/ascension/labels";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { activeView } = useSport();
  const workoutHref = activeView === "hyrox" ? "/workouts/hyrox/new" : "/workouts/new";

  const mobileNav = [
    { href: "/dashboard", label: "Home", icon: Trophy },
    { href: "/achievements", label: ASCENSION.navLabel, icon: Route },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/pbs", label: "PBs", icon: Medal },
    { href: workoutHref, label: "Log", icon: PencilLine },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-white/8 bg-background/90 backdrop-blur-xl"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex h-full items-center justify-around px-2">
        {mobileNav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1"
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-lime" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-lime" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
