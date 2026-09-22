
import { safeHtml } from "@/lib/safe-html";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConstitutionShell from "@/components/constitution/ConstitutionShell";
import { getConstitutionStructure } from "@/lib/constitution/data";

export const metadata: Metadata = { title: "Preamble | Constitution of Kenya | CitizenGuide.KE" };

export default async function PreamblePage() {
  const structure = await getConstitutionStructure();
  if (!structure) notFound();
  const { constitution } = structure;
  return <ConstitutionShell title="Preamble" caption="Constitution of Kenya, 2010">
    <article className="constitution-reading-column constitution-preamble-reading" dangerouslySetInnerHTML={{ __html: safeHtml(constitution.preamble_html || "") }} />
    <p className="govuk-body govuk-!-margin-top-7"><Link className="govuk-link" href="/constitution/article/1">Continue to Article 1 →</Link></p>
  </ConstitutionShell>;
}
