-- Written to be re-runnable: some databases got these columns and tables
-- from `prisma db push` before this migration existed, and adding them
-- again failed with "column already exists" (P3018).
-- v1.1: invitation links, so a new user can set their own password.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activationTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activationExpiresAt" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "User_activationTokenHash_key" ON "User"("activationTokenHash");
