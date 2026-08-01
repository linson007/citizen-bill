import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { getOpenAiModel } from "@/lib/ai-config";
import { authOptions } from "@/lib/auth";
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

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const modeInstructions = {
  draft:
    "Create a structured public bill draft from the user's problem statement. Use the exact section headings Short Description, Proposed Solution, Expected Public Impact, and Draft Bill Text.",
  legal:
    "Improve legislative structure with clauses, definitions, duties, oversight, and implementation details. Use the exact section headings Short Description, Proposed Solution, Expected Public Impact, and Draft Bill Text.",
  simplify: "Rewrite in plain public-facing language while preserving meaning.",
  malayalam:
    "Translate and adapt the content into clear Malayalam for public readers in Kerala.",
  summary:
    "Summarize the idea into purpose, affected people, duties, and expected public impact.",
  arguments:
    "Generate supporting arguments and likely objections or risks for public discussion.",
} as const;

type AiMode = keyof typeof modeInstructions;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Login is required to use the AI assistant." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    billId?: string;
    messages?: ChatMessage[];
    mode?: string;
    saveHistory?: boolean;
    title?: string;
  };
  const messages = normalizeMessages(body.messages);
  const mode = isAiMode(body.mode) ? body.mode : "draft";

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 },
    );
  }

  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")
      ?.content ?? "";
  const guardrail = checkAiGuardrails(latestUserMessage);

  if (!guardrail.ok) {
    await logAiSafetyEvent({
      userId: session.user.id,
      billId: body.billId,
      reason: guardrail.reason,
      prompt: latestUserMessage,
    });

    return new Response(guardrail.message, {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "text/plain; charset=utf-8",
      },
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

  const ownedBillId = await resolveOwnedBillId(session.user.id, body.billId);

  const encoder = new TextEncoder();
  let assistantText = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!process.env.OPENAI_API_KEY) {
          for (const chunk of chunkText(createFallbackReply(messages, mode))) {
            assistantText += chunk;
            controller.enqueue(encoder.encode(chunk));
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
        } else {
          const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const completion = await client.chat.completions.create({
            model: getOpenAiModel(),
            stream: true,
            messages: [
              {
                role: "system",
                content: [
                  "You help draft public legislative proposals for Kerala.",
                  guardedSystemInstruction(modeInstructions[mode]),
                  "For draft or legal mode, write each form-ready section under its exact heading. Do not put the whole response under Draft Bill Text.",
                ].join(" "),
              },
              ...messages.map((message) => ({
                role: message.role,
                content: message.content,
              })),
            ],
          });

          for await (const event of completion) {
            const chunk = event.choices[0]?.delta.content ?? "";
            if (chunk) {
              assistantText += chunk;
              controller.enqueue(encoder.encode(chunk));
            }
          }
        }

        await recordAiUsage(session.user.id, "ai-chat");

        if (body.saveHistory) {
          await prisma.aiConversation.create({
            data: {
              billId: ownedBillId,
              userId: session.user.id,
              title: body.title?.trim() || "AI drafting session",
              messages: [
                ...messages,
                {
                  role: "assistant",
                  content: assistantText,
                },
              ],
            },
          });
        }
      } catch {
        controller.enqueue(
          encoder.encode(
            "\n\nThe assistant could not complete this response right now.",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

async function resolveOwnedBillId(userId: string, billId?: string) {
  if (!billId) {
    return null;
  }

  const bill = await prisma.bill.findFirst({
    where: {
      id: billId,
      authorId: userId,
    },
    select: {
      id: true,
    },
  });

  return bill?.id ?? null;
}

async function logAiSafetyEvent({
  userId,
  billId,
  reason,
  prompt,
}: {
  userId?: string;
  billId?: string;
  reason: string;
  prompt: string;
}) {
  await prisma.aiSafetyEvent
    .create({
      data: {
        userId,
        billId,
        reason,
        prompt: prompt.slice(0, 2000),
      },
    })
    .catch(() => undefined);
}

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((message) => {
      const candidate = message as Partial<ChatMessage>;
      const role: ChatMessage["role"] =
        candidate.role === "assistant" ? "assistant" : "user";
      const content =
        typeof candidate.content === "string" ? candidate.content.trim() : "";

      return {
        role,
        content: content.slice(0, 6000),
      };
    })
    .filter((message) => message.content.length > 0)
    .slice(-10);
}

function isAiMode(value: string | undefined): value is AiMode {
  return Boolean(value && value in modeInstructions);
}

function createFallbackReply(messages: ChatMessage[], mode: AiMode) {
  const prompt = messages[messages.length - 1]?.content ?? "";

  if (mode === "summary") {
    return [
      "Purpose: Address the public problem described by the user.",
      "Affected people: Citizens or communities impacted by this issue.",
      "Key duties: Define responsible authorities, reporting duties, and a citizen-facing process.",
      `Input: ${prompt}`,
    ].join("\n\n");
  }

  if (mode === "arguments") {
    return [
      "Supporting arguments:",
      "1. Improves accountability.",
      "2. Creates a clearer public process.",
      "3. Helps citizens compare promises with implementation.",
      "",
      "Possible objections:",
      "1. Implementation cost needs detail.",
      "2. Department responsibility needs clarity.",
      "3. Safeguards may be needed to prevent misuse.",
    ].join("\n");
  }

  if (mode === "malayalam") {
    return [
      "ഈ നിർദേശം പൊതുജനങ്ങളെ ബാധിക്കുന്ന പ്രശ്നം പരിഹരിക്കാൻ വ്യക്തമായ ചുമതലകൾ, സുതാര്യമായ റിപ്പോർട്ടിംഗ്, പൗരന്മാർക്ക് ഉപയോഗിക്കാവുന്ന നടപടിക്രമം എന്നിവ നിർദ്ദേശിക്കുന്നു.",
      "",
      prompt,
    ].join("\n");
  }

  return [
    "Short Description:",
    "A public bill proposal to address the stated problem through clear duties, transparent reporting, and citizen-facing implementation.",
    "",
    "Proposed Solution:",
    "Create defined responsibilities for public authorities, require periodic reporting, provide a citizen access mechanism, and establish review duties.",
    "",
    "Expected Public Impact:",
    "The proposal should improve public accountability and give citizens a clearer way to monitor implementation.",
    "",
    "Draft Bill Text:",
    `Draft outline for: ${prompt}`,
    "",
    "1. Short title, extent, and commencement",
    "2. Statement of purpose",
    prompt,
    "",
    "3. Definitions",
    "4. Duties of public authorities",
    "5. Citizen access and grievance mechanism",
    "6. Oversight and public reporting",
    "7. Rule-making power",
  ].join("\n");
}

function chunkText(value: string) {
  const chunks: string[] = [];

  for (let index = 0; index < value.length; index += 24) {
    chunks.push(value.slice(index, index + 24));
  }

  return chunks;
}
