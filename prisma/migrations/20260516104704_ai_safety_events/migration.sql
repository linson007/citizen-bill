-- CreateTable
CREATE TABLE "AiSafetyEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "billId" TEXT,
    "reason" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSafetyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiSafetyEvent_userId_idx" ON "AiSafetyEvent"("userId");

-- CreateIndex
CREATE INDEX "AiSafetyEvent_billId_idx" ON "AiSafetyEvent"("billId");

-- CreateIndex
CREATE INDEX "AiSafetyEvent_reason_idx" ON "AiSafetyEvent"("reason");

-- AddForeignKey
ALTER TABLE "AiSafetyEvent" ADD CONSTRAINT "AiSafetyEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
