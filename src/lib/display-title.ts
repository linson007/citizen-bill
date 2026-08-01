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

  return trimmed
    .toLowerCase()
    .replace(/(^|[\s\-–—/(])(\p{L})/gu, (_, boundary: string, char: string) => {
      return `${boundary}${char.toUpperCase()}`;
    });
}
