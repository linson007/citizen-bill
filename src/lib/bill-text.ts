export type BillSection = {
  id: string;
  title: string;
};

export const BILL_SECTION_ID_PREFIX = "bill-section-";

const READING_WORDS_PER_MINUTE = 200;
const BILL_TEXT_HEADING_PATTERN = /^(?:#{1,3}\s+|\*\*)(.+?)(?:\*\*)?$/;

export function countBillTextWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function estimateReadingTimeMinutes(text: string): number {
  const words = countBillTextWords(text);

  if (words === 0) {
    return 0;
  }

  return Math.ceil(words / READING_WORDS_PER_MINUTE);
}

export function splitBillTextParagraphs(text: string): string[] {
  return text.split(/\n{2,}/);
}

export function matchBillTextHeading(paragraph: string): string | null {
  const match = paragraph.match(BILL_TEXT_HEADING_PATTERN);

  return match ? match[1] : null;
}

export function billSectionId(index: number): string {
  return `${BILL_SECTION_ID_PREFIX}${index}`;
}

export function extractBillSections(text: string): BillSection[] {
  const sections: BillSection[] = [];

  for (const paragraph of splitBillTextParagraphs(text)) {
    const title = matchBillTextHeading(paragraph);

    if (title) {
      sections.push({
        id: billSectionId(sections.length),
        title,
      });
    }
  }

  return sections;
}

export function isBillSectionHash(hash: string): boolean {
  return hash.startsWith(`#${BILL_SECTION_ID_PREFIX}`);
}
