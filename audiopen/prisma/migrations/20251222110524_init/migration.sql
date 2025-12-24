-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "style" TEXT NOT NULL DEFAULT 'DEFAULT',
    "audioPath" TEXT,
    "audioMime" TEXT,
    "durationSec" INTEGER,
    "language" TEXT,
    "rawTranscript" TEXT,
    "transcript" TEXT,
    "title" TEXT,
    "summary" TEXT,
    "noteMd" TEXT,
    "bullets" JSONB,
    "actionItems" JSONB,
    "followUps" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareId" TEXT,
    "error" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Note_shareId_key" ON "Note"("shareId");

-- CreateIndex
CREATE INDEX "Note_ownerKey_createdAt_idx" ON "Note"("ownerKey", "createdAt");

-- CreateIndex
CREATE INDEX "Note_shareId_idx" ON "Note"("shareId");
