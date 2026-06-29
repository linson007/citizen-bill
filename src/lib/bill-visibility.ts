import { BillStatus } from "@/generated/prisma/enums";

export const PUBLIC_BILL_STATUSES = [
  BillStatus.PUBLISHED,
  BillStatus.UNDER_DISCUSSION,
  BillStatus.READY_FOR_REVIEW,
] as const;

export type BillVisibilityInput = {
  authorId: string;
  status: BillStatus | string;
};

export function isPublicBillStatus(status: BillStatus | string) {
  return PUBLIC_BILL_STATUSES.some((item) => item === status);
}

export function canViewBill(
  bill: BillVisibilityInput,
  userId: string | null | undefined,
) {
  return isPublicBillStatus(bill.status) || bill.authorId === userId;
}
