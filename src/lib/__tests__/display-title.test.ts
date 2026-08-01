import { describe, expect, it } from "vitest";

import { formatDisplayTitle } from "@/lib/display-title";

describe("formatDisplayTitle", () => {
  it("converts ALL-CAPS Latin titles to title case", () => {
    expect(
      formatDisplayTitle("KERALA PROACTIVE TRANSPARENCY AND OPEN DATA BILL"),
    ).toBe("Kerala Proactive Transparency and Open Data Bill");
  });

  it("keeps small words lowercase except at edges", () => {
    expect(formatDisplayTitle("A BILL FOR THE PEOPLE OF KERALA")).toBe(
      "A Bill for the People of Kerala",
    );
  });

  it("leaves mixed-case titles unchanged", () => {
    expect(formatDisplayTitle("Kerala Water Service Bill")).toBe(
      "Kerala Water Service Bill",
    );
  });

  it("preserves separators while title-casing", () => {
    expect(formatDisplayTitle("PUBLIC HEALTH / OPEN DATA BILL")).toBe(
      "Public Health / Open Data Bill",
    );
  });

  it("leaves Malayalam titles unchanged", () => {
    expect(formatDisplayTitle("പൊതു ഡാറ്റാ സുതാര്യതാ ബിൽ")).toBe(
      "പൊതു ഡാറ്റാ സുതാര്യതാ ബിൽ",
    );
  });

  it("trims whitespace", () => {
    expect(formatDisplayTitle("  HELLO WORLD  ")).toBe("Hello World");
  });
});
