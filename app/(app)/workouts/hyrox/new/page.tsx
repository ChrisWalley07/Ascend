import { Flame } from "lucide-react";

import { seedHyroxExercises } from "@/app/actions/hyrox";
import { HyroxWorkoutForm } from "@/components/workouts/hyrox-workout-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";

export default async function NewHyroxWorkoutPage() {
  await requireUser();
  await seedHyroxExercises();

  return (
    <div className="min-h-screen">
      <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-3xl space-y-6">
        <PageHeader
          title="Log Hyrox Session"
          subtitle="Race simulations, station practice, running, and hybrid training."
          icon={Flame}
          accentIcon
        />
        <HyroxWorkoutForm />
      </div>
    </div>
  );
}
