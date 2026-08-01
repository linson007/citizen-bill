const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "from",
  "in",
  "into",
  "nor",
  "of",
  "on",
  "or",
  "the",
  "to",
  "via",
  "with",
]);

/**
 * Formats bill titles for on-screen display.
 * Converts ALL-CAPS Latin titles to title case; leaves mixed-case and
 * non-Latin (e.g. Malayalam) titles unchanged.
 */
export function formatDisplayTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    return trimmed;
  }

  const letters = trimmed.replace(/[^A-Za-z]/g, "");
  if (letters.length === 0) {
    return trimmed;
  }

  const upperCount = letters.replace(/[^A-Z]/g, "").length;
  if (upperCount / letters.length < 0.7) {
    return trimmed;
  }

  const parts = trimmed.toLowerCase().split(/(\s+|[-–—/()])/);
  const wordCount = parts.filter(
    (part) => part && !/^[\s\-–—/()]+$/.test(part),
  ).length;
  let wordIndex = 0;

  return parts
    .map((part) => {
      if (!part || /^[\s\-–—/()]+$/.test(part)) {
        return part;
      }

      const isEdge = wordIndex === 0 || wordIndex === wordCount - 1;
      wordIndex += 1;

      if (!isEdge && SMALL_WORDS.has(part)) {
        return part;
      }

      return part.replace(/^\p{L}/u, (char) => char.toUpperCase());
    })
    .join("");
}
