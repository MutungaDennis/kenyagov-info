import { readFileSync, writeFileSync } from "fs";

const routePath = "app/api/hansard/process/route.ts";
const route = readFileSync(routePath, "utf8");
const m = route.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);
if (!m) {
  console.error("SYSTEM_PROMPT not found (already externalized?)");
  process.exit(0);
}

writeFileSync("public/data/hansard-system-prompt.txt", m[1]);
console.log("wrote public/data/hansard-system-prompt.txt", m[1].length, "chars");

const loader = `let SYSTEM_PROMPT_CACHE: string | null = null;

async function getSystemPrompt(): Promise<string> {
  if (SYSTEM_PROMPT_CACHE) return SYSTEM_PROMPT_CACHE;
  try {
    const fs = await import(/* webpackIgnore: true */ "node:fs/promises");
    const path = await import(/* webpackIgnore: true */ "node:path");
    SYSTEM_PROMPT_CACHE = await fs.readFile(
      path.join(process.cwd(), "public/data/hansard-system-prompt.txt"),
      "utf8",
    );
    return SYSTEM_PROMPT_CACHE;
  } catch {
    /* CF Worker: no disk */
  }
  try {
    const origin = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.citizenguide.ke"
    ).replace(/\\/$/, "");
    const res = await fetch(\`\${origin}/data/hansard-system-prompt.txt\`);
    if (res.ok) {
      SYSTEM_PROMPT_CACHE = await res.text();
      return SYSTEM_PROMPT_CACHE;
    }
  } catch {
    /* ignore */
  }
  SYSTEM_PROMPT_CACHE =
    "You are an expert Kenyan Parliamentary Hansard analyst. Extract speeches as JSON contributions with speakerName, speech, order, type.";
  return SYSTEM_PROMPT_CACHE;
}
`;

const next = route.replace(/const SYSTEM_PROMPT = `[\s\S]*?`;/, loader);
// Replace uses of SYSTEM_PROMPT with await getSystemPrompt()
// Find places that use SYSTEM_PROMPT in the file - typically in messages
const next2 = next.replace(
  /(?<!get)SYSTEM_PROMPT(?!_CACHE)/g,
  "(await getSystemPrompt())",
);
// Fix double await on function def line if any
const next3 = next2.replace(
  /async function \(await getSystemPrompt\(\)\):/,
  "async function getSystemPrompt():",
);

writeFileSync(routePath, next3);
console.log("updated", routePath, "len", next3.length);
