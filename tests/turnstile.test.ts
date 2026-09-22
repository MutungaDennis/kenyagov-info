import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getTurnstilePublicConfig } from "@/lib/turnstile-config";

describe("Turnstile verification", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "production-secret-for-unit-tests");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_ENABLED", "false");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  it("cannot be disabled in production", async () => {
    expect(getTurnstilePublicConfig().enabled).toBe(true);
    expect(getTurnstilePublicConfig("localhost").enabled).toBe(true);
    expect(await verifyTurnstileToken("")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("skips the widget only for local development hosts", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_ENABLED", "true");
    for (const hostname of ["localhost", "127.0.0.1", "[::1]"]) expect(getTurnstilePublicConfig(hostname).enabled).toBe(false);
    expect(getTurnstilePublicConfig("localhost.example.org").enabled).toBe(true);
    expect(getTurnstilePublicConfig("citizenguide.ke").enabled).toBe(true);
  });
  it("rejects production test keys without a network request", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "1x0000000000000000000000000000000AA");
    expect(await verifyTurnstileToken("token")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("requires valid hostname, action and success", async () => {
    for (const result of [
      { success: false },
      { success: true, hostname: "attacker.example", action: "turnstile-spin-v2" },
      { success: true, hostname: "www.citizenguide.ke", action: "different-form" },
    ]) {
      fetchMock.mockResolvedValueOnce(Response.json(result));
      expect(await verifyTurnstileToken("token")).toBe(false);
    }
    fetchMock.mockResolvedValueOnce(Response.json({ success: true, hostname: "www.citizenguide.ke", action: "turnstile-spin-v2" }));
    expect(await verifyTurnstileToken("token")).toBe(true);
  });
  it("rejects duplicate tokens and network failures", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ success: false, "error-codes": ["timeout-or-duplicate"] }));
    expect(await verifyTurnstileToken("token")).toBe(false);
    fetchMock.mockRejectedValueOnce(new Error("timeout"));
    expect(await verifyTurnstileToken("token")).toBe(false);
  });
  it("still calls siteverify for local test keys", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_ENABLED", "true");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "1x0000000000000000000000000000000AA");
    fetchMock.mockResolvedValueOnce(Response.json({ success: false }));
    expect(await verifyTurnstileToken("arbitrary-long-string")).toBe(false);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
