-- Written to be re-runnable: some databases got these columns and tables
-- from `prisma db push` before this migration existed, and adding them
-- again failed with "column already exists" (P3018).
-- AlterTable
ALTER TABLE "PatchTicket" ADD COLUMN IF NOT EXISTS "remoteAccess" TEXT;
