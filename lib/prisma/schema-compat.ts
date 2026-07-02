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
