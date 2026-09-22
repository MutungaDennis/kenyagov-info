import { beforeEach, describe, expect, it, vi } from "vitest";
const source = vi.hoisted(() => ({ pages: vi.fn(), content: vi.fn() }));
vi.mock("@/lib/data/site-search-pages.utils", () => ({ searchStaticPages: source.pages }));
vi.mock("@/lib/sanity/client", () => ({ searchSanityContent: source.content }));
import { searchSite } from "@/lib/search/search";
import type { SupabaseClient } from "@supabase/supabase-js";
beforeEach(() => { source.pages.mockResolvedValue([]); source.content.mockResolvedValue([]); });
describe("independent search sources", () => {
  it("still returns database results when the static index is unavailable", async () => {
    source.pages.mockRejectedValue(new Error("offline"));
    const rpc = vi.fn().mockResolvedValue({ data: [{ name: "ALLIANCE HIGH", slug: "alliance-high", base_route: "/government/institutions", entity_type: "School", rank: 8 }], error: null });
    const result = await searchSite({ rpc } as unknown as SupabaseClient, "Allaince High", "School");
    expect(result.partialFailure).toBe(true);
    expect(result.results[0].slug).toBe("alliance-high");
    expect(rpc).toHaveBeenCalledWith("search_public", expect.objectContaining({ filter_type: "School" }));
  });
  it("does not leak other content types into a filtered fallback", async () => {
    source.pages.mockResolvedValue([{ name: "Passport guide", slug: "passport", base_route: "/guides", entity_type: "Guide", rank: 1 }]);
    const rpc = vi.fn().mockResolvedValue({ error: { message: "offline" } });
    const result = await searchSite({ rpc } as unknown as SupabaseClient, "passport", "School");
    expect(result.results).toEqual([]);
    expect(result.partialFailure).toBe(true);
  });
  it("avoids database requests for punctuation-only searches", async () => {
    const rpc = vi.fn();
    expect((await searchSite({ rpc } as unknown as SupabaseClient, " % , ( ) ")).results).toEqual([]);
    expect(rpc).not.toHaveBeenCalled();
  });
});
