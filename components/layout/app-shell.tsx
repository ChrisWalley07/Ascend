import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import type { SportContext } from "@/lib/sports/types";

export function AppShell({
  children,
  sportContext,
}: {
  children: React.ReactNode;
  sportContext: SportContext;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sportDepartment={sportContext.athleteType} />
      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
