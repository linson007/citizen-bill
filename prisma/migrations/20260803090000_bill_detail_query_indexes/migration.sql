CREATE INDEX "Comment_billId_createdAt_idx"
ON "Comment"("billId", "createdAt" DESC);

CREATE INDEX "AmendmentSuggestion_billId_createdAt_idx"
ON "AmendmentSuggestion"("billId", "createdAt" DESC);
