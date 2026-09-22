import { describe, expect, it } from "vitest";
import { matchesSearch, scoreSearch } from "@/lib/search/match";
import { rankResults, resultHref, type SearchHit } from "@/lib/search/results";
import { fetchDirectoryPages } from "@/lib/search/fetch-pages";

describe("directory search relevance", () => {
  it.each([
    ["minstry educaton", "Ministry of Education"],
    ["Allaince High", "ALLIANCE HIGH"],
    ["passprot", "Apply for a passport"],
    ["  education   ministry  ", "Ministry of Education"],
    ["K.R.A.", "KRA"],
    ["Naiorbi", "Nairobi County"],
    ["O'Brien", "O’Brien"],
  ])("finds %s despite spelling, punctuation or word order", (query, title) => {
    expect(matchesSearch(query, title)).toBe(true);
  });
  it("requires every meaningful word and exact numbers", () => {
    expect(matchesSearch("Article 47", "Article 470")).toBe(false);
    expect(matchesSearch("Article 47", "Article 74")).toBe(false);
    expect(matchesSearch("Education Health", "Ministry of Education")).toBe(false);
    expect(matchesSearch("MAGENCHE ALLIANCE", "ALLIANCE HIGH")).toBe(false);
  });
  it("matches across directory fields", () => {
    expect(matchesSearch("nairobi governor", "Sakaja Johnson", ["Governor", "Nairobi"])).toBe(true);
  });
  it("puts exact names ahead of typo matches", () => {
    expect(scoreSearch("Nairobi", "Nairobi")).toBeGreaterThan(scoreSearch("Nairobi", "Naiorbi County"));
  });
});

describe("combined site results", () => {
  it("loads records beyond the default 1,000-row response limit", async () => {
    const result = await fetchDirectoryPages(async from => ({ data: from === 0 ? Array.from({ length: 1000 }, (_, id) => ({ id })) : [{ id: 1000 }], error: null }));
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1001);
  });
  it("reports a failed later page instead of silently showing an incomplete directory", async () => {
    const result = await fetchDirectoryPages(async from => from === 0 ? { data: Array.from({ length: 1000 }, (_, id) => ({ id })), error: null } : { data: null, error: { message: "offline" } });
    expect(result.error?.message).toBe("offline");
    expect(result.data).toEqual([]);
  });
  const hit = (name: string, slug: string, entity_type = "Institution"): SearchHit => ({ name, slug, entity_type, base_route: "/government/institutions", rank: 0.8 });
  it("filters before limiting so matching schools are not displaced by other types", () => {
    const hits = [...Array.from({ length: 30 }, (_, i) => hit(`Alliance body ${i}`, `body-${i}`)), hit("Alliance High", "alliance-high", "School")];
    expect(rankResults("Alliance", hits, "School", 5)).toHaveLength(1);
    expect(rankResults("Alliance", hits, "School", 5)[0].slug).toBe("alliance-high");
  });
  it("deduplicates canonical URLs and prioritizes an exact acronym slug", () => {
    const hits = [hit("IEBC services", "services"), hit("Independent Electoral and Boundaries Commission", "iebc"), hit("IEBC", "iebc")];
    const result = rankResults("IEBC", hits);
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("iebc");
  });
  it("builds valid ward and constituency destinations and rejects unsafe paths", () => {
    expect(resultHref({ slug: "parklands/about", base_route: "/government/counties/wards" })).toBe("/government/counties/wards/parklands/about");
    expect(resultHref({ slug: "", base_route: "/government/counties/wards?constituency=Westlands" })).toContain("?constituency=Westlands");
    expect(resultHref({ slug: "", base_route: "", path: "//evil.example" })).toBe("/search");
    expect(resultHref({ slug: "", base_route: "", path: "javascript:alert(1)" })).toBe("/search");
  });
});
