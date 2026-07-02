import Link from "next/link";
import { ArrowRight, BarChart3, Medal, Sparkles, Trophy } from "lucide-react";

import { AscendLogo } from "@/components/brand/ascend-logo";
import { HomeDepartmentSection } from "@/components/department/home-department-section";
import { buttonVariants } from "@/components/ui/button";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Trophy,
    title: "Athlete Score",
    description: "Eight performance categories scored from your real training data.",
  },
  {
    icon: Medal,
    title: "Personal Bests",
    description: "Track PRs automatically — from barbells to benchmark WODs.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "See trends, volume, and where you're gaining or slipping.",
  },
  {
    icon: Sparkles,
    title: "AI Coach",
    description: "Profile-aware insights that adapt as you log more sessions.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-background to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[520px] w-[720px] rounded-full opacity-20 blur-[100px] bg-lime" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/">
            <AscendLogo size="md" showTagline />
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "sm" }), "bg-lime text-black hover:bg-lime/90")}
              >
                Dashboard
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "sm" }), "bg-lime text-black hover:bg-lime/90")}
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </header>

        {/* Hero */}
        <main className="flex flex-1 flex-col items-center justify-center py-16 text-center lg:py-24">
          <AscendLogo size="hero" layout="vertical" showTagline className="mb-10" />

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Train harder.
            <br />
            Track smarter.
            <br />
            <span className="text-lime">Keep ascending.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {APP_DESCRIPTION}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "lg" }), "bg-lime px-8 text-black hover:bg-lime/90")}
              >
                Open dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "lg" }), "bg-lime px-8 text-black hover:bg-lime/90")}
                >
                  Create free account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  Log in
                </Link>
              </>
            )}
          </div>

          {!user && <HomeDepartmentSection />}

          {/* Features */}
          <div className="mt-20 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="surface rounded-2xl p-5 text-left transition-colors hover:border-lime/20"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-lime/10 ring-1 ring-lime/20">
                  <Icon className="h-5 w-5 text-lime" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </main>

        <footer className="border-t border-white/8 py-6 text-center text-[11px] text-muted-foreground/60">
          © 2025 {APP_NAME} — For athletes who keep rising.
        </footer>
      </div>
    </div>
  );
}
