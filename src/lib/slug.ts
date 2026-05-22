export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function createUniqueSlug(title: string) {
  const base = slugify(title) || "bill";
  const suffix = Date.now().toString(36);

  return `${base}-${suffix}`;
}
