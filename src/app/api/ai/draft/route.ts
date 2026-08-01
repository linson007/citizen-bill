import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { authOptions } from "@/lib/auth";
import { getOpenAiModel } from "@/lib/ai-config";
import {
  checkAiGuardrails,
  guardedSystemInstruction,
} from "@/lib/ai-guardrails";
import {
  checkAiUsageLimit,
  createAiUsageHeaders,
  createAiUsageLimitMessage,
  recordAiUsage,
} from "@/lib/ai-usage-limit";
import { prisma } from "@/lib/prisma";

type StructuredDraft = {
  description: string;
  proposedSolution: string;
  expectedImpact: string;
  body: string;
};

const modes = {
  draft:
    "Create a structured public bill draft from the problem statement. Return JSON fields for direct form insertion.",
  legal:
    "Rewrite the idea into clearer legislative structure with clauses, definitions, duties, oversight, and rule-making sections. Return JSON fields for direct form insertion.",
  simplify:
    "Rewrite the input in plain public-facing language. Keep it accurate, short, and easy to understand.",
  malayalam:
    "Translate and adapt the input into clear Malayalam for public readers in Kerala. Preserve the meaning and avoid legal overclaiming.",
  summary:
    "Summarize the bill idea into purpose, affected people, key duties, and expected public impact.",
  arguments:
    "Generate practical supporting arguments and likely objections or risks for public discussion.",
} as const;

type AiMode = keyof typeof modes;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Login is required to use the AI assistant." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    title?: string;
    prompt?: string;
    mode?: string;
  };
  const title = body.title?.trim() || "Public Bill";
  const prompt = body.prompt?.trim() || "";
  const mode = isAiMode(body.mode) ? body.mode : "draft";

  if (!prompt) {
    return NextResponse.json({
      text: "Add a problem statement first.",
      fields: null,
    });
  }

  const guardrail = checkAiGuardrails(`${title}\n${prompt}`);
  if (!guardrail.ok) {
    await logAiSafetyEvent({
      userId: session.user.id,
      reason: guardrail.reason,
      prompt: `${title}\n${prompt}`,
    });

    return NextResponse.json({
      text: guardrail.message,
      fields: null,
      blocked: true,
      reason: guardrail.reason,
    });
  }

  const usage = await checkAiUsageLimit(session.user.id);
  if (!usage.ok) {
    return NextResponse.json(
      {
        error: createAiUsageLimitMessage(usage),
        limit: usage.limit,
        remaining: usage.remaining,
        resetAt: usage.resetAt.toISOString(),
      },
      {
        status: 429,
        headers: createAiUsageHeaders(usage),
      },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    await recordAiUsage(session.user.id, "ai-draft");

    if (mode !== "draft" && mode !== "legal") {
      return NextResponse.json({
        text: createFallbackText(title, prompt, mode),
        fields: null,
      });
    }

    const fields = createFallbackFields(title, prompt, mode);

    return NextResponse.json({
      text: formatDraftPreview(title, prompt, fields),
      fields,
    });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: getOpenAiModel(),
      messages: [
        {
          role: "system",
          content: guardedSystemInstruction(modes[mode]),
        },
        {
          role: "user",
          content: buildPrompt(title, prompt, mode),
        },
      ],
      response_format:
        mode === "draft" || mode === "legal"
          ? { type: "json_object" }
          : { type: "text" },
    });

    await recordAiUsage(session.user.id, "ai-draft");

    const raw = completion.choices[0]?.message.content ?? "{}";

    if (mode !== "draft" && mode !== "legal") {
      return NextResponse.json({
        text: raw.trim() || createFallbackText(title, prompt, mode),
        fields: null,
      });
    }

    const fields =
      parseStructuredDraft(raw) ?? createFallbackFields(title, prompt, mode);

    return NextResponse.json({
      text: formatDraftPreview(title, prompt, fields),
      fields,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "The AI drafting service is unavailable right now. Please try again shortly.",
      },
      { status: 502 },
    );
  }
}

async function logAiSafetyEvent({
  userId,
  reason,
  prompt,
}: {
  userId?: string;
  reason: string;
  prompt: string;
}) {
  await prisma.aiSafetyEvent
    .create({
      data: {
        userId,
        reason,
        prompt: prompt.slice(0, 2000),
      },
    })
    .catch(() => undefined);
}

function isAiMode(value: string | undefined): value is AiMode {
  return Boolean(value && value in modes);
}

function buildPrompt(title: string, prompt: string, mode: AiMode) {
  if (mode === "draft" || mode === "legal") {
    return [
      `Bill title: ${title}`,
      `Task: ${modes[mode]}`,
      `Problem statement:\n${prompt}`,
      "",
      "Return only valid JSON with these string keys:",
      "description, proposedSolution, expectedImpact, body.",
      "Keep the description concise. The body should be a structured draft bill outline with clauses.",
    ].join("\n");
  }

  return [
    `Bill title: ${title}`,
    `Task: ${modes[mode]}`,
    `Input:\n${prompt}`,
    "",
    "Return concise, useful text. Do not return JSON.",
  ].join("\n");
}

function parseStructuredDraft(value: string): StructuredDraft | null {
  try {
    const parsed = JSON.parse(value) as Partial<StructuredDraft>;

    if (
      typeof parsed.description !== "string" ||
      typeof parsed.proposedSolution !== "string" ||
      typeof parsed.expectedImpact !== "string" ||
      typeof parsed.body !== "string"
    ) {
      return null;
    }

    return {
      description: parsed.description,
      proposedSolution: parsed.proposedSolution,
      expectedImpact: parsed.expectedImpact,
      body: parsed.body,
    };
  } catch {
    return null;
  }
}

function createFallbackFields(
  title: string,
  prompt: string,
  mode: "draft" | "legal",
): StructuredDraft {
  const legalPrefix =
    mode === "legal"
      ? "A legally structured public bill proposal with clear definitions, duties, oversight, and implementation powers."
      : "A public bill proposal to address the stated problem through clear duties, accountability, and citizen-facing implementation.";

  return {
    description: legalPrefix,
    proposedSolution:
      "Create defined responsibilities for public authorities, require transparent reporting, provide a citizen access mechanism, and establish review duties for implementation.",
    expectedImpact:
      "The proposal should improve public accountability, make services easier to monitor, and give citizens a clearer way to understand whether the law is being implemented.",
    body: [
      `Draft Bill: ${title}`,
      "",
      "1. Short title, extent, and commencement",
      "This Act may be called by the title above, extend to the relevant area, and come into force on a date notified by the Government.",
      "",
      "2. Statement of purpose",
      prompt,
      "",
      "3. Definitions",
      "Define the public authority, affected service, citizen access mechanism, reporting period, and any responsible officer.",
      "",
      "4. Duties of public authorities",
      "Public authorities shall maintain, update, and publish the information or service standards required to address the problem.",
      "",
      "5. Citizen access and grievance mechanism",
      "Citizens shall have a clear process to access information, raise concerns, and receive time-bound responses.",
      "",
      "6. Oversight and reporting",
      "The responsible department shall publish periodic reports and review implementation gaps.",
      "",
      "7. Rule-making power",
      "The Government may make rules to carry out the provisions of this Act.",
    ].join("\n"),
  };
}

function createFallbackText(title: string, prompt: string, mode: AiMode) {
  if (mode === "simplify") {
    return [
      `Simple version of ${title}`,
      "",
      "This proposal asks public authorities to address the problem clearly, publish useful information, respond to citizens, and review whether the solution is working.",
      "",
      `Problem: ${prompt}`,
    ].join("\n");
  }

  if (mode === "malayalam") {
    return [
      `${title}`,
      "",
      "ഈ നിർദേശം പൊതുജനങ്ങൾക്ക് ബാധിക്കുന്ന പ്രശ്നം പരിഹരിക്കാൻ സർക്കാർ/പൊതു അധികാരികൾക്ക് വ്യക്തമായ ചുമതലകൾ നൽകണമെന്ന് ആവശ്യപ്പെടുന്നു.",
      "",
      `പ്രശ്നം: ${prompt}`,
    ].join("\n");
  }

  if (mode === "summary") {
    return [
      `Summary: ${title}`,
      "",
      `Purpose: Address the public problem described by the author.`,
      `Affected people: Citizens or communities impacted by this issue.`,
      `Key idea: Create clear duties, transparent reporting, and a citizen-facing process.`,
      `Input: ${prompt}`,
    ].join("\n");
  }

  if (mode === "arguments") {
    return [
      `Discussion points for ${title}`,
      "",
      "Supporting arguments:",
      "1. Improves public accountability.",
      "2. Gives citizens a clearer process to seek action.",
      "3. Creates measurable duties for authorities.",
      "",
      "Possible objections or risks:",
      "1. Implementation cost may need detail.",
      "2. Responsibility between departments may need clarity.",
      "3. The proposal may need safeguards against misuse.",
    ].join("\n");
  }

  return formatDraftPreview(
    title,
    prompt,
    createFallbackFields(title, prompt, "draft"),
  );
}

function formatDraftPreview(
  title: string,
  prompt: string,
  fields: StructuredDraft,
) {
  return [
    `Title: ${title}`,
    "",
    "Problem Statement:",
    prompt,
    "",
    "Short Description:",
    fields.description,
    "",
    "Proposed Solution:",
    fields.proposedSolution,
    "",
    "Expected Public Impact:",
    fields.expectedImpact,
    "",
    "Draft Bill Text:",
    fields.body,
  ].join("\n");
}
