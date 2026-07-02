import { Flag } from "lucide-react";

import { HyroxRaceForm } from "@/components/hyrox/hyrox-race-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";

export default async function NewHyroxRacePage() {
  await requireUser();

  return (
    <div className="min-h-screen">
      <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-2xl space-y-6">
        <PageHeader
          title="Log Hyrox Race"
          subtitle="Record finish time, splits, and race details for predictions and station analytics."
          icon={Flag}
          accentIcon
        />
        <HyroxRaceForm />
      </div>
    </div>
  );
}
