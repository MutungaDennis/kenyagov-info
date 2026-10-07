import Link from "next/link"; import { getCounties } from "@/lib/legislation/queries";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "County legislation",
  description: "Laws made by Kenya's county assemblies, by county.",
  path: "/legislation/counties",
});

export default async function Page(){const counties=await getCounties();return <main className="govuk-width-container govuk-main-wrapper" id="main-content"><h1 className="govuk-heading-xl">County legislation</h1><p className="govuk-body-l">Choose a county to browse legislation made by its county assembly.</p><div className="legislation-county-grid">{counties.map((c:any)=><Link className="govuk-link" key={c.code} href={`/legislation/counties/${c.slug}`}>{c.official_name}</Link>)}</div></main>}
