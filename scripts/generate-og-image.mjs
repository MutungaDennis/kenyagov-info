/**
 * Generate social share Open Graph image from public/logo.webp
 * Output: 1200×630, well under Vercel size limits.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const W = 1200;
const H = 630;
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

const logoSize = 220;
const logoPath = path.resolve("public/logo.webp");

const logo = await sharp(logoPath)
  .resize(logoSize, logoSize, { fit: "contain", background: WHITE })
  .png()
  .toBuffer();

const svg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f2f1"/>
  <rect width="100%" height="16" fill="#047857"/>
  <rect y="${H - 16}" width="100%" height="16" fill="#ce1126"/>
  <text x="50%" y="470" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="52" font-weight="700" fill="#0b0c0c">CitizenGuide.KE</text>
  <text x="50%" y="530" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="28" fill="#505a5f">Your guide to Kenyan governance</text>
</svg>
`);

const composed = await sharp(svg)
  .composite([
    {
      input: logo,
      top: Math.round((H - logoSize) / 2) - 40,
      left: Math.round((W - logoSize) / 2),
    },
  ])
  .webp({ quality: 85 })
  .toBuffer();

const png = await sharp(composed).png({ compressionLevel: 9 }).toBuffer();

const targets = [
  "public/og-image.webp",
  "public/og-image.png",
  "app/opengraph-image.webp",
  "app/twitter-image.webp",
];

for (const t of targets) {
  const out = t.endsWith(".png") ? png : composed;
  fs.writeFileSync(t, out);
  console.log("wrote", t, out.length, "bytes");
}
