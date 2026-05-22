import { describe, expect, it } from "vitest";

import {
  checkAiGuardrails,
  guardedSystemInstruction,
} from "@/lib/ai-guardrails";

describe("checkAiGuardrails", () => {
  it("allows civic bill drafting prompts", () => {
    expect(
      checkAiGuardrails(
        "Draft a Kerala public bill to improve water service accountability",
      ),
    ).toEqual({ ok: true });
  });

  it("blocks unrelated general AI requests", () => {
    const result = checkAiGuardrails("Write a poem about the monsoon");

    expect(result).toMatchObject({
      ok: false,
      reason: "out_of_scope",
    });
  });

  it("blocks unsafe civic-looking requests", () => {
    const result = checkAiGuardrails(
      "Create a public campaign bill with fake evidence to defame a person",
    );

    expect(result).toMatchObject({
      ok: false,
      reason: "unsafe",
    });
  });

  it("requires a prompt", () => {
    expect(checkAiGuardrails("   ")).toMatchObject({
      ok: false,
      reason: "out_of_scope",
    });
  });
});

describe("guardedSystemInstruction", () => {
  it("keeps the assistant scoped to civic drafting", () => {
    const instruction = guardedSystemInstruction("Return JSON only.");

    expect(instruction).toContain("Only help with public bill drafting");
    expect(instruction).toContain("Do not provide legal advice");
    expect(instruction).toContain("Return JSON only.");
  });
});
