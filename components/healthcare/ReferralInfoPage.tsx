import Link from "next/link";
import type { ReferralTemplateData } from "@/lib/healthcare/referral-data";

type Props = {
  slug: string;
  institution: {
    name: string;
    short_name?: string | null;
    phone?: string | null;
    email?: string | null;
    physical_address?: string | null;
    map_url?: string | null;
    template_data?: ReferralTemplateData & {
      emergencyMain?: string;
      referralLine?: string | string[];
      mapUrl?: string;
      ambulance?: string;
      referralGuidance?: string;
      visiting?: string;
      insurance?: string;
    } | null;
  };
  kind: "contact" | "patient-information" | "how-to-get-care";
};

function safeMapUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function telephoneHref(value?: string | null) {
  return value ? `tel:${value.replace(/[^\d+]/g, "")}` : undefined;
}

export default function ReferralInfoPage({ slug, institution, kind }: Props) {
  const data = institution.template_data || {};
  const root = `/government/institutions/${slug}`;
  const title = kind === "contact"
    ? "Contact and location"
    : kind === "patient-information"
      ? "Patient and visitor guide"
      : "Urgent and emergency care";
  const referralLines = (Array.isArray(data.referralLine)
    ? data.referralLine
    : typeof data.referralLine === "string"
      ? data.referralLine.split(/[;\n]/)
      : []).flatMap((entry) => typeof entry === "string"
        ? entry.split(/[;\n]/).map((line) => line.trim()).filter(Boolean)
        : []);
  const visitingHours = Array.isArray(data.visitingHours) ? data.visitingHours : [];
  const visitingInstructions = Array.isArray(data.visitingInstructions)
    ? data.visitingInstructions.filter((instruction) => typeof instruction === "string" && instruction.trim())
    : [];
  const faqs = Array.isArray(data.faqs)
    ? data.faqs.filter((faq) => faq?.question?.trim() && faq?.answer?.trim())
    : [];
  const mapUrl = safeMapUrl(institution.map_url) || safeMapUrl(data.mapUrl);
  const emergencyNumber = data.emergencyMain || institution.phone || "";
  const ambulanceNumber = data.ambulance || "922";

  return (
    <div className="govuk-width-container healthcare-page-shell">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/government/institutions">Institutions</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href={root}>{institution.short_name || institution.name}</Link></li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">{title}</li>
        </ol>
      </nav>
      <main className="govuk-main-wrapper healthcare-service-detail" id="main-content">
        <span className="govuk-caption-l">{institution.short_name || institution.name}</span>
        <h1 className="govuk-heading-xl">{title}</h1>

        {kind === "contact" && (
          <>
            <section className="healthcare-detail-section" aria-labelledby="emergency-contact-heading">
              <h2 className="govuk-heading-l" id="emergency-contact-heading">Emergency and referral contacts</h2>
              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Emergency / A&amp;E</dt>
                  <dd className="govuk-summary-list__value">{emergencyNumber && <a className="govuk-link" href={telephoneHref(emergencyNumber)}>{emergencyNumber}</a>}{!emergencyNumber && "Not provided"}</dd>
                </div>
                {referralLines.map((line, index) => (
                  <div className="govuk-summary-list__row" key={`${line}-${index}`}>
                    <dt className="govuk-summary-list__key">Referral line{referralLines.length > 1 ? ` ${index + 1}` : ""}</dt>
                    <dd className="govuk-summary-list__value"><a className="govuk-link" href={telephoneHref(line)}>{line}</a></dd>
                  </div>
                ))}
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">National ambulance</dt>
                  <dd className="govuk-summary-list__value"><a className="govuk-link" href={telephoneHref(ambulanceNumber)}>{ambulanceNumber}</a></dd>
                </div>
              </dl>
            </section>
            <section className="healthcare-detail-section" aria-labelledby="find-us-heading">
              <h2 className="govuk-heading-l" id="find-us-heading">Find us</h2>
              <p className="govuk-body">{institution.physical_address || "Address not provided"}</p>
              {mapUrl && <a className="govuk-button" href={mapUrl} target="_blank" rel="noreferrer">Open map</a>}
            </section>
            <section className="healthcare-detail-section" aria-labelledby="contact-details-heading">
              <h2 className="govuk-heading-l" id="contact-details-heading">Contact the hospital</h2>
              <p className="govuk-body">Main telephone: {institution.phone ? <a className="govuk-link" href={telephoneHref(institution.phone)}>{institution.phone}</a> : "Not provided"}</p>
              <p className="govuk-body">Email: {institution.email ? <a className="govuk-link" href={`mailto:${institution.email}`}>{institution.email}</a> : "Not provided"}</p>
            </section>
          </>
        )}

        {kind === "patient-information" && (
          <>
            <section className="healthcare-detail-section" id="visiting" aria-labelledby="visiting-heading">
              <h2 className="govuk-heading-l" id="visiting-heading">Visiting patients</h2>
              {visitingHours.length > 0 ? (
                <dl className="govuk-summary-list">
                  {visitingHours.map((period, index) => (
                    <div className="govuk-summary-list__row" key={`${period.days}-${period.hours}-${index}`}>
                      <dt className="govuk-summary-list__key">{period.days}</dt>
                      <dd className="govuk-summary-list__value">{period.hours}{period.note && <p className="govuk-hint govuk-!-margin-bottom-0">{period.note}</p>}</dd>
                    </div>
                  ))}
                </dl>
              ) : <p className="govuk-body">Visiting times will be confirmed by the hospital.</p>}
              {data.visiting && <p className="govuk-body">{data.visiting}</p>}
              {visitingInstructions.length > 0 && (
                <ul className="govuk-list govuk-list--bullet">
                  {visitingInstructions.map((instruction, index) => <li key={`${instruction}-${index}`}>{instruction}</li>)}
                </ul>
              )}
            </section>
            <section className="healthcare-detail-section" id="billing" aria-labelledby="billing-heading">
              <h2 className="govuk-heading-l" id="billing-heading">Paying for care and insurance</h2>
              <p className="govuk-body">{data.insurance || "Information about Social Health Authority (SHA) cover, insurance and payment will be added by the hospital."}</p>
            </section>
            {faqs.length > 0 && (
              <section className="healthcare-detail-section" aria-labelledby="faq-heading">
                <h2 className="govuk-heading-l" id="faq-heading">Common questions</h2>
                {faqs.map((faq, index) => <div key={`${faq.question}-${index}`}><h3 className="govuk-heading-m">{faq.question}</h3><p className="govuk-body">{faq.answer}</p></div>)}
              </section>
            )}
          </>
        )}

        {kind === "how-to-get-care" && (
          <>
            <section className="healthcare-detail-section" id="appointments" aria-labelledby="appointments-heading">
              <h2 className="govuk-heading-l" id="appointments-heading">Prepare for your visit</h2>
              <p className="govuk-body">{data.patientNotice || "Check your appointment details and contact the hospital before travelling if you are unsure where to check in."}</p>
              {data.referralGuidance && <p className="govuk-body">{data.referralGuidance}</p>}
            </section>
            <section className="healthcare-detail-section" id="emergency" aria-labelledby="emergency-heading">
              <h2 className="govuk-heading-l" id="emergency-heading">Emergency care</h2>
              <p className="govuk-body">{data.emergency || "For life-threatening emergencies, go directly to the nearest emergency department."}</p>
              <p className="govuk-body">Emergency / A&amp;E: {emergencyNumber ? <a className="govuk-link" href={telephoneHref(emergencyNumber)}>{emergencyNumber}</a> : "Not provided"}</p>
              {referralLines.length > 0 && <p className="govuk-body">Referral lines: {referralLines.map((line, index) => <span key={`${line}-${index}`}>{index > 0 && ", "}<a className="govuk-link" href={telephoneHref(line)}>{line}</a></span>)}</p>}
              <p className="govuk-body">National ambulance: <a className="govuk-link" href={telephoneHref(ambulanceNumber)}>{ambulanceNumber}</a></p>
            </section>
          </>
        )}

        <p className="govuk-body"><Link className="govuk-link" href={`${root}/about`}>About {institution.short_name || institution.name}</Link></p>
        <p className="govuk-body"><Link className="govuk-link" href={root}>Back to hospital home</Link></p>
      </main>
    </div>
  );
}
