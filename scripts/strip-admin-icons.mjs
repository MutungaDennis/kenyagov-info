import { readFileSync, writeFileSync, unlinkSync, existsSync } from "fs";

function stripIcons(file) {
  let s = readFileSync(file, "utf8");
  s = s.replace(
    /import\s*\{[\s\S]*?\}\s*from\s*["']@\/components\/admin\/AdminIcons["'];\s*/g,
    "",
  );
  s = s.replace(/<IconCheck\b[^>]*\/>/g, "");
  s = s.replace(/<IconAlert\b[^>]*\/>/g, "");
  s = s.replace(
    /<IconSpinner\b[^>]*\/>/g,
    '<span className="govuk-visually-hidden">Loading</span>',
  );
  s = s.replace(/<IconFile\b[^>]*\/>/g, "");
  s = s.replace(/<IconHelp\b[^>]*\/>/g, "");
  s = s.replace(/<IconLink\b[^>]*\/>/g, "");
  s = s.replace(/<IconEdit\b[^>]*\/>/g, "");
  s = s.replace(/<IconX\b[^>]*\/>/g, "");
  writeFileSync(file, s);
  console.log("stripped", file);
}

stripIcons("components/admin/hansard/UploadPanel.tsx");
stripIcons("components/admin/hansard/ManualEntry.tsx");

if (existsSync("components/admin/AdminIcons.tsx")) {
  unlinkSync("components/admin/AdminIcons.tsx");
  console.log("deleted AdminIcons.tsx");
}
