import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const auth = vi.hoisted(() => ({ user: vi.fn(), isAdmin: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: () => ({ auth: { getUser: auth.user, signOut: vi.fn() } }) }));
vi.mock("@/lib/supabase/admin-access", () => ({ isAdminUserId: auth.isAdmin }));
import { updateSession } from "@/lib/supabase/auth";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_ADMIN_BASE_PATH", "/custom-admin");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://unit-test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-unit-test-key");
  auth.user.mockResolvedValue({ data: { user: { id: "admin" } }, error: null });
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
  auth.user.mockResolvedValue({ data: { user: null }, error: null });
  const result = await updateSession(new NextRequest("https://www.citizenguide.ke/custom-admin/leaders"));
  expect(result.headers.get("location")).toContain("/custom-admin/login");
});
