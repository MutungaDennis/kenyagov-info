import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), isAdmin: vi.fn(), service: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ getCurrentUser: mocks.getUser }));
vi.mock("@/lib/supabase/admin-access", () => ({ isAdminUserId: mocks.isAdmin }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: mocks.service }));
import { requireAdminApi } from "@/lib/admin-api";

describe("admin authorization", () => {
  beforeEach(() => { vi.resetAllMocks(); });
  it("returns 401 without creating a service client for signed-out users", async () => {
    mocks.getUser.mockResolvedValue(null);
    const result = await requireAdminApi();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
    expect(mocks.isAdmin).not.toHaveBeenCalled();
    expect(mocks.service).not.toHaveBeenCalled();
  });
  it("returns 403 for authenticated non-admin users", async () => {
    mocks.getUser.mockResolvedValue({ id: "ordinary-user" });
    mocks.isAdmin.mockResolvedValue(false);
    const result = await requireAdminApi();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(403);
    expect(mocks.service).not.toHaveBeenCalled();
  });
  it("only authorizes the validated session user", async () => {
    const user = { id: "admin-user" };
    const client = {};
    mocks.getUser.mockResolvedValue(user);
    mocks.isAdmin.mockResolvedValue(true);
    mocks.service.mockReturnValue(client);
    expect(await requireAdminApi()).toEqual({ ok: true, user, supabase: client });
    expect(mocks.isAdmin).toHaveBeenCalledWith(user.id);
  });
});
