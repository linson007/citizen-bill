export const OTHER_BILL_CATEGORY = "__other__";

export const billCategories = [
  "Agriculture",
  "Animal Husbandry",
  "Co-operation",
  "Culture",
  "Education",
  "Environment",
  "Finance",
  "Fisheries",
  "Food and Civil Supplies",
  "Forest",
  "Health",
  "Higher Education",
  "Home",
  "Industries",
  "Information Technology",
  "Labour",
  "Law",
  "Local Self Government",
  "Public Works",
  "Revenue",
  "Scheduled Castes and Scheduled Tribes Development",
  "Social Justice",
  "Tourism",
  "Transport",
  "Water Resources",
  "Women and Child Development",
  OTHER_BILL_CATEGORY,
] as const;

export function resolveBillCategory({
  category,
  categoryOther,
}: {
  category?: string | null;
  categoryOther?: string | null;
}) {
  const selectedCategory = category?.trim();
  const customCategory = categoryOther?.trim();

  if (selectedCategory === OTHER_BILL_CATEGORY) {
    return customCategory || undefined;
  }

  return selectedCategory || undefined;
}

export function isKnownBillCategory(value: string | null | undefined) {
  return Boolean(
    value &&
    billCategories.some(
      (category) => category !== OTHER_BILL_CATEGORY && category === value,
    ),
  );
}
