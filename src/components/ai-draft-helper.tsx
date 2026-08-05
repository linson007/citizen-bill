"use client";

import { useState } from "react";
import { Bot, Loader2, Save, Send, Wand2 } from "lucide-react";

import {
  parseAiDraftFieldsFromText,
  type AiDraftFields,
} from "@/lib/ai-draft-fields";
import type { Locale } from "@/lib/locale";

export type { AiDraftFields };

const aiModes = [
  {
    value: "draft",
    label: "Draft bill",
    description: "Turn your problem statement into a complete first draft with a proposed solution, public impact, and bill text.",
    malayalamDescription: "നിങ്ങളുടെ പ്രശ്നവിവരണം നിർദിഷ്ട പരിഹാരം, പൊതുഫലം, ബിൽ വാചകം എന്നിവയുള്ള ആദ്യ ഡ്രാഫ്റ്റാക്കി മാറ്റുക.",
  },
  {
    value: "legal",
    label: "Legal structure",
    description: "Organize the idea into clear clauses, definitions, duties, oversight, and implementation details.",
    malayalamDescription: "ആശയം വ്യക്തമായ വകുപ്പുകൾ, നിർവചനങ്ങൾ, ചുമതലകൾ, മേൽനോട്ടം, നടപ്പാക്കൽ വിശദാംശങ്ങൾ എന്നിവയായി ക്രമീകരിക്കുക.",
  },
  {
    value: "simplify",
    label: "Simplify",
    description: "Rewrite complex policy or legal language in plain, easy-to-understand terms.",
    malayalamDescription: "സങ്കീർണ്ണമായ നയ അല്ലെങ്കിൽ നിയമഭാഷ ലളിതവും എളുപ്പം മനസ്സിലാക്കാവുന്നതുമായ വാക്കുകളിലേക്ക് മാറ്റുക.",
  },
  {
    value: "malayalam",
    label: "Malayalam",
    description: "Translate or adapt the draft into Malayalam while preserving its policy meaning.",
    malayalamDescription: "നയപരമായ അർഥം നിലനിർത്തി ഡ്രാഫ്റ്റ് മലയാളത്തിലേക്ക് വിവർത്തനം ചെയ്യുകയോ രൂപപ്പെടുത്തുകയോ ചെയ്യുക.",
  },
  {
    value: "summary",
    label: "Summarize",
    description: "Create a concise overview of the proposal's purpose, approach, and expected effect.",
    malayalamDescription: "നിർദേശത്തിന്റെ ഉദ്ദേശ്യം, സമീപനം, പ്രതീക്ഷിക്കുന്ന ഫലം എന്നിവയുടെ ചുരുക്കം തയ്യാറാക്കുക.",
  },
  {
    value: "arguments",
    label: "Arguments",
    description: "Explore balanced supporting points, concerns, and questions to help strengthen the proposal.",
    malayalamDescription: "നിർദേശം കൂടുതൽ ശക്തമാക്കാൻ പിന്തുണയ്ക്കുന്ന വാദങ്ങൾ, ആശങ്കകൾ, ചോദ്യങ്ങൾ എന്നിവ സമതുലിതമായി പരിശോധിക്കുക.",
  },
] as const;

type AiMode = (typeof aiModes)[number]["value"];

export function AiDraftHelper({
  title,
  problem,
  onInsert,
  billId,
  locale = "en",
}: {
  title: string;
  problem: string;
  onInsert?: (fields: AiDraftFields) => void;
  billId?: string;
  locale?: Locale;
}) {
  const ml = locale === "ml";
  const modeLabels: Record<AiMode, string> = ml
    ? { draft: "ബിൽ ഡ്രാഫ്റ്റ്", legal: "നിയമ ഘടന", simplify: "ലളിതമാക്കുക", malayalam: "മലയാളം", summary: "സംഗ്രഹിക്കുക", arguments: "വാദങ്ങൾ" }
    : Object.fromEntries(aiModes.map(({ value, label }) => [value, label])) as Record<AiMode, string>;
  const [prompt, setPrompt] = useState(problem);
  const [mode, setMode] = useState<AiMode>("draft");
  const [result, setResult] = useState("");
  const [fields, setFields] = useState<AiDraftFields | null>(null);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [saveHistory, setSaveHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  function getDefaultErrorMessage(status: number) {
    if (status === 401) {
      return "Please log in to use the AI assistant.";
    }

    if (status === 429) {
      return "Daily AI limit reached. Try again after the limit resets.";
    }

    return "Unable to generate a draft right now.";
  }

  async function readErrorMessage(response: Response) {
    try {
      const data = (await response.json()) as { error?: string };
      return data.error || getDefaultErrorMessage(response.status);
    } catch {
      return getDefaultErrorMessage(response.status);
    }
  }

  async function runAssistant() {
    const userMessage = prompt.trim();
    if (!userMessage) {
      return;
    }

    setLoading(true);
    setResult("");
    setFields(null);

    const nextMessages = [
      ...messages,
      {
        role: "user" as const,
        content: userMessage,
      },
    ];
    setMessages(nextMessages);

    const response = await fetch("/api/ai/draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, prompt, mode }),
    });

    if (!response.ok) {
      const message = await readErrorMessage(response);
      setResult(message);
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: message,
        },
      ]);
      setLoading(false);
      return;
    }

    const data = (await response.json()) as {
      text?: string;
      fields?: AiDraftFields | null;
    };
    setResult(data.text ?? "Unable to generate a draft right now.");
    setFields(data.fields ?? null);
    setMessages([
      ...nextMessages,
      {
        role: "assistant",
        content: data.text ?? "Unable to generate a draft right now.",
      },
    ]);
    setPrompt("");
    setLoading(false);
  }

  async function sendChatMessage() {
    const userMessage = prompt.trim();
    if (!userMessage) {
      return;
    }

    setLoading(true);
    setResult("");
    setFields(null);

    const nextMessages = [
      ...messages,
      {
        role: "user" as const,
        content: userMessage,
      },
    ];
    setMessages([
      ...nextMessages,
      {
        role: "assistant",
        content: "",
      },
    ]);
    setPrompt("");

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        billId,
        messages: nextMessages,
        mode,
        saveHistory,
        title,
      }),
    });

    if (!response.ok) {
      const message = await readErrorMessage(response);
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: message,
        },
      ]);
      setResult(message);
      setLoading(false);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let assistantText = "";

    if (!reader) {
      setLoading(false);
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      assistantText += decoder.decode(value, { stream: true });
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: assistantText,
        },
      ]);
    }

    setResult(assistantText);
    if (mode === "draft" || mode === "legal") {
      setFields(parseAiDraftFieldsFromText(assistantText));
    }
    setLoading(false);
  }

  return (
    <section className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-accent-soft text-accent">
          <Bot size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold">{ml ? "AI ഡ്രാഫ്റ്റിംഗ് സഹായി" : "AI drafting assistant"}</h2>
          <p className="text-sm text-ink-muted">
            {ml ? "ബിൽ ആശയം ഡ്രാഫ്റ്റ് ചെയ്യുക, തിരുത്തുക, വിവർത്തനം ചെയ്യുക, സംഗ്രഹിക്കുക, അല്ലെങ്കിൽ പരിശോധിക്കുക." : "Draft, revise, translate, summarize, or stress-test a bill idea."}
          </p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {aiModes.map((item) => (
          <span key={item.value} className="group relative">
            <button
              type="button"
              onClick={() => setMode(item.value)}
              aria-describedby={`ai-mode-${item.value}-description`}
              className={`h-9 w-full rounded-md border px-2 text-xs font-semibold ${
                mode === item.value
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border-strong bg-surface-raised text-ink-soft"
              }`}
            >
              {modeLabels[item.value]}
            </button>
            <span
              id={`ai-mode-${item.value}-description`}
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-md bg-hero-ink px-3 py-2 text-left text-xs font-normal leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            >
              {ml ? item.malayalamDescription : item.description}
            </span>
          </span>
        ))}
      </div>

      {messages.length > 0 ? (
        <div className="mb-3 max-h-80 space-y-3 overflow-y-auto rounded-md border border-border bg-surface p-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-md px-3 py-2 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-surface-raised text-ink-soft"
                  : "bg-accent-soft text-accent"
              }`}
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em]">
                {message.role === "user" ? (ml ? "നിങ്ങൾ" : "You") : (ml ? "സഹായി" : "Assistant")}
              </p>
              <p className="whitespace-pre-wrap">
                {message.content || (ml ? "എഴുതുന്നു..." : "Writing...")}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        rows={5}
        placeholder={ml ? "ബിൽ ആശയം ഡ്രാഫ്റ്റ് ചെയ്യാനോ മെച്ചപ്പെടുത്താനോ സംഗ്രഹിക്കാനോ വിവർത്തനം ചെയ്യാനോ പരിശോധിക്കാനോ സഹായിയോട് ചോദിക്കുക." : "Ask the assistant to draft, improve, summarize, translate, or review your bill idea."}
        className="w-full resize-y rounded-md border border-border-strong bg-surface-raised px-3 py-3 text-sm leading-6 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
      />
      <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-ink-muted">
        <input
          type="checkbox"
          checked={saveHistory}
          onChange={(event) => setSaveHistory(event.target.checked)}
          className="mt-1"
        />
        {ml ? "ഈ AI സംഭാഷണം എന്റെ ഡ്രാഫ്റ്റിംഗ് ചരിത്രത്തിൽ സേവ് ചെയ്യുക." : "Save this AI conversation to my drafting history."}
      </label>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={sendChatMessage}
          disabled={loading || prompt.trim().length < 5}
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} aria-hidden="true" />
          ) : (
            <Send size={16} aria-hidden="true" />
          )}
          {loading ? (ml ? "എഴുതുന്നു" : "Writing") : (ml ? "ചാറ്റ് അയയ്ക്കുക" : "Send chat")}
        </button>
        <button
          type="button"
          onClick={runAssistant}
          disabled={loading || prompt.trim().length < 5}
          className="flex h-10 items-center justify-center gap-2 rounded-md border border-border-strong bg-surface-raised px-4 text-sm font-semibold text-ink-soft shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} aria-hidden="true" />
          ) : (
            <Bot size={16} aria-hidden="true" />
          )}
          {ml ? "ഘടനയുള്ള ഡ്രാഫ്റ്റ്" : "Structured draft"}
        </button>
      </div>

      {result ? (
        <div className="mt-4 rounded-md bg-surface p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink-soft">
              {ml ? "നിർദേശിച്ച ഡ്രാഫ്റ്റ്" : "Suggested draft"}
            </p>
            {fields && onInsert ? (
              <button
                type="button"
                onClick={() => onInsert(fields)}
                className="flex h-8 items-center gap-1.5 rounded-md bg-accent px-2.5 text-xs font-semibold text-white"
              >
                {fields.proposedSolution || fields.expectedImpact ? (
                  <Wand2 size={14} aria-hidden="true" />
                ) : (
                  <Save size={14} aria-hidden="true" />
                )}
                {ml ? "ഫോമിലേക്ക് ചേർക്കുക" : "Insert into form"}
              </button>
            ) : null}
          </div>
          <pre className="whitespace-pre-wrap text-sm leading-6 text-ink-soft">
            {result}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
