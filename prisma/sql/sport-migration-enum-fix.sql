-- Run ONLY if sport-migration.sql failed at step 6 (enum cast error).
-- Safe to run after steps 1–5 already applied.

DO $$
BEGIN
  -- Clean up leftover type from a failed attempt
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SportDepartment_new') THEN
    DROP TYPE "SportDepartment_new";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'SportDepartment' AND e.enumlabel IN ('RUNNING', 'TRIATHLON')
  ) THEN
    CREATE TYPE "SportDepartment_new" AS ENUM ('CROSSFIT', 'HYROX', 'HYBRID');

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
