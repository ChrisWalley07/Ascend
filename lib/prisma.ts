import { statSync } from "fs";
import { join } from "path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import { getDatabaseUrl } from "@/lib/supabase/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient | null;
  pool?: Pool;
  clientFingerprint?: string;
};

function getClientFingerprint(): string {
  try {
    const clientMtime = statSync(join(process.cwd(), "node_modules/.prisma/client/index.js")).mtimeMs;
    const schemaMtime = statSync(join(process.cwd(), "prisma/schema.prisma")).mtimeMs;
    return `${clientMtime}:${schemaMtime}`;
  } catch {
    return "0";
  }
}

function createPrismaClient(): PrismaClient | null {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    console.warn("[prisma] DATABASE_URL is not set");
    return null;
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

  globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function invalidatePrismaClientIfStale() {
  const fingerprint = getClientFingerprint();
  if (globalForPrisma.clientFingerprint === fingerprint) return;

  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect();
  }

  globalForPrisma.prisma = undefined;
  globalForPrisma.clientFingerprint = fingerprint;
}

export function getPrismaClient() {
  invalidatePrismaClientIfStale();

  if (globalForPrisma.prisma !== undefined) {
    return globalForPrisma.prisma;
  }

  try {
    globalForPrisma.prisma = createPrismaClient();
  } catch (error) {
    console.error("[prisma] Failed to initialize client:", error);
    globalForPrisma.prisma = null;
  }

  return globalForPrisma.prisma;
}
