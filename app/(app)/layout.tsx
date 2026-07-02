import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getSportContextForUser } from "@/app/actions/sport";
import { AppShell } from "@/components/layout/app-shell";
import { SportProvider } from "@/components/sport/sport-provider";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const sportContext = await getSportContextForUser(user.id);

  if (!sportContext) {
    redirect("/onboarding/department");
  }

  return (
    <SportProvider value={sportContext}>
      <AppShell sportContext={sportContext}>{children}</AppShell>
    </SportProvider>
  );
}
