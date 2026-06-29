-- CreateTable
CREATE TABLE "BillSignature" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillSignature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillSignature_billId_userId_key" ON "BillSignature"("billId", "userId");

-- CreateIndex
CREATE INDEX "BillSignature_userId_idx" ON "BillSignature"("userId");

-- CreateIndex
CREATE INDEX "BillSignature_createdAt_idx" ON "BillSignature"("createdAt");

-- AddForeignKey
ALTER TABLE "BillSignature" ADD CONSTRAINT "BillSignature_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSignature" ADD CONSTRAINT "BillSignature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
