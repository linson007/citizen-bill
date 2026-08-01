const civicTerms = [
  "act",
  "amendment",
  "bill",
  "budget",
  "bylaw",
  "civic",
  "clause",
  "community",
  "constitution",
  "governance",
  "government",
  "grievance",
  "kerala",
  "law",
  "legal",
  "legislation",
  "local body",
  "municipality",
  "panchayat",
  "policy",
  "public",
  "regulation",
  "rights",
  "rule",
  "service",
  "welfare",
];

const allowedPublicServiceTerms = [
  "agriculture",
  "bus",
  "climate",
  "education",
  "electricity",
  "environment",
  "food",
  "health",
  "hospital",
  "housing",
  "medicine",
  "police",
  "pollution",
  "road",
  "school",
  "transport",
  "waste",
  "water",
];

const unrelatedPatterns = [
  /\b(write|compose)\s+(a\s+)?(poem|song|story|novel|joke)\b/i,
  /\b(debug|fix|write)\s+(my\s+)?(code|javascript|python|java|css|html|sql)\b/i,
  /\b(marketing|sales|seo|advertisement|ad copy|resume|cover letter)\b/i,
  /\b(recipe|workout|diet plan|travel itinerary)\b/i,
  /\bcrypto|stock trading|forex\b/i,
];

const unsafePatterns = [
  /\b(hate|dehumanize|genocide|ethnic cleansing)\b/i,
  /\b(defame|false allegation|fake evidence|smear campaign)\b/i,
  /\b(dox|personal data|aadhaar|passport number|phone numbers?|home address)\b/i,
  /\b(evade law|bribe|fraud|forge|impersonate)\b/i,
  /\b(hack|malware|phishing|exploit)\b/i,
  /\b(violence|kill|assault|bomb|weapon)\b/i,
];

export type AiGuardrailResult =
  | { ok: true }
  | { ok: false; reason: "unsafe" | "out_of_scope"; message: string };

export function checkAiGuardrails(input: string): AiGuardrailResult {
  const prompt = input.trim();

  if (!prompt) {
    return {
      ok: false,
      reason: "out_of_scope",
      message: "Add a public problem or bill idea first.",
    };
  }

  if (unsafePatterns.some((pattern) => pattern.test(prompt))) {
    return {
      ok: false,
      reason: "unsafe",
      message:
        "I can only help with safe public bill and civic proposal drafting. I cannot help create harmful, defamatory, privacy-invasive, fraudulent, or violent content.",
    };
  }

  const lowerPrompt = prompt.toLowerCase();
  const isCivic =
    civicTerms.some((term) => lowerPrompt.includes(term)) ||
    allowedPublicServiceTerms.some((term) => lowerPrompt.includes(term));

  if (!isCivic || unrelatedPatterns.some((pattern) => pattern.test(prompt))) {
    return {
      ok: false,
      reason: "out_of_scope",
      message:
        "I can only help with public bill and civic proposal drafting on MattamUndo. Please describe a public problem, policy idea, law, public service issue, or community proposal.",
    };
  }

  return { ok: true };
}

export function guardedSystemInstruction(task: string) {
  return [
    "You are the MattamUndo AI assistant.",
    "Only help with public bill drafting, civic proposals, public policy, governance, public services, rights, legislation, and Kerala civic issues.",
    "If the user asks for unrelated general AI work, refuse briefly and redirect them to a public bill or civic proposal task.",
    "Refuse harmful, defamatory, privacy-invasive, fraudulent, impersonation, violence, hate, hacking, or law-evasion requests.",
    "Do not provide legal advice or claim official authority.",
    "Frame outputs as public discussion drafts that need expert review.",
    task,
  ].join(" ");
}
