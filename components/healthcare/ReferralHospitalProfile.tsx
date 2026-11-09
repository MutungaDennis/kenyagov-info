import Link from "next/link";

type HospitalData = {
  heroIntro?: string;
  patientNotice?: string;
  services?: string[];
  departments?: string[];
  visiting?: string;
  emergency?: string;
  insurance?: string;
  faqs?: { question: string; answer: string }[];
  quickLinks?: { label: string; href: string }[];
};

type Props = {
  institution: {
    name: string;
    short_name?: string | null;
    description?: string | null;
    website_url?: string | null;
    phone?: string | null;
    email?: string | null;
    physical_address?: string | null;
    template_data?: HospitalData | null;
  };
};

const textList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String).filter(Boolean) : [];

export default function ReferralHospitalProfile({ institution }: Props) {
  const data = institution.template_data || {};
  const services = textList(data.services);
  const departments = textList(data.departments);
  const faqs = Array.isArray(data.faqs) ? data.faqs.filter((faq) => faq?.question && faq?.answer) : [];
  const quickLinks = Array.isArray(data.quickLinks) ? data.quickLinks.filter((link) => link?.label && link?.href) : [];

  return (
    <section className="healthcare-profile" aria-labelledby="healthcare-profile-heading">
      <div className="healthcare-profile__hero">
        <p className="govuk-caption-l">Referral hospital</p>
        <h2 className="govuk-heading-xl" id="healthcare-profile-heading">How to get care at {institution.short_name || institution.name}</h2>
        <p className="govuk-body-l">{data.heroIntro || institution.description || "Find services, departments and practical information for patients and families."}</p>
        <div className="healthcare-profile__actions">
          <a className="govuk-button" href="#services">Find a service</a>
          <a className="govuk-button govuk-button--secondary" href="#contact">Contact the hospital</a>
        </div>
      </div>

      {data.patientNotice && <div className="govuk-inset-text"><strong>Before you visit</strong><br />{data.patientNotice}</div>}

      <div className="govuk-grid-row healthcare-profile__grid">
        <div className="govuk-grid-column-two-thirds">
          {services.length > 0 && <section id="services" className="healthcare-profile__section"><h3 className="govuk-heading-l">Services</h3><ul className="govuk-list govuk-list--bullet">{services.map((service) => <li key={service}>{service}</li>)}</ul></section>}
          {departments.length > 0 && <section className="healthcare-profile__section"><h3 className="govuk-heading-l">Departments and clinics</h3><ul className="govuk-list govuk-list--bullet">{departments.map((department) => <li key={department}>{department}</li>)}</ul></section>}
          {data.emergency && <section className="healthcare-profile__section healthcare-profile__emergency"><h3 className="govuk-heading-l">Emergency care</h3><p className="govuk-body">{data.emergency}</p></section>}
          {data.visiting && <section className="healthcare-profile__section"><h3 className="govuk-heading-l">Visiting patients</h3><p className="govuk-body">{data.visiting}</p></section>}
          {data.insurance && <section className="healthcare-profile__section"><h3 className="govuk-heading-l">Payment and insurance</h3><p className="govuk-body">{data.insurance}</p></section>}
          {faqs.length > 0 && <section className="healthcare-profile__section"><h3 className="govuk-heading-l">Common questions</h3>{faqs.map((faq) => <details className="govuk-details" key={faq.question}><summary className="govuk-details__summary"><span className="govuk-details__summary-text">{faq.question}</span></summary><div className="govuk-details__text">{faq.answer}</div></details>)}</section>}
        </div>
        <aside className="govuk-grid-column-one-third" id="contact">
          <div className="healthcare-profile__card"><h3 className="govuk-heading-m">Plan your visit</h3><dl className="govuk-summary-list">
            {institution.physical_address && <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">Address</dt><dd className="govuk-summary-list__value">{institution.physical_address}</dd></div>}
            {institution.phone && <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">Phone</dt><dd className="govuk-summary-list__value"><a className="govuk-link" href={`tel:${institution.phone}`}>{institution.phone}</a></dd></div>}
            {institution.email && <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">Email</dt><dd className="govuk-summary-list__value"><a className="govuk-link" href={`mailto:${institution.email}`}>{institution.email}</a></dd></div>}
          </dl>{institution.website_url && <a className="govuk-link" href={institution.website_url}>Visit hospital website</a>}</div>
          {quickLinks.length > 0 && <nav aria-label="Hospital information"><h3 className="govuk-heading-m">Information for patients</h3><ul className="govuk-list">{quickLinks.map((link) => <li key={link.href}><Link className="govuk-link" href={link.href}>{link.label}</Link></li>)}</ul></nav>}
        </aside>
      </div>
    </section>
  );
}
