import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js uses .env.local; load it for Prisma CLI too
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prefer DIRECT_URL for prisma db push on Vercel; app runtime still uses DATABASE_URL pooler.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
