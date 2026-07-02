import { redirect } from "next/navigation";

import { getUserSportDepartment } from "@/app/actions/department";
import { AscendLogo } from "@/components/brand/ascend-logo";
import { DepartmentPicker } from "@/components/department/department-picker";
import { requireUser } from "@/lib/auth";

export default async function DepartmentOnboardingPage() {
  const user = await requireUser();
  const department = await getUserSportDepartment(user.id);

  if (department) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-background to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[480px] w-[640px] rounded-full opacity-15 blur-[100px] bg-lime" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-8 lg:px-8">
        <AscendLogo size="md" showTagline className="mb-10" />

        <div className="flex flex-1 flex-col justify-center pb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Choose your mode
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            ASCEND adapts your dashboard, benchmarks, and coaching to your sport. Choose CrossFit,
            Hyrox, or Hybrid to train both — you can change mode anytime in Settings.
          </p>

          <div className="mt-8">
            <DepartmentPicker variant="onboarding" />
          </div>
        </div>
      </div>
    </div>
  );
}
