import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createPublicClient } from "@/lib/supabase/public";
import type { FundParent, FundRecord } from "@/lib/funds/types";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };
type FundDetail = { fund: FundRecord; parent: FundParent | null; ministry: FundParent | null };

const getFund = cache(async (slug: string): Promise<FundDetail | null> => {
  const db = createPublicClient();
  const { data, error } = await db
    .from("institutions")
    .select("id,slug,name,short_name,official_name,institution_type,institution_category,fund_levy_type,fund_classification,fund_legal_form,accessibility_type,funding_source,fund_operational_structure,description,mandate,functions,target_population,legal_basis_name,legal_basis_reference,establishment_act,parent_institution_id,supervising_ministry_id,website_url,portal_url,application_url,status,is_active")
    .eq("slug", slug)
    .eq("record_kind", "fund_levy")
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error("Fund records are temporarily unavailable.");
  if (!data) return null;

  const fund = data as FundRecord;
  const [parentResult, ministryResult] = await Promise.all([
    fund.parent_institution_id
      ? db.from("institutions").select("id,slug,name").eq("id", fund.parent_institution_id).eq("record_kind", "institution").maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    fund.supervising_ministry_id
      ? db.from("institutions").select("id,slug,name").eq("id", fund.supervising_ministry_id).eq("record_kind", "institution").maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  return {
    fund,
    parent: parentResult.data as FundParent | null,
    ministry: ministryResult.data as FundParent | null,
  };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getFund(slug);
  if (!result) return { title: "Fund not found — citizenguide.Ke" };
  return {
    title: `${result.fund.name} — government fund or scheme`,
    description: result.fund.description || result.fund.mandate || `Information about ${result.fund.name}, its administering institution and official access points.`,
    alternates: { canonical: `https://www.citizenguide.ke/government/funds-levies/${encodeURIComponent(slug)}` },
    robots: { index: true, follow: true },
  };
}

function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{label}</dt>
      <dd className="govuk-summary-list__value">{children}</dd>
    </div>
  );
}

export default async function FundDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getFund(slug);
  if (!result) notFound();

  const { fund, parent, ministry } = result;
  const purpose = fund.mandate || fund.description;
  const officialLink = safeExternalUrl(fund.application_url) || safeExternalUrl(fund.portal_url) || safeExternalUrl(fund.website_url);
  const officialLabel = safeExternalUrl(fund.application_url) ? "Apply or access this fund" : safeExternalUrl(fund.portal_url) ? "Open the official portal" : "Visit the official website";
  const legalBasis = fund.legal_basis_reference || fund.legal_basis_name || fund.establishment_act;

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={[
        { text: "Home", href: "/" },
        { text: "Government", href: "/government" },
        { text: "Funds, levies and schemes", href: "/government/funds-levies" },
        { text: fund.name },
      ]} />
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">{fund.fund_levy_type || "Public fund or scheme"}{fund.fund_classification ? ` · ${fund.fund_classification}` : ""}</span>
            <h1 className="govuk-heading-xl">{fund.name}</h1>
            {fund.status && fund.status.toLowerCase() !== "active" && <p className="govuk-body"><strong className="govuk-tag govuk-tag--grey">{fund.status}</strong></p>}
            <div className="govuk-inset-text">
              This is a fund or scheme administered by a public institution. It is listed separately for easier discovery, but it is not a separate institution.
              {parent && <> It is administered by <Link className="govuk-link" href={`/government/institutions/${parent.slug}`}>{parent.name}</Link>.</>}
            </div>

            <h2 className="govuk-heading-l">What this fund is for</h2>
            <p className="govuk-body">{purpose || "A plain-language description of this fund’s purpose has not yet been recorded."}</p>

            {(fund.target_population || fund.accessibility_type) && (
              <section aria-labelledby="eligibility-heading">
                <h2 className="govuk-heading-l" id="eligibility-heading">Who it is for</h2>
                {fund.target_population && <p className="govuk-body">{fund.target_population}</p>}
                {fund.accessibility_type && <p className="govuk-body">Access information: {fund.accessibility_type}</p>}
              </section>
            )}

            {(fund.funding_source || fund.fund_operational_structure) && (
              <section aria-labelledby="operation-heading">
                <h2 className="govuk-heading-l" id="operation-heading">How it is funded and managed</h2>
                {fund.funding_source && <p className="govuk-body"><strong>Funding source:</strong> {fund.funding_source}</p>}
                {fund.fund_operational_structure && <p className="govuk-body">{fund.fund_operational_structure}</p>}
              </section>
            )}

            <h2 className="govuk-heading-l">Key information</h2>
            <dl className="govuk-summary-list">
              {fund.short_name && <SummaryRow label="Also known as">{fund.short_name}</SummaryRow>}
              {fund.fund_levy_type && <SummaryRow label="Type">{fund.fund_levy_type}</SummaryRow>}
              {fund.fund_classification && <SummaryRow label="Classification">{fund.fund_classification}</SummaryRow>}
              {fund.fund_legal_form && <SummaryRow label="Legal form">{fund.fund_legal_form}</SummaryRow>}
              {parent && <SummaryRow label="Administering institution"><Link className="govuk-link" href={`/government/institutions/${parent.slug}`}>{parent.name}</Link></SummaryRow>}
              {ministry && <SummaryRow label="Supervising ministry"><Link className="govuk-link" href={`/government/institutions/${ministry.slug}`}>{ministry.name}</Link></SummaryRow>}
              {fund.status && <SummaryRow label="Status">{fund.status}</SummaryRow>}
              {legalBasis && <SummaryRow label="Legal basis">{legalBasis}</SummaryRow>}
            </dl>

            {officialLink && (
              <p className="govuk-body">
                <a className="govuk-link" href={officialLink} target="_blank" rel="noopener noreferrer">
                  {officialLabel} (opens in a new tab)
                </a>
              </p>
            )}
            {!officialLink && <p className="govuk-body">An official website or application link has not been recorded. Contact the administering institution for current guidance.</p>}
            <p className="govuk-body-s govuk-!-margin-top-8">
              Information shown here reflects the details recorded in the directory. Check the linked institution or official portal for current eligibility, deadlines and application requirements.
            </p>
            <p className="govuk-body"><Link className="govuk-link" href="/government/funds-levies">Browse all funds, levies and schemes</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
}
