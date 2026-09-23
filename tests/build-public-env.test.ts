import { describe, expect, it } from "vitest";
// Build tooling is JavaScript and is deliberately kept outside the app bundle.
import { publicBuildDefaults } from "../scripts/build-public-env.mjs";

const defaults = { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test", SUPABASE_SERVICE_ROLE_KEY: "must-never-copy", NEXT_PUBLIC_SANITY_DATASET: "production" };
describe("Cloudflare public build configuration", () => {
  it("supplies the public pair to CI without copying secrets", () => {
    const result = publicBuildDefaults({}, defaults);
    expect(result.NEXT_PUBLIC_SUPABASE_URL).toBe(defaults.NEXT_PUBLIC_SUPABASE_URL);
    expect(result.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe("sb_publishable_test");
    expect(result).not.toHaveProperty("SUPABASE_SERVICE_ROLE_KEY");
  });
  it("preserves a complete CI override", () => {
    const result = publicBuildDefaults({ NEXT_PUBLIC_SUPABASE_URL: "https://other.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_other" }, defaults);
    expect(result).not.toHaveProperty("NEXT_PUBLIC_SUPABASE_URL");
    expect(result).not.toHaveProperty("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });
  it("does not combine a partial override with another project's defaults", () => {
    expect(() => publicBuildDefaults({ NEXT_PUBLIC_SUPABASE_URL: "https://other.supabase.co" }, defaults)).toThrow("matching");
  });
  it("rejects a privileged key without exposing its value", () => {
    expect(() => publicBuildDefaults({ NEXT_PUBLIC_SUPABASE_URL: defaults.NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_secret_private" }, defaults)).toThrow("never a privileged secret");
  });
});
