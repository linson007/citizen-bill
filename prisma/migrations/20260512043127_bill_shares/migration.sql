-- CreateTable
CREATE TABLE "BillShare" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BillShare_billId_idx" ON "BillShare"("billId");

-- CreateIndex
CREATE INDEX "BillShare_platform_idx" ON "BillShare"("platform");

-- CreateIndex
CREATE INDEX "BillShare_createdAt_idx" ON "BillShare"("createdAt");

-- AddForeignKey
ALTER TABLE "BillShare" ADD CONSTRAINT "BillShare_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
