-- Run this in Supabase → SQL Editor, then restart your dev server.
-- Fixes: activeSportView, Workout.sport, Goal.sport, and related Hyrox schema.

-- 1. Add HYBRID to enum (safe if already exists)
ALTER TYPE "SportDepartment" ADD VALUE IF NOT EXISTS 'HYBRID';

-- 2. Migrate deprecated sport modes before enum cleanup
UPDATE "AthleteProfile"
SET "sportDepartment" = 'HYROX'
WHERE "sportDepartment"::text IN ('RUNNING', 'TRIATHLON');

-- 3. Add missing columns
ALTER TABLE "AthleteProfile" ADD COLUMN IF NOT EXISTS "activeSportView" "SportDepartment";

ALTER TABLE "Workout" ADD COLUMN IF NOT EXISTS "sport" "SportDepartment";
UPDATE "Workout" SET "sport" = 'CROSSFIT' WHERE "sport" IS NULL;
ALTER TABLE "Workout" ALTER COLUMN "sport" SET DEFAULT 'CROSSFIT';
ALTER TABLE "Workout" ALTER COLUMN "sport" SET NOT NULL;

ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS "sport" "SportDepartment";
ALTER TABLE "Benchmark" ADD COLUMN IF NOT EXISTS "sport" "SportDepartment";

-- 4. Hyrox workout type enum + workout fields
DO $$ BEGIN
  CREATE TYPE "HyroxWorkoutType" AS ENUM (
    'RACE_SIMULATION',
    'STATION_PRACTICE',
    'RUNNING_SESSION',
    'INTERVALS',
    'STRENGTH',
    'RECOVERY',
    'MOBILITY',
    'CUSTOM_SESSION'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Workout" ADD COLUMN IF NOT EXISTS "hyroxWorkoutType" "HyroxWorkoutType";
ALTER TABLE "Workout" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

CREATE INDEX IF NOT EXISTS "Workout_userId_sport_date_idx" ON "Workout"("userId", "sport", "date");

-- 5. Hyrox tables
CREATE TABLE IF NOT EXISTS "HyroxRace" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "name" TEXT,
  "raceDate" TIMESTAMP(3) NOT NULL,
  "division" TEXT,
  "ageGroup" TEXT,
  "gender" "Gender",
  "finishTimeSeconds" INTEGER,
  "predictedFinishSeconds" INTEGER,
  "transitionTimeSeconds" INTEGER,
  "weakestStationSlug" TEXT,
  "strongestStationSlug" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HyroxRace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HyroxRaceSplit" (
  "id" TEXT NOT NULL,
  "raceId" TEXT NOT NULL,
  "stationSlug" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "timeSeconds" INTEGER,
  "distanceMeters" DOUBLE PRECISION,
  "pacePerKmSeconds" INTEGER,
  CONSTRAINT "HyroxRaceSplit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HyroxAthleteScore" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "overallScore" DOUBLE PRECISION NOT NULL,
  "runningScore" DOUBLE PRECISION NOT NULL,
  "engineScore" DOUBLE PRECISION NOT NULL,
  "strengthScore" DOUBLE PRECISION NOT NULL,
  "powerScore" DOUBLE PRECISION NOT NULL,
  "gripScore" DOUBLE PRECISION NOT NULL,
  "recoveryScore" DOUBLE PRECISION NOT NULL,
  "workCapacityScore" DOUBLE PRECISION NOT NULL,
  "mobilityScore" DOUBLE PRECISION NOT NULL,
  "mentalScore" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "HyroxAthleteScore_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "HyroxRace_userId_raceDate_idx" ON "HyroxRace"("userId", "raceDate");
CREATE UNIQUE INDEX IF NOT EXISTS "HyroxRaceSplit_raceId_sequence_key" ON "HyroxRaceSplit"("raceId", "sequence");
CREATE INDEX IF NOT EXISTS "HyroxAthleteScore_userId_date_idx" ON "HyroxAthleteScore"("userId", "date");

DO $$ BEGIN
  ALTER TABLE "HyroxRace" ADD CONSTRAINT "HyroxRace_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "HyroxRaceSplit" ADD CONSTRAINT "HyroxRaceSplit_raceId_fkey"
    FOREIGN KEY ("raceId") REFERENCES "HyroxRace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "HyroxAthleteScore" ADD CONSTRAINT "HyroxAthleteScore_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Remove deprecated enum values (RUNNING, TRIATHLON) — only if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'SportDepartment' AND e.enumlabel IN ('RUNNING', 'TRIATHLON')
  ) THEN
    CREATE TYPE "SportDepartment_new" AS ENUM ('CROSSFIT', 'HYROX', 'HYBRID');

    -- Drop defaults before type change (Postgres cannot auto-cast defaults)
    ALTER TABLE "Workout" ALTER COLUMN "sport" DROP DEFAULT;

    ALTER TABLE "AthleteProfile"
      ALTER COLUMN "sportDepartment" TYPE "SportDepartment_new"
      USING ("sportDepartment"::text::"SportDepartment_new");

    ALTER TABLE "AthleteProfile"
      ALTER COLUMN "activeSportView" TYPE "SportDepartment_new"
      USING (
        CASE
          WHEN "activeSportView" IS NULL THEN NULL
          ELSE "activeSportView"::text::"SportDepartment_new"
        END
      );

    ALTER TABLE "Workout"
      ALTER COLUMN "sport" TYPE "SportDepartment_new"
      USING ("sport"::text::"SportDepartment_new");

    ALTER TABLE "Goal"
      ALTER COLUMN "sport" TYPE "SportDepartment_new"
      USING (
        CASE
          WHEN "sport" IS NULL THEN NULL
          ELSE "sport"::text::"SportDepartment_new"
        END
      );

    ALTER TABLE "Benchmark"
      ALTER COLUMN "sport" TYPE "SportDepartment_new"
      USING (
        CASE
          WHEN "sport" IS NULL THEN NULL
          ELSE "sport"::text::"SportDepartment_new"
        END
      );

    DROP TYPE "SportDepartment";
    ALTER TYPE "SportDepartment_new" RENAME TO "SportDepartment";

    ALTER TABLE "Workout" ALTER COLUMN "sport" SET DEFAULT 'CROSSFIT'::"SportDepartment";
  END IF;
END $$;
