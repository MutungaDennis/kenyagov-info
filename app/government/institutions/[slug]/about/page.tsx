import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import EPRAFuelSection from "@/components/epra/EPRAFuelSection";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function InstitutionAboutPage({ params }: Props) {
  const { slug } = await params;
  if (slug !== "energy-petroleum-regulatory-authority") notFound();
  const supabase = createPublicClient();
  const { data: institution, error } = await supabase.from("institutions").select("name,description,mandate,website").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error || !institution) notFound();

  return (
    <main className="govuk-width-container">
      <GovUKBreadcrumbs items={[{ text: "Home", href: "/" }, { text: "Government institutions", href: "/government/institutions" }, { text: institution.name || "EPRA", href: `/government/institutions/${slug}` }, { text: "About" }]} />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">Energy and petroleum</span>
          <h1 className="govuk-heading-xl">About the Energy and Petroleum Regulatory Authority</h1>
          <p className="govuk-body-l">Find current fuel prices, understand how EPRA regulates petroleum products, and explore historical price information available in CitizenGuide.KE&apos;s reference tables.</p>
          <p className="govuk-body"><Link href={`/government/institutions/${slug}`} className="govuk-link">Return to the EPRA institution page</Link></p>
          <EPRAFuelSection />
          <h2 className="govuk-heading-l">What EPRA does</h2>
          <p className="govuk-body">{institution.mandate || institution.description || "EPRA regulates the energy and petroleum sector in Kenya and publishes information that helps consumers understand regulated prices and the wider petroleum market."}</p>
          <h2 className="govuk-heading-l">Understanding pump prices</h2>
          <p className="govuk-body">The published maximum retail price applies for a defined pricing cycle and varies by town because of transport and distribution costs. A station may charge less, but should not charge above the published maximum.</p>
          <details className="govuk-details"><summary className="govuk-details__summary"><span className="govuk-details__summary-text">What the fuel abbreviations mean</span></summary><div className="govuk-details__text"><dl className="govuk-summary-list"><div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">PMS</dt><dd className="govuk-summary-list__value">Petrol, or Premium Motor Spirit.</dd></div><div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">AGO</dt><dd className="govuk-summary-list__value">Diesel, or Automotive Gas Oil.</dd></div><div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">IK</dt><dd className="govuk-summary-list__value">Illuminating kerosene.</dd></div></dl></div></details>
          <p className="govuk-body-s">Source: Energy and Petroleum Regulatory Authority. CitizenGuide.KE is an independent reference and is not EPRA.</p>
        </div>
      </div>
    </main>
  );
}
