import { billCategories, OTHER_BILL_CATEGORY } from "@/lib/bill-categories";

export type AiDraftFields = {
  title: string;
  description: string;
  category: string;
  categoryOther: string;
  tags: string;
  problem: string;
  proposedSolution: string;
  expectedImpact: string;
  body: string;
  references: string;
};

export type AiTitleCategorySuggestion = {
  title: string;
  category: string;
};

const fieldHeadings = [
  { key: "title", patterns: ["title", "bill title"] },
  {
    key: "description",
    patterns: ["short description", "description", "summary"],
  },
  { key: "category", patterns: ["category"] },
  { key: "categoryOther", patterns: ["other category"] },
  { key: "tags", patterns: ["tags", "keywords"] },
  { key: "problem", patterns: ["problem statement", "problem"] },
  {
    key: "proposedSolution",
    patterns: ["proposed solution", "solution"],
  },
  {
    key: "expectedImpact",
    patterns: ["expected public impact", "expected impact", "public impact"],
  },
  {
    key: "body",
    patterns: ["draft bill text", "bill text", "draft bill", "clauses"],
  },
  { key: "references", patterns: ["references", "supporting links"] },
] as const;

type FieldKey = (typeof fieldHeadings)[number]["key"];

export function parseAiDraftFieldsFromText(
  value: string,
): AiDraftFields | null {
  const text = value.trim();

  if (!text) {
    return null;
  }

  const sections = findSections(text);

  if (sections.size === 0) {
    return null;
  }

  const fields: AiDraftFields = {
    title: sections.get("title") ?? "",
    description: sections.get("description") ?? "",
    category: sections.get("category") ?? "",
    categoryOther: sections.get("categoryOther") ?? "",
    tags: sections.get("tags") ?? "",
    problem: sections.get("problem") ?? "",
    proposedSolution: sections.get("proposedSolution") ?? "",
    expectedImpact: sections.get("expectedImpact") ?? "",
    body: sections.get("body") ?? "",
    references: sections.get("references") ?? "",
  };

  if (!fields.description && fields.body) {
    fields.description = fields.body.split("\n")[0].slice(0, 300);
  }

  return fields;
}

export function parseAiTitleCategorySuggestion(
  value: string,
): AiTitleCategorySuggestion | null {
  try {
    const parsed = JSON.parse(value) as {
      title?: unknown;
      category?: unknown;
    };
    const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
    const category = normalizeSuggestedCategory(parsed.category);

    if (!title || !category) {
      return null;
    }

    return { title: title.slice(0, 200), category };
  } catch {
    return null;
  }
}

export function normalizeSuggestedCategory(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (normalized.toLowerCase() === "other") {
    return OTHER_BILL_CATEGORY;
  }

  return (
    billCategories.find(
      (category) =>
        category !== OTHER_BILL_CATEGORY &&
        category.toLowerCase() === normalized.toLowerCase(),
    ) ?? null
  );
}

function findSections(text: string) {
  const lines = text.split(/\r?\n/);
  const sections = new Map<FieldKey, string>();
  let currentKey: FieldKey | null = null;
  let buffer: string[] = [];

  function flush() {
    if (!currentKey) {
      return;
    }

    const content = buffer.join("\n").trim();
    if (content) {
      sections.set(currentKey, content);
    }
  }

  for (const line of lines) {
    const heading = matchHeading(line);

    if (heading) {
      flush();
      currentKey = heading.key;
      buffer = heading.inlineValue ? [heading.inlineValue] : [];
      continue;
    }

    if (currentKey) {
      buffer.push(line);
    }
  }

  flush();

  return sections;
}

function matchHeading(
  line: string,
): { key: FieldKey; inlineValue: string } | null {
  const normalized = line
    .trim()
    .replace(/^\d+[\).:-]\s*/, "")
    .replace(/^#+\s*/, "");

  for (const heading of fieldHeadings) {
    for (const pattern of heading.patterns) {
      const expression = new RegExp(
        `^${escapeRegExp(pattern)}\\s*[:\\-–—]?\\s*(.*)$`,
        "i",
      );
      const match = normalized.match(expression);

      if (match) {
        return {
          key: heading.key,
          inlineValue: match[1].trim(),
        };
      }
    }
  }

  return null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
