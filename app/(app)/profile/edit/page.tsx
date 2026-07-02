import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";

import { getAthleteProfileData } from "@/app/actions/profile";
import { getUserSportDepartment } from "@/app/actions/department";
import { AthleteProfileForm } from "@/components/profile/athlete-profile-form";
import { DepartmentSwitcher } from "@/components/department/department-switcher";
import { ProfileAnalysisPanel } from "@/components/profile/profile-analysis-panel";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { APP_NAME } from "@/lib/brand";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function ProfileEditPage() {
  const user = await requireUser();
  const sportDepartment = await getUserSportDepartment(user.id);
  if (!sportDepartment) {
    redirect("/onboarding/department");
  }
  const { profile, analysis } = await getAthleteProfileData(user.id);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to profile
        </Link>
      </div>

      <PageHeader
        title="Profile settings"
        subtitle="Update your athlete details, goals, and training context."
        icon={User}
        accentIcon
      />

      <div className="surface rounded-2xl lg:hidden">
        <DepartmentSwitcher currentDepartment={sportDepartment} compact />
      </div>

      {!profile?.profileCompleted && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm text-amber-200/90">
          Fill in all required fields below. {APP_NAME} uses this to analyse how you&apos;re training
          vs your goals and adjust your athlete score.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AthleteProfileForm profile={profile} sportDepartment={sportDepartment} />
        </div>
        <div className="lg:col-span-2">
          <ProfileAnalysisPanel analysis={analysis} athleteName={profile?.name} />
        </div>
      </div>
    </div>
  );
}
