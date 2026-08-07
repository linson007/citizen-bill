import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Bot, FileText } from "lucide-react";

import { deleteAiSessionAction } from "@/app/profile/actions";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default async function AiSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { sessionId } = await params;
  const aiSession = await prisma.aiConversation.findFirst({
    where: {
      id: sessionId,
      userId: session.user.id,
    },
    include: {
      bill: true,
    },
  });

  if (!aiSession) {
    notFound();
  }

  const messages = parseMessages(aiSession.messages);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
            AI session
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            {aiSession.title ?? "AI drafting session"}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Saved {aiSession.createdAt.toLocaleDateString("en-IN")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {aiSession.bill ? (
              <Link
                href={`/bills/${aiSession.bill.slug}/edit`}
                className="flex h-10 items-center gap-2 rounded-md bg-accent-solid px-3 text-sm font-semibold text-white"
              >
                <FileText size={16} aria-hidden="true" />
                Continue on bill
              </Link>
            ) : (
              <Link
                href="/bills/new"
                className="flex h-10 items-center gap-2 rounded-md bg-accent-solid px-3 text-sm font-semibold text-white"
              >
                <FileText size={16} aria-hidden="true" />
                Start new bill
              </Link>
            )}
            <form action={deleteAiSessionAction}>
              <input type="hidden" name="sessionId" value={aiSession.id} />
              <button
                type="submit"
                className="h-10 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-semibold text-danger"
              >
                Delete session
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={`rounded-lg border p-5 shadow-sm ${
                message.role === "assistant"
                  ? "border-accent/30 bg-accent-soft"
                  : "border-border bg-surface-raised"
              }`}
            >
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <Bot size={17} aria-hidden="true" />
                {message.role === "assistant" ? "Assistant" : "You"}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-ink-soft">
                {message.content}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function parseMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const candidate = item as Partial<ChatMessage>;
      const role: ChatMessage["role"] =
        candidate.role === "assistant" ? "assistant" : "user";
      const content =
        typeof candidate.content === "string" ? candidate.content : "";

      return {
        role,
        content,
      };
    })
    .filter((message) => message.content.trim().length > 0);
}
