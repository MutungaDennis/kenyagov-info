/// <reference types="vite/client" />
import { describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
const gate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin-api", () => ({ requireAdminApi: gate, slugify: (s: string) => s }));

// Invoke handlers directly: passing tests must not depend on proxy execution.
const routes = import.meta.glob("../app/api/admin/**/route.ts");
describe("every admin handler rejects access before reading input or the database", () => {
  for (const [path, load] of Object.entries(routes)) {
    it(path, async () => {
      const route = await load() as Record<string, (request: NextRequest, context: unknown) => Promise<Response>>;
      for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
        if (!route[method]) continue;
        for (const status of [401, 403]) {
          gate.mockResolvedValue({ ok: false, response: NextResponse.json({ error: "denied" }, { status }) });
          const response = await route[method](new NextRequest("https://www.citizenguide.ke/api/admin/test", { method }), {
            params: Promise.resolve({ id: "id", roleId: "role", articleId: "article", provisionId: "provision" }),
          });
          expect(response.status, `${method} ${path}`).toBe(status);
        }
      }
    }, 30_000);
  }
});
