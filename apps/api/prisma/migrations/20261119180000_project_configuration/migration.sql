-- v1.1: keep the submitted configuration with the project, and who submitted it.
ALTER TABLE "Project" ADD COLUMN "data" JSONB;
ALTER TABLE "Project" ADD COLUMN "createdById" TEXT;
CREATE INDEX "Project_createdById_idx" ON "Project"("createdById");
