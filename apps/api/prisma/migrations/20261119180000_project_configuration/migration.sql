-- Written to be re-runnable: some databases got these columns and tables
-- from `prisma db push` before this migration existed, and adding them
-- again failed with "column already exists" (P3018).
-- v1.1: keep the submitted configuration with the project, and who submitted it.
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "data" JSONB;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
CREATE INDEX IF NOT EXISTS "Project_createdById_idx" ON "Project"("createdById");
