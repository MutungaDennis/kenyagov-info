import Link from "next/link";
import type { ReactNode } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/seo";
import type { SchoolProfile as Profile } from "@/lib/schools/queries";
import { safeSchoolWebsite, schoolLevelLabel, schoolValue } from "@/lib/schools/types";

function Details({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  return <section className="govuk-!-margin-bottom-7"><h2 className="govuk-heading-m">{title}</h2>
    <dl className="govuk-summary-list">{rows.map(([label,value]) => <div className="govuk-summary-list__row" key={label}>
      <dt className="govuk-summary-list__key">{label}</dt><dd className="govuk-summary-list__value">{value}</dd>
    </div>)}</dl></section>;
}

export default function SchoolProfile({ school }: { school: Profile }) {
  const website = safeSchoolWebsite(school.website_url);
  const institutionLink = (institution: Profile["parent"]) => institution
    ? <Link className="govuk-link" href={`/government/institutions/${institution.slug}`}>{institution.name}{institution.short_name ? ` (${institution.short_name})` : ""}</Link>
    : "Not assigned in the directory";
  return <div className="govuk-width-container">
    <GovUKBreadcrumbs items={[{text:"Home",href:"/"},{text:"Government",href:"/government"},
      {text:"Institutions",href:"/government/institutions"},
      ...(school.parent ? [{text:school.parent.short_name || school.parent.name,href:`/government/institutions/${school.parent.slug}`}] : []),
      {text:school.official_name}]} />
    <JsonLd data={{"@context":"https://schema.org","@type":"School",name:school.official_name,
      url:`${SITE_URL}/government/institutions/${school.slug}`,address:{"@type":"PostalAddress",addressCountry:"KE",addressRegion:school.county,streetAddress:school.physical_address || undefined},
      parentOrganization:school.parent ? {"@type":"GovernmentOrganization",name:school.parent.name,url:`${SITE_URL}/government/institutions/${school.parent.slug}`} : undefined,
      sameAs:website ? [website] : undefined}} />
    <main className="govuk-main-wrapper" id="main-content">
      <span className="govuk-caption-l">Public school · {school.county || "Kenya"}</span>
      <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">{school.official_name}</h1>
      <p className="govuk-body-l">{schoolLevelLabel(school.main_tier)}</p>
      <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
        <p className="govuk-body">{school.description || "This public school is part of Kenya’s publicly funded education system. Its governance and available school information are listed below."}</p>
        <Details title="Government responsibility" rows={[
          ["Ownership","Public"],["Parent institution",institutionLink(school.parent)],
          ["Supervising ministry / parent body",institutionLink(school.ministry)],
        ]} />
        <Details title="About the school" rows={[
          ["Education level",schoolLevelLabel(school.main_tier)],["School category",schoolValue(school.moe_category)],
          ["School type",schoolValue(school.institution_type)],["Learners",schoolValue(school.gender_type)],
          ["Day or boarding",schoolValue(school.accommodation_type)],["Operational status",schoolValue(school.operational_status)],
          ["Registration status",schoolValue(school.registration_status)],["Sponsor",schoolValue(school.sponsor_name)],
          ["Special needs provision",schoolValue(school.special_needs_status)],
        ]} />
        <Details title="Location and contact" rows={[
          ["County",schoolValue(school.county)],["Sub-county",schoolValue(school.sub_county)],
          ["Constituency",schoolValue(school.constituency)],["Ward",schoolValue(school.ward)],
          ["Address",schoolValue(school.physical_address)],["Postal address",schoolValue(school.postal_address)],
          ["Telephone",schoolValue(school.public_phone)],["Email",schoolValue(school.public_email)],
          ["Website",website ? <a className="govuk-link" href={website} rel="noopener noreferrer">Visit the school website</a> : "Not recorded"],
        ]} />
        <Details title="School identifiers" rows={[["NEMIS code",schoolValue(school.nemis_code)],["KNEC code",schoolValue(school.knec_code)],["TSC code",schoolValue(school.tsc_code)]]} />
        <Details title="Recorded resources" rows={[
          ["Learners enrolled",schoolValue(school.total_enrollment)],["Teachers",schoolValue(school.total_teachers)],
          ["Water source",schoolValue(school.water_source)],["Power source",schoolValue(school.power_source)],
          ["Internet connectivity",schoolValue(school.internet_connectivity)],
        ]} />
      </div><aside className="govuk-grid-column-one-third">
        <div className="govuk-inset-text"><h2 className="govuk-heading-s">About this information</h2>
          <p className="govuk-body-s">School records come from imported education datasets. Missing information is marked “Not recorded”; it does not mean a service or facility is unavailable.</p>
          <p className="govuk-body-s">Verification: {schoolValue(school.verification_status)}.</p>
          {school.last_verified_at && <p className="govuk-body-s">Last verified: {new Date(school.last_verified_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})}.</p>}
          <p className="govuk-body-s">Confirm admission arrangements and current facilities with the school.</p>
        </div>
        <h2 className="govuk-heading-s">Explore public education</h2>
        <ul className="govuk-list"><li><Link className="govuk-link" href="/government/institutions?schools=show#public-schools">Find another public school</Link></li>
          <li><Link className="govuk-link" href="/government/institutions/ministry-education">Ministry of Education</Link></li></ul>
      </aside></div>
    </main>
  </div>;
}
