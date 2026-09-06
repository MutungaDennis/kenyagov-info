import type { Metadata } from "next";
import Link from "next/link";
import ConstitutionShell from "@/components/constitution/ConstitutionShell";
import { getConstitutionStructure } from "@/lib/constitution/data";

export const metadata: Metadata = { title: "Preamble | Constitution of Kenya | CitizenGuide.KE" };

export default async function PreamblePage() {
  const { constitution } = await getConstitutionStructure();
  return <ConstitutionShell title="Preamble" caption="Constitution of Kenya, 2010">
    <article className="constitution-reading-column constitution-preamble-reading" dangerouslySetInnerHTML={{ __html: constitution.preamble_html || "" }} />
    <p className="govuk-body govuk-!-margin-top-7"><Link className="govuk-link" href="/constitution/article/1">Continue to Article 1 →</Link></p>
  </ConstitutionShell>;
}
