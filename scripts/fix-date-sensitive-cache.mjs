import fs from "fs";

const files = [
  "app/society-and-culture/national-events/devolution-conference/page.tsx",
  "app/society-and-culture/national-events/devolution-sensitisation-week/page.tsx",
  "app/society-and-culture/national-events/kenya-music-festival/page.tsx",
  "app/society-and-culture/national-events/kenya-national-drama-and-film-festival/page.tsx",
  "app/society-and-culture/national-events/ask-shows/page.tsx",
  "app/society-and-culture/holidays/layout.tsx",
];

for (const f of files) {
  let c = fs.readFileSync(f, "utf8");
  c = c.replace(
    /export const revalidate = 86400;\s*\nexport const dynamic = ["']force-static["'];?\s*/g,
    "export const revalidate = 3600;\n",
  );
  c = c.replace(/export const revalidate = 86400;?/g, "export const revalidate = 3600;");
  c = c.replace(/export const dynamic = ["']force-static["'];?\s*/g, "");
  fs.writeFileSync(f, c);
  console.log("fixed", f);
}
