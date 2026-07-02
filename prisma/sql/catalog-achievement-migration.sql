-- Catalog achievement persistence (gamification engine completions)
CREATE TABLE IF NOT EXISTS "AthleteCatalogAchievement" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "achievementId" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3) NOT NULL,
  "xpAwarded" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AthleteCatalogAchievement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AthleteCatalogAchievement_userId_achievementId_key"
  ON "AthleteCatalogAchievement"("userId", "achievementId");

CREATE INDEX IF NOT EXISTS "AthleteCatalogAchievement_userId_idx"
  ON "AthleteCatalogAchievement"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AthleteCatalogAchievement_userId_fkey'
  ) THEN
    ALTER TABLE "AthleteCatalogAchievement"
      ADD CONSTRAINT "AthleteCatalogAchievement_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
