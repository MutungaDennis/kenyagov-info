import fs from "fs";

const staticStamp = `export const revalidate = 86400;
export const dynamic = "force-static";
`;

const dataStamp = `export const revalidate = 3600;
`;

const staticFiles = [
  "app/page.tsx",
  "app/about/page.tsx",
  "app/disclaimer/page.tsx",
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
  "app/cookies/page.tsx",
  "app/accessibility/page.tsx",
  "app/corrections/page.tsx",
  "app/editorial-policy/page.tsx",
  "app/content-style-guide/page.tsx",
  "app/how-government-works/page.tsx",
  "app/how-public-money-works/page.tsx",
  "app/county-vs-national/page.tsx",
  "app/contact-government/page.tsx",
  "app/complain-about-government/page.tsx",
  "app/access-to-information/page.tsx",
  "app/kenya-gazette/page.tsx",
  "app/scams/page.tsx",
  "app/emergency-and-safety/page.tsx",
  "app/ecitizen/page.tsx",
  "app/huduma-centres/page.tsx",
  "app/huduma-centres/locations/page.tsx",
  "app/find-your-representatives/page.tsx",
  "app/topics/page.tsx",
  "app/society-and-culture/page.tsx",
  "app/society-and-culture/holidays/page.tsx",
  "app/society-and-culture/languages/page.tsx",
  "app/society-and-culture/national-symbols/page.tsx",
  "app/society-and-culture/national-events/page.tsx",
  "app/society-and-culture/national-events/devolution-conference/page.tsx",
  "app/society-and-culture/national-events/devolution-sensitisation-week/page.tsx",
  "app/society-and-culture/national-events/kenya-music-festival/page.tsx",
  "app/society-and-culture/national-events/kenya-national-drama-and-film-festival/page.tsx",
  "app/society-and-culture/national-events/ask-shows/page.tsx",
  "app/elections/page.tsx",
  "app/elections/about/page.tsx",
  "app/elections/by-elections/page.tsx",
  "app/elections/general-elections/page.tsx",
  "app/elections/referendums/page.tsx",
  "app/elections/voter-registration/page.tsx",
  "app/government/page.tsx",
  "app/government/presidency/page.tsx",
  "app/government/cabinet/page.tsx",
  "app/government/commissions/page.tsx",
  "app/government/judiciary/page.tsx",
  "app/government/legislature/page.tsx",
  "app/government/counties/page.tsx",
  "app/government/counties/devolution/page.tsx",
  "app/guides/having-a-baby/page.tsx",
  "app/guides/registering-a-death/page.tsx",
  "app/guides/starting-a-business/page.tsx",
  "app/help/page.tsx",
  "app/support/page.tsx",
];

const dataFiles = [
  "app/elections/coalitions/page.tsx",
  "app/elections/iebc-offices/page.tsx",
  "app/elections/political-parties/page.tsx",
  "app/elections/political-parties/[slug]/page.tsx",
  "app/elections/polling-stations/page.tsx",
  "app/elections/polling-stations/[slug]/page.tsx",
  "app/elections/registered-voters/page.tsx",
  "app/elections/registered-voters/[slug]/page.tsx",
  "app/government/counties/wards/page.tsx",
  "app/government/counties/wards/[slug]/about/page.tsx",
  "app/guides/page.tsx",
  "app/guides/[slug]/page.tsx",
  "app/acts/parliament/page.tsx",
  "app/acts/parliament/[slug]/page.tsx",
  "app/acts/parliament/[slug]/[itemIndex]/page.tsx",
  "app/constitution/chapter/[chapter]/page.tsx",
  "app/constitution/chapter/[chapter]/article/[article]/page.tsx",
  "app/society-and-culture/cultural-calendar/page.tsx",
  "app/society-and-culture/cultural-calendar/[slug]/page.tsx",
  "app/society-and-culture/heritage-sites/[slug]/page.tsx",
  "app/society-and-culture/national-events/[slug]/page.tsx",
  "app/topics/[slug]/page.tsx",
];

function stamp(file, snippet) {
  if (!fs.existsSync(file)) {
    console.log("missing", file);
    return;
  }
  let c = fs.readFileSync(file, "utf8");
  if (c.includes("'use client'") || c.includes('"use client"')) {
    console.log("skip client", file);
    return;
  }

  // Upgrade aggressive 60s revalidate
  if (/export const revalidate\s*=\s*60\b/.test(c)) {
    c = c.replace(/export const revalidate\s*=\s*60\b/, "export const revalidate = 3600");
    fs.writeFileSync(file, c);
    console.log("upgraded revalidate", file);
    return;
  }

  if (c.includes("export const revalidate") || c.includes("force-static")) {
    console.log("already has cache config", file);
    return;
  }

  const lines = c.split("\n");
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\b/.test(lines[i])) lastImport = i;
    else if (lastImport >= 0 && lines[i].trim() !== "" && !/^import\b/.test(lines[i])) {
      break;
    }
  }

  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, "", snippet.trimEnd());
    fs.writeFileSync(file, lines.join("\n"));
    console.log("stamped", file);
  } else {
    fs.writeFileSync(file, snippet + "\n" + c);
    console.log("prepended", file);
  }
}

for (const f of staticFiles) stamp(f, staticStamp);
for (const f of dataFiles) stamp(f, dataStamp);
