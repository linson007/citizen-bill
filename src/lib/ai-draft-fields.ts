export type AiDraftFields = {
  description: string;
  proposedSolution: string;
  expectedImpact: string;
  body: string;
};

const fieldHeadings = [
  {
    key: "description",
    patterns: ["short description", "description", "summary"],
  },
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
    description: sections.get("description") ?? "",
    proposedSolution: sections.get("proposedSolution") ?? "",
    expectedImpact: sections.get("expectedImpact") ?? "",
    body: sections.get("body") ?? "",
  };

  if (!fields.description && fields.body) {
    fields.description =
      fields.body.split("\n").find(Boolean)?.slice(0, 300) ?? "";
  }

  return Object.values(fields).some(Boolean) ? fields : null;
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
          inlineValue: match[1]?.trim() ?? "",
        };
      }
    }
  }

  return null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
