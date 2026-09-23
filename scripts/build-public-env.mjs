/**
 * Resolve only public build defaults; never copy runtime secrets into a build.
 * @param {Record<string, string | undefined>} env
 * @param {Record<string, string | undefined>} vars
 * @returns {Record<string, string>}
 */
export function publicBuildDefaults(env, vars) {
  /** @type {Record<string, string>} */
  const result = {};
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  // Treat the URL and key as a pair. Never combine one project's CI override
  // with another project's repository default.
  if (!url && !key) {
    result.NEXT_PUBLIC_SUPABASE_URL = vars.NEXT_PUBLIC_SUPABASE_URL;
    const name = vars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
    result[name] = vars[name];
  }
  const resolved = { ...env, ...result };
  const resolvedUrl = resolved.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const resolvedKey = resolved.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || resolved.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!resolvedUrl || !resolvedKey || resolvedUrl.includes("placeholder.supabase.co")) {
    throw new Error("Build requires NEXT_PUBLIC_SUPABASE_URL and a matching public Supabase key. Set both in Cloudflare build variables.");
  }
  // Catch privileged-key mistakes without ever logging the supplied value.
  let publicKey = resolvedKey.startsWith("sb_publishable_");
  if (!publicKey) {
    try { publicKey = JSON.parse(Buffer.from(resolvedKey.split(".")[1], "base64url").toString()).role === "anon"; } catch { /* invalid key */ }
  }
  if (!publicKey) throw new Error("The Supabase build key must be an anon/publishable key, never a privileged secret.");
  for (const name of ["NEXT_PUBLIC_SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_DATASET", "NEXT_PUBLIC_ADMIN_BASE_PATH", "NEXT_PUBLIC_SANITY_STUDIO_URL", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"]) {
    if (!env[name]?.trim() && typeof vars[name] === "string") result[name] = vars[name];
  }
  return result;
}
