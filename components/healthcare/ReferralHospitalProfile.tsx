import Link from "next/link";
import { getServices, serviceSlug, type ReferralTemplateData } from "@/lib/healthcare/referral-data";

type HospitalData = ReferralTemplateData & {
  mandate?: string;
  mapUrl?: string;
  emergencyMain?: string;
  referralLine?: string;
  ambulance?: string;
  quickLinks?: { label: string; href: string }[];
  relatedFacilities?: (string | { name: string; href: string; reason?: string })[];
  healthcareLevel?: string;
};

type Props = {
  institution: {
    name: string;
    slug: string;
    short_name?: string | null;
    description?: string | null;
    website_url?: string | null;
    phone?: string | null;
    email?: string | null;
    physical_address?: string | null;
    template_key?: string | null;
    template_data?: HospitalData | null;
  };
};

export default function ReferralHospitalProfile({ institution }: Props) {
  const data = institution.template_data || {};
  const services = getServices(data);
  const emergencyMain = data.emergencyMain || institution.phone || "Emergency number not provided";
  const referralLine = data.referralLine || "Referral line not provided";
  const ambulance = data.ambulance || "922";
  const hospitalUrl = `/government/institutions/${institution.slug}`;
  const quickLinks = data.quickLinks || [];

  return (
    <div className="healthcare-profile">
      <div className="healthcare-emergency-bar" role="region" aria-label="Emergency contacts">
        <strong>Emergency / A&amp;E</strong>
        <a href={`tel:${emergencyMain}`}>{emergencyMain}</a>
        <span>Referral line: <a href={`tel:${referralLine}`}>{referralLine}</a></span>
        <span>National ambulance: <a href={`tel:${ambulance}`}>{ambulance}</a></span>
      </div>

      <header className="healthcare-profile__header">
        <p className="govuk-caption-l">{data.healthcareLevel === "level-6" || institution.template_key === "healthcare-referral-hospital" ? "Level 6 · National teaching and referral hospital" : data.healthcareLevel ? data.healthcareLevel.replace("level-", "Level ") : "Healthcare facility"}</p>
        <h1 className="govuk-heading-xl">{institution.name}</h1>
        <p className="govuk-body-l">{data.heroIntro || institution.description || "Specialist care, referrals and patient services."}</p>
      </header>

      <section className="healthcare-profile__intro">
        <h2 className="govuk-heading-l">What do you need to do?</h2>
        <p className="govuk-body">Start with the information most people need when they are planning care or visiting the hospital.</p>
        <div className="healthcare-action-grid">
          <ActionCard title="Emergency / A&E" text="Open 24 hours. Find emergency contacts and what to do now." href={`${hospitalUrl}/contact#emergency`} emergency />
          <ActionCard title="How to get care" text="Referrals, appointments, clinic booking and what to expect." href={`${hospitalUrl}/how-to-get-care`} />
          <ActionCard title="Find a service or clinic" text="Surgical, medical, cancer, renal, diagnostics, paediatrics and more." href={`${hospitalUrl}/services`} />
          <ActionCard title="Visiting hours" text="Check visiting guidance and what to bring when visiting a patient." href={`${hospitalUrl}/patient-information#visiting`} />
          <ActionCard title="Patient information" text="Admission, discharge, documents, bills and insurance." href={`${hospitalUrl}/patient-information`} />
          <ActionCard title="Contact & find us" text="Phone numbers, address, opening hours and directions." href={`${hospitalUrl}/contact`} />
          <ActionCard title="About this hospital" text="Read about the hospital, its role, leadership and responsibilities." href={`${hospitalUrl}/about`} />
        </div>
      </section>

      <section className="healthcare-profile__section" id="services">
        <h2 className="govuk-heading-l">Services overview</h2>
        <p className="govuk-body">Browse services and clinics to find access information, locations and what to expect.</p>
        {services.length > 0 ? <div className="healthcare-service-grid">{services.slice(0, 9).map((service) => <Link className="healthcare-service-card" href={`${hospitalUrl}/services/${serviceSlug(service)}`} key={serviceSlug(service)}><h3 className="govuk-heading-m">{service.name}<span aria-hidden="true">→</span></h3><p className="govuk-body">{service.description || "View service information"}</p></Link>)}</div> : <p className="govuk-body">Services and clinics will be listed here when they are added.</p>}
        <Link className="govuk-link" href={`${hospitalUrl}/services`}>View all services and clinics</Link>
      </section>

      <section className="healthcare-profile__section healthcare-contact-summary" id="contact">
        <div><h2 className="govuk-heading-l">Contact &amp; location</h2><p className="govuk-body">{institution.physical_address || "Address not provided"}</p><p className="govuk-body">Main: {institution.phone || "Not provided"}<br />Email: {institution.email || "Not provided"}</p><Link className="govuk-link" href={`${hospitalUrl}/contact`}>Full contact and location details</Link></div>
        {data.mapUrl && <a className="govuk-button govuk-button--secondary" href={data.mapUrl} target="_blank" rel="noreferrer">Open map</a>}
      </section>

      {data.relatedFacilities && data.relatedFacilities.length > 0 && <section className="healthcare-profile__section"><h2 className="govuk-heading-l">Other facilities to consider</h2><p className="govuk-body">You may also find this service at these related facilities.</p><ul className="govuk-list healthcare-related-links">{data.relatedFacilities.map((facility) => { const [name, href, reason] = typeof facility === "string" ? facility.split("|").map((part) => part.trim()) : [facility.name, facility.href, facility.reason]; return <li key={`${name}-${href}`}><Link className="govuk-link" href={href}>{name}</Link>{reason && <span>{reason}</span>}</li>; })}</ul></section>}

      {quickLinks.length > 0 && <section className="healthcare-profile__section"><h2 className="govuk-heading-l">More information</h2><ul className="govuk-list">{quickLinks.map((link) => <li key={link.href}><Link className="govuk-link" href={link.href}>{link.label}</Link></li>)}</ul></section>}

      <footer className="healthcare-profile__footer"><div><h2 className="govuk-heading-m">Contact</h2><p>{institution.name}<br />{institution.physical_address || "Address not provided"}<br />Main: {institution.phone || "Not provided"}<br />Referral: {referralLine}<br />{institution.email || "Email not provided"}</p></div><div><h2 className="govuk-heading-m">Quick links</h2><ul className="govuk-list"><li><Link href={`${hospitalUrl}/services`}>Services &amp; clinics</Link></li><li><Link href={`${hospitalUrl}/patient-information`}>Patient information</Link></li><li><Link href={`${hospitalUrl}/how-to-get-care`}>How to get care</Link></li><li><Link href={`${hospitalUrl}/contact`}>Contact &amp; location</Link></li></ul></div><div><h2 className="govuk-heading-m">More</h2><ul className="govuk-list"><li><Link href={`${hospitalUrl}/about`}>About</Link></li><li><Link href="/government/institutions">Other institutions</Link></li></ul></div></footer>
    </div>
  );
}

function ActionCard({ title, text, href, emergency = false }: { title: string; text: string; href: string; emergency?: boolean }) {
  return <Link className={`healthcare-action-card${emergency ? " healthcare-action-card--emergency" : ""}`} href={href}><h3 className="govuk-heading-m">{title}<span className="healthcare-card-arrow" aria-hidden="true">→</span></h3><p className="govuk-body">{text}</p></Link>;
}
