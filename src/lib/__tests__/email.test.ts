import { afterEach, describe, expect, it, vi } from "vitest";

import { sendEmailNotification } from "@/lib/email";

describe("sendEmailNotification", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("skips delivery when no recipient is provided", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    await sendEmailNotification({
      to: null,
      subject: "Hello",
      text: "Body",
    });
    await sendEmailNotification({
      subject: "Hello",
      text: "Body",
    });

    expect(info).not.toHaveBeenCalled();
  });

  it("logs a dev payload when EMAIL_FROM is unset", async () => {
    vi.stubEnv("EMAIL_FROM", "");
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    await sendEmailNotification({
      to: "citizen@example.com",
      subject: "Bill update",
      text: "A bill you follow changed.",
    });

    expect(info).toHaveBeenCalledWith("[email:dev]", {
      to: "citizen@example.com",
      subject: "Bill update",
      text: "A bill you follow changed.",
    });
  });

  it("logs a queued payload when EMAIL_FROM is configured", async () => {
    vi.stubEnv("EMAIL_FROM", "noreply@mattamundo.com");
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    await sendEmailNotification({
      to: "citizen@example.com",
      subject: "Bill update",
      text: "A bill you follow changed.",
    });

    expect(info).toHaveBeenCalledWith("[email:queued-not-sent]", {
      from: "noreply@mattamundo.com",
      to: "citizen@example.com",
      subject: "Bill update",
    });
  });
});
