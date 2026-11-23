import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/seo";
import type { SchoolProfile as Profile } from "@/lib/schools/queries";
import { hasSchoolValue, safeSchoolWebsite, schoolLevelLabel, schoolValue } from "@/lib/schools/types";

type DetailRow = [string, ReactNode, unknown?];

function Details({ title, rows }: { title: string; rows: DetailRow[] }) {
  const visibleRows = rows.filter(([, value, source]) => hasSchoolValue(source === undefined ? value : source));
  if (visibleRows.length === 0) return null;
  return <section className="govuk-!-margin-bottom-7"><h2 className="govuk-heading-m">{title}</h2>
    <dl className="govuk-summary-list">{visibleRows.map(([label,value]) => <div className="govuk-summary-list__row" key={label}>
      <dt className="govuk-summary-list__key">{label}</dt><dd className="govuk-summary-list__value">{value}</dd>
    </div>)}</dl></section>;
}

export default function SchoolProfile({ school }: { school: Profile }) {
  const website = safeSchoolWebsite(school.website_url);
  const institutionLink = (institution: Profile["parent"]) => institution
    ? <Link className="govuk-link" href={`/government/institutions/${institution.slug}`}>{institution.name}{institution.short_name ? ` (${institution.short_name})` : ""}</Link>
    : "Not assigned in the directory";
  const formatDate = (value: string) => new Date(value).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
  const sources = school.sources.filter((record) => record.source?.title);
  return <div className="govuk-width-container">
    <GovUKBreadcrumbs items={[{text:"Home",href:"/"},{text:"Government",href:"/government"},
      {text:"Institutions",href:"/government/institutions"},
      ...(school.parent ? [{text:school.parent.short_name || school.parent.name,href:`/government/institutions/${school.parent.slug}`}] : []),
      {text:school.official_name}]} />
    <JsonLd data={{"@context":"https://schema.org","@type":"School",name:school.official_name,
      url:`${SITE_URL}/government/institutions/${school.slug}`,address:{"@type":"PostalAddress",addressCountry:"KE",addressRegion:school.county || undefined,streetAddress:school.physical_address || undefined},
      parentOrganization:school.parent ? {"@type":"GovernmentOrganization",name:school.parent.name,url:`${SITE_URL}/government/institutions/${school.parent.slug}`} : undefined,
      sameAs:website ? [website] : undefined}} />
    <main className="govuk-main-wrapper" id="main-content">
      <span className="govuk-caption-l">Public school{hasSchoolValue(school.county) ? ` · ${school.county}` : ""}</span>
      <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">{school.official_name}</h1>
      {hasSchoolValue(school.main_tier) && <p className="govuk-body-l">{schoolLevelLabel(school.main_tier)}</p>}
      <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
        {hasSchoolValue(school.description) && <p className="govuk-body">{school.description}</p>}
        <Details title="Government responsibility" rows={[
          ["Ownership","Public"],["Parent institution",institutionLink(school.parent),school.parent],
          ["Supervising ministry / parent body",institutionLink(school.ministry),school.ministry],
        ]} />
        <Details title="About the school" rows={[
          ["Education level",schoolLevelLabel(school.main_tier),school.main_tier],["School category",schoolValue(school.moe_category),school.moe_category],
          ["School type",schoolValue(school.institution_type),school.institution_type],["Learner gender",schoolValue(school.gender_type),school.gender_type],
          ["Day or boarding",schoolValue(school.accommodation_type),school.accommodation_type],["Operational status",schoolValue(school.operational_status),school.operational_status],
          ["Registration status",schoolValue(school.registration_status),school.registration_status],["Sponsor",schoolValue(school.sponsor_name),school.sponsor_name],
          ["Special needs provision",schoolValue(school.special_needs_status),school.special_needs_status],
          ...(school.special_needs_status && school.special_needs_status !== "regular" && school.special_needs_status !== "unknown" && school.sne_categories?.length
            ? [["Special-needs categories",schoolValue(school.sne_categories),school.sne_categories] as DetailRow]
            : []),
        ]} />
        <Details title="Location and contact" rows={[
          ["County",schoolValue(school.county),school.county],["Sub-county",schoolValue(school.sub_county),school.sub_county],
          ["Constituency",schoolValue(school.constituency),school.constituency],["Ward",schoolValue(school.ward),school.ward],
          ["Address",schoolValue(school.physical_address),school.physical_address],["Postal address",schoolValue(school.postal_address),school.postal_address],
          ["Latitude",schoolValue(school.latitude),school.latitude],["Longitude",schoolValue(school.longitude),school.longitude],
          ...(typeof school.latitude === "number" && typeof school.longitude === "number" && Number.isFinite(school.latitude) && Number.isFinite(school.longitude)
            ? [["Map", <a key="school-map-link" className="govuk-link" href={`https://www.google.com/maps/search/?api=1&query=${school.latitude},${school.longitude}`} target="_blank" rel="noopener noreferrer">Open this location in Google Maps</a>] as DetailRow]
            : []),
          ["Telephone",schoolValue(school.public_phone),school.public_phone],["Email",schoolValue(school.public_email),school.public_email],
          ["Website",website ? <a className="govuk-link" href={website} rel="noopener noreferrer">Visit the school website</a> : "",website],
        ]} />
        <Details title="School identifiers" rows={[["NEMIS code",schoolValue(school.nemis_code),school.nemis_code],["KNEC code",schoolValue(school.knec_code),school.knec_code],["TSC code",schoolValue(school.tsc_code),school.tsc_code]]} />
        <Details title="Recorded resources" rows={[
          ["Learners enrolled",schoolValue(school.total_enrollment),school.total_enrollment],["Teachers",schoolValue(school.total_teachers),school.total_teachers],
          ["Water source",schoolValue(school.water_source),school.water_source],["Power source",schoolValue(school.power_source),school.power_source],
          ["Internet connectivity",schoolValue(school.internet_connectivity),school.internet_connectivity],
        ]} />
        {school.officials.length > 0 && <section className="govuk-!-margin-bottom-7" aria-labelledby="school-officials-heading">
          <h2 id="school-officials-heading" className="govuk-heading-m">School officials</h2>
          <ul className="govuk-list">
            {school.officials.map((official) => <li key={official.id} className="govuk-!-margin-bottom-4">
              {official.photo_url && <Image src={official.photo_url} alt="" width={64} height={64} unoptimized className="govuk-!-margin-right-3" />}
              <strong>{official.full_name}</strong><br />
              <span>{official.role_title}</span>
              {(official.start_date || official.end_date) && <p className="govuk-body-s govuk-!-margin-bottom-1">
                Served {official.start_date ? `from ${formatDate(official.start_date)}` : "from an unrecorded date"}{official.end_date ? ` to ${formatDate(official.end_date)}` : " (current)"}
              </p>}
              {official.biography && <p className="govuk-body-s">{official.biography}</p>}
            </li>)}
          </ul>
        </section>}
      </div><aside className="govuk-grid-column-one-third">
        {school.last_verified_at && <div className="govuk-inset-text"><h2 className="govuk-heading-s">About this information</h2>
          <p className="govuk-body-s">School records come from the cited sources. Missing information does not mean a service or facility is unavailable.</p>
          {school.last_verified_at && <p className="govuk-body-s">Last verified: {new Date(school.last_verified_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})}.</p>}
          <p className="govuk-body-s">Confirm admission arrangements and current facilities with the school.</p>
        </div>}
        <h2 className="govuk-heading-s">Explore public education</h2>
        <ul className="govuk-list"><li><Link className="govuk-link" href="/government/institutions?schools=show#public-schools">Find another public school</Link></li>
          <li><Link className="govuk-link" href="/government/institutions/ministry-education">Ministry of Education</Link></li></ul>
      </aside></div>
      {sources.length > 0 && <section className="govuk-!-margin-top-6 govuk-!-margin-bottom-6" aria-labelledby="school-sources-heading">
        <h2 id="school-sources-heading" className="govuk-heading-m">Sources</h2>
        <p className="govuk-body">These are the sources cited for information on this page.</p>
        <ul className="govuk-list govuk-list--bullet">
          {sources.map((record) => <li key={record.id}>
            {record.source?.source_url && /^https?:\/\//i.test(record.source.source_url)
              ? <a className="govuk-link" href={record.source.source_url} target="_blank" rel="noopener noreferrer">{record.source.title}</a>
              : <span>{record.source?.title}</span>}
            {record.source?.publisher ? ` — ${record.source.publisher}` : ""}
            {record.source?.reference_year ? ` (${record.source.reference_year})` : record.source?.publication_date ? ` (${formatDate(record.source.publication_date)})` : ""}
            {record.source?.licence ? `; ${record.source.licence}` : ""}
          </li>)}
        </ul>
      </section>}
      <div className="govuk-inset-text govuk-!-margin-top-6">
        <h2 className="govuk-heading-s">Information updated</h2>
        <p className="govuk-body-s">Page created: {formatDate(school.created_at)}.</p>
        <p className="govuk-body-s govuk-!-margin-bottom-0">Last updated: {formatDate(school.updated_at)}.</p>
      </div>
    </main>
  </div>;
}
