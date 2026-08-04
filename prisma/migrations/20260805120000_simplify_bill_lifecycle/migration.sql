-- Keep already public proposals public while retiring automatic engagement states.
UPDATE "Bill"
SET "status" = 'PUBLISHED'
WHERE "status" IN ('UNDER_DISCUSSION', 'READY_FOR_REVIEW');

CREATE TYPE "BillStatus_new" AS ENUM (
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
  'REPORTED',
  'REMOVED',
  'SUBMITTED_TO_MLA',
  'INTRODUCED_AS_PRIVATE_BILL',
  'REJECTED',
  'PASSED'
);

ALTER TABLE "Bill" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Bill"
  ALTER COLUMN "status" TYPE "BillStatus_new"
  USING "status"::text::"BillStatus_new";

DROP TYPE "BillStatus";
ALTER TYPE "BillStatus_new" RENAME TO "BillStatus";
ALTER TABLE "Bill" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
