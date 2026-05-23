-- CreateTable
CREATE TABLE "BillFollow" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillFollow_billId_userId_key" ON "BillFollow"("billId", "userId");

-- CreateIndex
CREATE INDEX "BillFollow_userId_idx" ON "BillFollow"("userId");

-- CreateIndex
CREATE INDEX "BillFollow_createdAt_idx" ON "BillFollow"("createdAt");

-- AddForeignKey
ALTER TABLE "BillFollow" ADD CONSTRAINT "BillFollow_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillFollow" ADD CONSTRAINT "BillFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
