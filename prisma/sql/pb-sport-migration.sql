-- Sport-specific PB definitions and records
ALTER TABLE "PbDefinition" ADD COLUMN IF NOT EXISTS "sport" "SportDepartment";
ALTER TABLE "PersonalBest" ADD COLUMN IF NOT EXISTS "sport" "SportDepartment" DEFAULT 'CROSSFIT';

UPDATE "PersonalBest" pb
SET "sport" = COALESCE(d."sport", 'CROSSFIT')
FROM "PbDefinition" d
WHERE pb."pbDefinitionId" = d.id AND pb."sport" IS NULL;

CREATE INDEX IF NOT EXISTS "PbDefinition_sport_category_idx" ON "PbDefinition"("sport", "category");
CREATE INDEX IF NOT EXISTS "PersonalBest_userId_sport_idx" ON "PersonalBest"("userId", "sport");
