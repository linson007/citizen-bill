import { describe, expect, it } from "vitest";

import { localeHtmlLang, parseLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

describe("parseLocale", () => {
  it("accepts malayalam and defaults everything else to english", () => {
    expect(parseLocale("ml")).toBe("ml");
    expect(parseLocale("en")).toBe("en");
    expect(parseLocale("fr")).toBe("en");
    expect(parseLocale(undefined)).toBe("en");
  });
});

describe("localeHtmlLang", () => {
  it("maps locales to html lang values", () => {
    expect(localeHtmlLang("ml")).toBe("ml");
    expect(localeHtmlLang("en")).toBe("en");
  });
});

describe("getMessages", () => {
  it("returns localized home CTAs", () => {
    expect(getMessages("en").home.ctaPrimary).toBe("Start a bill");
    expect(getMessages("ml").home.ctaPrimary).toBe("ബിൽ ആരംഭിക്കുക");
  });
});
