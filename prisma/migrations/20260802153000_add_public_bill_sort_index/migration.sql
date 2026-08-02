CREATE INDEX "Bill_status_publishedAt_updatedAt_idx"
ON "Bill"("status", "publishedAt" DESC, "updatedAt" DESC);
