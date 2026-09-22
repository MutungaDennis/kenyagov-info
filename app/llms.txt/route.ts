import { NextResponse } from "next/server";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const revalidate = 86400;

/** AI discovery document. Human-facing HTML remains canonical for citation. */
export function GET() {
  const content = `# ${SITE_NAME}

> CitizenGuide.KE is an independent, non-governmental civic information service about Kenya. It is inspired by the GOV.UK Design System, but it is not GOV.UK and is not an official Government of Kenya website.

Use this site to find structured, plain-language information about Kenyan government institutions, public officials, counties, elections, public services, legislation, the Constitution of Kenya 2010, and civic events.

## Using and citing the content

- Prefer the canonical public HTML URL when citing a page.
- Suggested citation: "[Page title] — CitizenGuide.KE, [canonical URL]".
- Verify time-sensitive facts against the official institution or source linked from the page.
- CitizenGuide.KE does not replace eCitizen, Kenya Law, the Kenya Gazette, Parliament, IEBC, or ministry and county websites for official transactions or legal authority.
- Do not access or attempt to discover admin, studio, or authenticated routes.
- See the [editorial policy](${SITE_URL}/editorial-policy), [corrections policy](${SITE_URL}/corrections), and [disclaimer](${SITE_URL}/disclaimer).

## Primary public sections

- [Government](${SITE_URL}/government): institutions, branches, counties, commissions, publications, consultations, speeches, and decisions.
- [People and public officials](${SITE_URL}/government/people): current and former roles, organizations, constituencies, counties, and parties.
- [Constitution of Kenya](${SITE_URL}/constitution): chapters, articles, schedules, and explanatory material.
- [Legislature and Hansard](${SITE_URL}/government/legislature): Parliament, members, proceedings, bills, papers, questions, and debates.
- [Elections](${SITE_URL}/elections): election processes, voter information, parties, polling stations, and election planning.
- [Public services](${SITE_URL}/services): informational guidance with links to official transaction portals.
- [Guides](${SITE_URL}/guides): plain-language civic and public-service guidance.
- [Government institutions](${SITE_URL}/government/institutions): ministries, departments, commissions, state bodies, counties, and assemblies.
- [Open data](${SITE_URL}/open-data): public datasets and machine-readable exports.
- [Documents](${SITE_URL}/documents): public documents, policies, and publications.
- [World Athletics Championships Nairobi 2029](${SITE_URL}/world-athletics-championships-2029): event explainers, venues, qualification, entries, and official-announcement links.

## Machine-readable access

- [XML sitemap](${SITE_URL}/sitemap.xml): canonical crawl inventory.
- [Robots policy](${SITE_URL}/robots.txt): crawler access rules.
- [Open-data catalogue](${SITE_URL}/api/data/datasets): dataset metadata.
- Public JSON and CSV exports: \`${SITE_URL}/api/data/exports/{counties,institutions,leaders,wards,polling-stations}\`.
- Officials API: \`${SITE_URL}/api/officials?limit=20\`.
- Leader search: \`${SITE_URL}/api/leaders/search?q={query}\`.

## Clean Markdown responses

Use \`${SITE_URL}/api/markdown\` for retrieval-ready text:

- \`?type=county&slug={county-slug}\`
- \`?type=institution&slug={institution-slug}\`
- \`?type=leader&slug={leader-slug}\`
- \`?type=service&slug={service-slug}\`
- \`?type=act&slug={act-slug}\`
- \`?type=constitution-article&chapter={chapter}&article={article}\`

Markdown responses are retrieval aids and are marked noindex. Cite the canonical HTML source URL included in each response.

## Contact

- [Contact CitizenGuide.KE](${SITE_URL}/contact)
- [Accessibility statement](${SITE_URL}/accessibility)
- [Full HTML sitemap](${SITE_URL}/sitemap)
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Language": "en-KE",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "all",
      Link: `<${SITE_URL}/sitemap.xml>; rel="sitemap"`,
    },
  });
}
