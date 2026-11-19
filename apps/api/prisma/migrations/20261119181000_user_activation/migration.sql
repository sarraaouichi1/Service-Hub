-- v1.1: invitation links, so a new user can set their own password.
ALTER TABLE "User" ADD COLUMN "activationTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN "activationExpiresAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "User_activationTokenHash_key" ON "User"("activationTokenHash");
