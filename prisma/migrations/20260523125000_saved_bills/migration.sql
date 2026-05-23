-- CreateTable
CREATE TABLE "SavedBill" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedBill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedBill_billId_userId_key" ON "SavedBill"("billId", "userId");

-- CreateIndex
CREATE INDEX "SavedBill_userId_idx" ON "SavedBill"("userId");

-- CreateIndex
CREATE INDEX "SavedBill_createdAt_idx" ON "SavedBill"("createdAt");

-- AddForeignKey
ALTER TABLE "SavedBill" ADD CONSTRAINT "SavedBill_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedBill" ADD CONSTRAINT "SavedBill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
