import { Plug } from "lucide-react";

import { getStravaStatus } from "@/app/actions/strava";
import { StravaConnectCard } from "@/components/integrations/strava-connect-card";
import { PageHeader } from "@/components/ui/page-header";
import { APP_NAME } from "@/lib/brand";
import { requireUser } from "@/lib/auth";

type Props = {
  searchParams: Promise<{ connected?: string; error?: string }>;
};

export default async function IntegrationsPage({ searchParams }: Props) {
  const user = await requireUser();
  const status = await getStravaStatus(user.id);
  const params = await searchParams;

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
      <PageHeader
        title="Integrations"
        subtitle={`Connect external apps to keep ${APP_NAME} in sync with how you train.`}
        icon={Plug}
        accentIcon
      />

      {params.connected && (
        <div className="rounded-xl border border-lime/25 bg-lime/8 px-4 py-3 text-sm text-lime">
          Strava connected successfully. Your recent activities are being imported.
        </div>
      )}

      {params.error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-300">
          Could not connect Strava: {decodeURIComponent(params.error.replace(/\+/g, " "))}
        </div>
      )}

      <div className="max-w-2xl">
        <StravaConnectCard status={status} />
      </div>

      <p className="max-w-2xl text-xs text-muted-foreground">
        Imported Strava workouts appear in your workout log with a Strava note. Duplicate activities
        are skipped automatically. Disconnecting removes the link but keeps imported workouts.
      </p>
    </div>
  );
}
