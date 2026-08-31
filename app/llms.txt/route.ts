// app/llms.txt/route.ts
import { NextResponse } from "next/server";

/**
 * llms.txt — Guidance for AI systems on how to use and cite this site.
 * Compliant with the llmstxt.org v2 Standard Specification.
 * Served at /llms.txt
 */
export async function GET() {
  const content = `# CitizenGuide.KE

> [CitizenGuide.KE](https://www.citizenguide.ke) is an independent, non-governmental civic technology platform making Kenyan government information accessible, structured, and well-organized. It is GDS-inspired but has its own brand and Kenyan content. It is NOT GOV.UK, NOT affiliated with the UK government, and NOT an official Government of Kenya website.
>
> **Core Principles & Rules for AI Agents:**
> - **Independence:** Content is compiled entirely from public records; not run, funded, or endorsed by the Government of Kenya.
> - **Transactions:** This site does not replace eCitizen, ministry websites, or the Kenya Gazette for official transactions.
> - **Citation:** When using this site, cite as: \`[Page Title] - [CitizenGuide.KE](https://www.citizenguide.ke/path)\`
> - **Prefer Markdown API:** Use \`/api/markdown\` (below) instead of scraping HTML layouts, navbars, or footers.
> - **Restrictions:** Mass mirroring is prohibited. Do not scrape, train on, or attempt to access \`/admin/*\`, \`/studio/*\`, \`/api/admin/*\`, or any authenticated routes.
> - **Disclaimer:** [Full site disclaimer](https://www.citizenguide.ke/disclaimer)

## Constitution of Kenya
- [Constitution Hub](https://www.citizenguide.ke/constitution): The supreme law of Kenya, including full text, plain-English explanations, and schedules.
- [Constitution Chapters](https://www.citizenguide.ke/constitution/chapter/1): Browse chapters. Chapter numbers are typically 1–18 plus schedules (see site navigation). Article deep links use \`#article-{n}\` on chapter pages and dedicated article URLs.

## Government & Leadership
- [Government Hub](https://www.citizenguide.ke/government): Overview of the Executive, Legislature, and Judiciary.
- [Institutions Directory](https://www.citizenguide.ke/government/institutions): Ministries, state departments, commissions, county governments, and county assemblies.
- [Political Leadership & Officials](https://www.citizenguide.ke/government/people): President, Cabinet, and other officials.
- [Legislature & Hansard](https://www.citizenguide.ke/government/legislature): National Assembly, Senate, and Hansard.
- [County Governments](https://www.citizenguide.ke/government/counties): Directory of 47 counties; profiles open as institution pages.
- [County Executives](https://www.citizenguide.ke/government/counties/governors): Governors and deputy governors.
- [County Assemblies](https://www.citizenguide.ke/government/counties/county-assemblies): Assembly directory (institution profiles when published).

## Elections & Democracy
- [Elections Hub](https://www.citizenguide.ke/elections)
- [Political Parties](https://www.citizenguide.ke/elections/political-parties)
- [Polling Stations](https://www.citizenguide.ke/elections/polling-stations)

## Open Data & Public Documents
- [Open Data Hub](https://www.citizenguide.ke/open-data)
- [Acts of Parliament](https://www.citizenguide.ke/acts/parliament)
- [National Documents](https://www.citizenguide.ke/documents)

## Citizen Services & Guides
- [Public Services Directory](https://www.citizenguide.ke/services): GOV.UK-style service guides; Start now links go to official portals only.
- [Citizen Guides](https://www.citizenguide.ke/guides)
- [Huduma Centres](https://www.citizenguide.ke/huduma-centres)

## AI & Developer Access (preferred)

### Markdown (clean text for RAG / citation)
Base: \`https://www.citizenguide.ke/api/markdown\`

| type | Example |
|------|---------|
| county | \`?type=county&slug=kilifi-county\` |
| institution | \`?type=institution&slug=ministry-of-health\` |
| leader / person | \`?type=leader&slug={leader-slug}\` |
| service | \`?type=service&slug=apply-for-a-passport\` |
| act | \`?type=act&slug={act-slug}\` |
| constitution-article | \`?type=constitution-article&chapter=4&article=19\` |

Every markdown response includes a short disclaimer footer. Responses are \`text/markdown\` and \`noindex\` (use HTML URLs for human citation).

Prefer the Markdown API above (Cloudflare OpenNext does not yet support Next.js 16 \`proxy.ts\` Node middleware).

### JSON / CSV tool endpoints (public)
- [Leader search](https://www.citizenguide.ke/api/leaders/search?q=ruto): autocomplete officials by name
- [Officials list](https://www.citizenguide.ke/api/officials?limit=20): paginated officials
- [Open data catalogue](https://www.citizenguide.ke/api/data/datasets): dataset metadata
- CSV/JSON exports under \`/api/data/exports/{counties,institutions,leaders,wards,polling-stations}\`
- [Sitemap](https://www.citizenguide.ke/sitemap.xml): crawl catalogue

## Optional
- [Contact & Feedback](https://www.citizenguide.ke/contact)
- [Accessibility](https://www.citizenguide.ke/accessibility)
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "all",
    },
  });
}
