-- Weekly intelligence snapshot cache for trend comparisons
CREATE TABLE IF NOT EXISTS "WeeklyIntelligenceSnapshot" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "weekStart" TIMESTAMP(3) NOT NULL,
  "sportKey" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WeeklyIntelligenceSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WeeklyIntelligenceSnapshot_userId_weekStart_sportKey_key"
  ON "WeeklyIntelligenceSnapshot"("userId", "weekStart", "sportKey");

CREATE INDEX IF NOT EXISTS "WeeklyIntelligenceSnapshot_userId_weekStart_idx"
  ON "WeeklyIntelligenceSnapshot"("userId", "weekStart");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'WeeklyIntelligenceSnapshot_userId_fkey'
  ) THEN
    ALTER TABLE "WeeklyIntelligenceSnapshot"
      ADD CONSTRAINT "WeeklyIntelligenceSnapshot_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
