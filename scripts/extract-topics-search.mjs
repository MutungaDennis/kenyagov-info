import { writeFileSync, copyFileSync, unlinkSync, existsSync, readFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const root = process.cwd();

function gitShow(path) {
  try {
    return execSync(`git show HEAD:${path}`, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  } catch {
    return execSync(`git show HEAD~1:${path}`, {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
  }
}

const topicsFull = join(root, "lib", "topics.full.ts");
const searchFull = join(root, "lib", "data", "site-search-pages.full.ts");

writeFileSync(topicsFull, gitShow("lib/topics.ts"));
writeFileSync(searchFull, gitShow("lib/data/site-search-pages.ts"));

// Dynamic import via tsx is done by spawning
execSync(
  `pnpm exec tsx -e "import { writeFileSync } from 'fs'; import { topics } from './lib/topics.full.ts'; import { SITE_SEARCH_PAGES } from './lib/data/site-search-pages.full.ts'; writeFileSync('public/data/topics.json', JSON.stringify({ topics })); writeFileSync('public/data/site-search-pages.json', JSON.stringify(SITE_SEARCH_PAGES)); console.log('ok', topics.length, SITE_SEARCH_PAGES.length);"`,
  { cwd: root, stdio: "inherit", shell: true },
);

for (const f of [topicsFull, searchFull]) {
  if (existsSync(f)) unlinkSync(f);
}

console.log(
  "topics.json",
  readFileSync(join(root, "public/data/topics.json")).length,
  "search",
  readFileSync(join(root, "public/data/site-search-pages.json")).length,
);
