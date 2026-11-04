-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" TEXT DEFAULT 'DE',
ADD COLUMN     "notificationSettings" JSONB,
ADD COLUMN     "privacySettings" JSONB;

-- CreateTable
CREATE TABLE "PatchInquiry" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "company" TEXT,
    "message" TEXT NOT NULL,
    "recipients" TEXT[] DEFAULT ARRAY['Hafsaoui.Wissal@scheidt-bachmann.de', 'Aloui.Hadil@scheidt-bachmann.de']::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatchInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatchTicket" (
    "id" SERIAL NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "carparkName" TEXT NOT NULL,
    "customerAccount" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "cpqOrderNumber" TEXT,
    "contractNumber" TEXT,
    "numberOfDevices" INTEGER NOT NULL DEFAULT 1,
    "entervoVersion" TEXT NOT NULL,
    "operatingSystem" TEXT NOT NULL,
    "ipAddress1" TEXT NOT NULL,
    "ipAddress2" TEXT,
    "ipAddress3" TEXT,
    "priority" TEXT NOT NULL DEFAULT '3 - Moderate',
    "urgency" TEXT NOT NULL DEFAULT '2 - Medium',
    "category" TEXT NOT NULL DEFAULT 'Service Request',
    "subCategory" TEXT NOT NULL DEFAULT 'entervo.it.security',
    "status" TEXT NOT NULL DEFAULT 'Open',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatchTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatchInquiry_createdAt_idx" ON "PatchInquiry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PatchTicket_ticketNumber_key" ON "PatchTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "PatchTicket_ticketNumber_idx" ON "PatchTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "PatchTicket_createdAt_idx" ON "PatchTicket"("createdAt");

