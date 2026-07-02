import { Medal } from "lucide-react";

import { getDepartmentSummary } from "@/app/actions/department";
import { getPersonalBestBoard } from "@/app/actions/personal-bests";
import { PbPageClient } from "@/components/pbs/pb-page-client";
import { PageHeader } from "@/components/ui/page-header";
import { CORE_PB_COUNT } from "@/lib/pb-catalog";
import { HYROX_CORE_PB_COUNT } from "@/lib/hyrox/pb-catalog";
import { requireUser } from "@/lib/auth";

export default async function PersonalBestsPage() {
  const user = await requireUser();
  const { activeView } = await getDepartmentSummary(user.id);
  const { items, stats } = await getPersonalBestBoard(user.id, activeView);
  const isHyrox = activeView === "hyrox";

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
      <PageHeader
        title={isHyrox ? "Hyrox Personal Bests" : "Personal Bests"}
        subtitle={
          isHyrox
            ? `Track ${HYROX_CORE_PB_COUNT} core Hyrox PBs — stations, running splits, and race finish times.`
            : `Track ${CORE_PB_COUNT}+ core PBs across strength, engine, gymnastics & benchmarks — see how you improve over time.`
        }
        icon={Medal}
        accentIcon
      />

      {items.length === 0 ? (
        <div className="surface p-10 text-center">
          <Medal className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-medium text-foreground">Couldn&apos;t load PB catalog</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            Your database is configured, but the app couldn&apos;t read PB definitions. Restart the dev
            server after changing <code className="text-lime">.env.local</code>, then refresh this page.
          </p>
        </div>
      ) : (
        <PbPageClient items={items} stats={stats} activeView={activeView} />
      )}
    </div>
  );
}
