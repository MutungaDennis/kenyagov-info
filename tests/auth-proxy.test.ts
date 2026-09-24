import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const auth = vi.hoisted(() => ({ user: vi.fn(), isAdmin: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: () => ({ auth: { getClaims: auth.user, signOut: vi.fn() } }) }));
vi.mock("@/lib/supabase/admin-access", () => ({ isAdminUserId: auth.isAdmin }));
import { updateSession } from "@/lib/supabase/auth";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { authMatchers } from "../scripts/sync-middleware-matcher.mjs";

afterEach(() => vi.unstubAllEnvs());

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_ADMIN_BASE_PATH", "/custom-admin");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://unit-test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-unit-test-key");
  auth.user.mockResolvedValue({ data: { claims: { sub: "admin" } }, error: null });
  auth.isAdmin.mockResolvedValue(true);
});

it("keeps password recovery reachable for an authenticated admin", async () => {
  const result = await updateSession(new NextRequest("https://www.citizenguide.ke/custom-admin/reset-password"));
  expect(result.headers.get("location")).toBeNull();
  expect(result.status).toBe(200);
});

it("rejects the filesystem admin path when a custom path is enabled", async () => {
  expect((await updateSession(new NextRequest("https://www.citizenguide.ke/admin"))).status).toBe(404);
});

it("redirects a signed-out user to the configured login path", async () => {
  auth.user.mockResolvedValue({ data: { claims: null }, error: null });
  const result = await updateSession(new NextRequest("https://www.citizenguide.ke/custom-admin/leaders"));
  expect(result.headers.get("location")).toContain("/custom-admin/login");
});

it("does no session or role work on public pages", async () => {
  await updateSession(new NextRequest("https://www.citizenguide.ke/government"));
  expect(auth.user).not.toHaveBeenCalled();
  expect(auth.isAdmin).not.toHaveBeenCalled();
});

it("rejects unauthenticated admin API requests", async () => {
  auth.user.mockResolvedValue({ data: null, error: new Error("Invalid JWT") });
  expect((await updateSession(new NextRequest("https://www.citizenguide.ke/api/admin/schools"))).status).toBe(401);
});

it("matches only protected routes, including a configured admin prefix", () => {
  const config = { matcher: authMatchers({ NEXT_PUBLIC_ADMIN_BASE_PATH: "/custom-admin" }) };
  for (const url of ["/admin", "/admin/leaders", "/api/admin/schools", "/custom-admin/login", "/custom-admin"]) {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), url).toBe(true);
  }
  for (const url of ["/", "/services", "/government", "/topics", "/guides", "/constitution", "/elections", "/open-data", "/help", "/about", "/contact", "/robots.txt", "/sitemap.xml", "/favicon.ico", "/_next/static/app.js", "/_next/image", "/custom-admin/logo.svg"]) {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), url).toBe(false);
  }
});
