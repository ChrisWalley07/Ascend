import Link from "next/link";
import { redirect } from "next/navigation";

import { AscendLogo } from "@/components/brand/ascend-logo";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function OnboardingStartPage() {
  const user = await requireUser();
  void user;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-background to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[500px] rounded-full opacity-15 blur-[100px] bg-lime" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col px-5 py-8">
        <AscendLogo size="md" className="mb-12" />

        <div className="flex flex-1 flex-col justify-center pb-12 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              You&apos;re set up
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your dashboard is AI-first: check in daily, log workouts in plain English, and get
              one clear focus each day.
            </p>
          </div>

          <ol className="space-y-4">
            {[
              { step: "1", title: "Daily check-in", desc: "Readiness + sleep — 10 seconds" },
              { step: "2", title: "Log a workout", desc: "Describe it; AI categorizes the session" },
              { step: "3", title: "Follow your coach", desc: "One focus area, updated weekly" },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime/15 text-sm font-bold text-lime">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/profile" className={cn(buttonVariants({ variant: "outline" }), "flex-1")}>
              Complete profile
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants(), "flex-1")}>
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
