export function getSavedBillButtonLabel(isSaved: boolean) {
  return isSaved ? "Remove saved bill" : "Save bill";
}

export function getSavedBillEmptyMessage() {
  return "Save public bills to build a personal reading and follow-up list.";
}
