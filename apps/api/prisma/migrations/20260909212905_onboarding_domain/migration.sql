-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "partner" TEXT NOT NULL,
    "pm" TEXT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 6,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "psp" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "product" TEXT NOT NULL DEFAULT 'smart-web-pay',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "vat" TEXT NOT NULL,
    "psp" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "projects" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL,
    "iconColor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "id" TEXT NOT NULL DEFAULT 'platform',
    "platformName" TEXT NOT NULL,
    "supportEmail" TEXT NOT NULL,
    "defaultPM" TEXT NOT NULL,
    "notifyOnSubmit" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnApprove" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnReject" BOOLEAN NOT NULL DEFAULT true,
    "requireDualApproval" BOOLEAN NOT NULL DEFAULT false,
    "autoExportOnApprove" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeout" TEXT NOT NULL DEFAULT '30',
    "exportFormat" TEXT NOT NULL DEFAULT 'json',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingDraft" (
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingDraft_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- AddForeignKey
ALTER TABLE "OnboardingDraft" ADD CONSTRAINT "OnboardingDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
