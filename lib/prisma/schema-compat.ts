function isPbSportClientMismatch(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const name = (error as { name?: string }).name;
  const message = String((error as { message?: string }).message ?? "");
  return (
    name === "PrismaClientValidationError" &&
    (message.includes("Unknown argument `sport`") ||
      message.includes("Unknown field `sport`"))
  );
}

/** True when Prisma client or DB is missing sport-aware PB columns. */
export function isMissingSchemaError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = (error as { code?: string }).code;
  const message = String((error as { message?: string }).message ?? "");
  if (code === "P2022" || code === "P2021") return true;
  if (message.includes("does not exist in the current database")) return true;
  return isPbSportClientMismatch(error);
}

export function formatPrismaActionError(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) return fallback;
  const code = (error as { code?: string }).code;
  const message = String((error as { message?: string }).message ?? "");

  if (code === "P2003") {
    return "Your account could not be linked to the database yet. Refresh the page and try again.";
  }
  if (code === "P2002") {
    return "This email is already linked to another account. Try logging in with that account.";
  }
  if (isMissingSchemaError(error)) {
    return "Database setup is incomplete. Run npm run db:sync against your production database.";
  }
  if (message.includes("Can't reach database server")) {
    return "Database connection failed. Check DATABASE_URL in Vercel.";
  }

  return fallback;
}
