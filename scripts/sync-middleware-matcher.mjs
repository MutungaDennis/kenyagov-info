import fs from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

/** @param {Record<string, string | undefined>} env */
export function authMatchers(env) {
  const configured = env.NEXT_PUBLIC_ADMIN_BASE_PATH?.trim();
  const custom = configured ? '/' + configured.replace(/^\/+|\/+$/g, '') : '/cg-ke-a5wkqciyjpg940u3';
  if (!/^\/[a-zA-Z0-9_/-]+$/.test(custom)) throw new Error('Admin path must contain only letters, digits, underscores, hyphens and slashes.');
  return [...new Set(['/admin', '/api/admin', custom])].flatMap(base => [base, `${base}/((?!.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)`]);
}
/** @param {Record<string, string | undefined>} env */
export function syncMiddlewareMatcher(env) {
  const file = 'middleware.ts';
  const source = fs.readFileSync(file, 'utf8');
  const replacement = `// BEGIN AUTH MATCHERS\nexport const config = { matcher: ${JSON.stringify(authMatchers(env), null, 2)} };\n// END AUTH MATCHERS`;
  const next = source.replace(/\/\/ BEGIN AUTH MATCHERS[\s\S]*?\/\/ END AUTH MATCHERS/, () => replacement);
  if (next === source && !source.includes(replacement)) throw new Error('Cannot locate middleware matcher configuration.');
  if (next !== source) fs.writeFileSync(file, next);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const require = createRequire(import.meta.url);
  createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd(), true);
  syncMiddlewareMatcher(process.env);
}
