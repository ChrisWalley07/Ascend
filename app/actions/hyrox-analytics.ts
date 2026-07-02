"use server";

import { getHyroxAnalyticsForUser } from "@/features/analytics";

export async function getHyroxAnalyticsData(userId: string) {
  return getHyroxAnalyticsForUser(userId);
}
