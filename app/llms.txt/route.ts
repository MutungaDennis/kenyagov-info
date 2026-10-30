import { NextResponse } from "next/server";

const content = `# CitizenGuide.KE

CitizenGuide.KE is an independent civic information website for Kenya. It helps people find government services, institutions, leaders, laws, elections, public data and practical civic guidance.

## Primary sections
- [Services](/services): Browse public services and how to access them.
- [Government](/government): Explore Kenya's national government, institutions and public offices.
- [Institutions](/government/institutions): Browse ministries, agencies, commissions and public bodies.
- [People](/government/people): Find public officials and leaders.
- [Constitution](/constitution): Read and search the Constitution of Kenya.
- [Legislation](/legislation): Browse Kenyan Acts and legal documents.
- [Elections](/elections): Explore election information and tools.
- [Open data](/open-data): Browse public datasets and data guides.
- [Search](/search): Search the site by institution, person, service, law or topic.
- [Sitemap](/sitemap): View the complete human-readable site index.

## Guidance
Use the site's search and section pages to discover relevant content. Pages identify their data sources and should be treated as informational references, not legal or official advice.
`;

export function GET() {
  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
