import { cache } from "react";
import { redirect } from "next/navigation";

import { ensureDbUser } from "@/lib/ensure-db-user";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

const syncUserToDatabase = cache(async (userId: string) => {
  const user = await getCurrentUser();
  if (user?.id === userId) {
    await ensureDbUser(user);
  }
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await syncUserToDatabase(user.id);
  return user;
}
