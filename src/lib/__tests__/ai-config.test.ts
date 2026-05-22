import { describe, expect, it } from "vitest";

import { DEFAULT_OPENAI_MODEL, getOpenAiModel } from "@/lib/ai-config";

describe("getOpenAiModel", () => {
  it("uses the default model when no model is configured", () => {
    expect(getOpenAiModel({})).toBe(DEFAULT_OPENAI_MODEL);
  });

  it("uses the configured model when present", () => {
    expect(getOpenAiModel({ OPENAI_MODEL: "gpt-4.1" })).toBe("gpt-4.1");
  });

  it("trims whitespace and falls back for blank values", () => {
    expect(getOpenAiModel({ OPENAI_MODEL: "  gpt-4.1-mini  " })).toBe(
      "gpt-4.1-mini",
    );
    expect(getOpenAiModel({ OPENAI_MODEL: "   " })).toBe(DEFAULT_OPENAI_MODEL);
  });
});
