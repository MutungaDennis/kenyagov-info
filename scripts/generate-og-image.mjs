/**
 * Generate social share Open Graph images (1200×630).
 * GOV.UK-inspired card: brand bar, logo, CitizenGuide.KE wordmark, tagline.
 *
 * Output (PNG preferred for crawler compatibility + WebP copies):
 *   public/og-image.png, public/og-image.webp
 *   app/opengraph-image.png, app/twitter-image.png
 *   (and webp variants for app/* if useful)
 *
 * Run: node scripts/generate-og-image.mjs
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const W = 1200;
const H = 630;
const GREEN = "#00703c"; // GOV.UK-adjacent green (site brand)
const GREEN_DARK = "#005a30";
const BG = "#f3f2f1";
const TEXT = "#0b0c0c";
const MUTED = "#505a5f";
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

const logoSize = 160;
const logoPath = path.resolve("public/logo.webp");

if (!fs.existsSync(logoPath)) {
  console.error("Missing public/logo.webp");
  process.exit(1);
}

const logo = await sharp(logoPath)
  .resize(logoSize, logoSize, { fit: "contain", background: WHITE })
  .png()
  .toBuffer();

// Card layout: left brand panel + right content (reads well in previews)
const svg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${BG}"/>
  <!-- Left brand stripe -->
  <rect width="18" height="100%" fill="${GREEN}"/>
  <!-- Top bar -->
  <rect x="18" width="${W - 18}" height="12" fill="${GREEN}"/>
  <!-- Bottom bar -->
  <rect x="18" y="${H - 72}" width="${W - 18}" height="72" fill="${GREEN_DARK}"/>

  <text x="220" y="200"
        font-family="Arial, Helvetica, DejaVu Sans, sans-serif"
        font-size="28" font-weight="600" fill="${MUTED}"
        letter-spacing="2">CITIZENGUIDE.KE</text>

  <text x="220" y="300"
        font-family="Arial, Helvetica, DejaVu Sans, sans-serif"
        font-size="56" font-weight="700" fill="${TEXT}">
    Your guide to Kenyan
  </text>
  <text x="220" y="370"
        font-family="Arial, Helvetica, DejaVu Sans, sans-serif"
        font-size="56" font-weight="700" fill="${TEXT}">
    governance
  </text>

  <text x="220" y="440"
        font-family="Arial, Helvetica, DejaVu Sans, sans-serif"
        font-size="24" fill="${MUTED}">
    Constitution · institutions · leaders · services · elections
  </text>

  <text x="48" y="${H - 28}"
        font-family="Arial, Helvetica, DejaVu Sans, sans-serif"
        font-size="22" font-weight="700" fill="#ffffff">
    CitizenGuide.KE
  </text>
  <text x="${W - 48}" y="${H - 28}" text-anchor="end"
        font-family="Arial, Helvetica, DejaVu Sans, sans-serif"
        font-size="20" fill="#ffffff">
    www.citizenguide.ke
  </text>
</svg>
`);

const composedPng = await sharp(svg)
  .composite([
    {
      input: logo,
      top: 120,
      left: 48,
    },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

const composedWebp = await sharp(composedPng).webp({ quality: 88 }).toBuffer();

const targets = [
  { file: "public/og-image.png", buf: composedPng },
  { file: "public/og-image.webp", buf: composedWebp },
  // Next.js file convention: app/opengraph-image.* and twitter-image.*
  { file: "app/opengraph-image.png", buf: composedPng },
  { file: "app/twitter-image.png", buf: composedPng },
  { file: "app/opengraph-image.webp", buf: composedWebp },
  { file: "app/twitter-image.webp", buf: composedWebp },
];

for (const t of targets) {
  fs.mkdirSync(path.dirname(t.file), { recursive: true });
  fs.writeFileSync(t.file, t.buf);
  console.log("wrote", t.file, t.buf.length, "bytes");
}

console.log("OG images ready (1200×630).");
