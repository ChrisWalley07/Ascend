import Link from "next/link";
import { ChartNoAxesCombined, DatabaseBackup, Flag, Medal, PencilLine, Sparkles, Trophy } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import { AscendLogo } from "@/components/brand/ascend-logo";
import { Button, buttonVariants } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard">
          <AscendLogo size="sm" />
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <Trophy className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/workouts/new" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <PencilLine className="mr-2 h-4 w-4" />
            Log
          </Link>
          <Link href="/goals" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <Flag className="mr-2 h-4 w-4" />
            Goals
          </Link>
          <Link href="/benchmarks" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <Medal className="mr-2 h-4 w-4" />
            Benchmarks
          </Link>
          <Link href="/analytics" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <ChartNoAxesCombined className="mr-2 h-4 w-4" />
            Analytics
          </Link>
          <Link href="/coach" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <Sparkles className="mr-2 h-4 w-4" />
            Coach
          </Link>
          <Link href="/data" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <DatabaseBackup className="mr-2 h-4 w-4" />
            Data
          </Link>
          <form action={signOutAction}>
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
