import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import GovUKTable from "@/components/govuk/Table";
import GovUKFeedback from "@/components/govuk/Feedback";

import PrintPageButton from "@/components/govuk/PrintPageButton";
import LastUpdated from "@/components/govuk/LastUpdated";

interface WardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WardPage({
  params,
}: WardPageProps) {
  const supabase = await createClient();

  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // =========================
  // MAIN WARD DATA
  // =========================
  const { data: ward, error } = await supabase
    .from("wards")
    .select("*")
    .eq("slug", decodedSlug)
    .single();

  if (error || !ward) {
    notFound();
  }

  // =========================
  // RELATED DATA (PARALLEL)
  // =========================
  const [
    { data: leadership },
    { data: schools },
    { data: health },
    { data: projects },
    { data: relatedWards },
  ] = await Promise.all([
    supabase
      .from("ward_leadership")
      .select("*")
      .eq("ward_id", ward.id)
      .maybeSingle(),

    supabase
      .from("ward_schools")
      .select("*")
      .eq("ward_id", ward.id)
      .order("name"),

    supabase
      .from("ward_health_facilities")
      .select("*")
      .eq("ward_id", ward.id)
      .order("name"),

    supabase
      .from("ward_projects")
      .select("*")
      .eq("ward_id", ward.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("wards")
      .select("id, slug, name")
      .eq("constituency_name", ward.constituency_name)
      .neq("id", ward.id)
      .order("name"),
  ]);

  return (
    <div className="govuk-width-container">

      {/* ========================= */}
      {/* BACK LINK */}
      {/* ========================= */}
      <GovUKBackLink href="/counties/wards" />

      {/* ========================= */}
      {/* BREADCRUMBS (GOV.UK COMPONENT) */}
      {/* ========================= */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Wards", href: "/counties/wards" },
          { text: ward.name },
        ]}
      />

      <main className="govuk-main-wrapper">

        {/* ========================= */}
        {/* TITLE */}
        {/* ========================= */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            <h1 className="govuk-heading-xl">
              {ward.name} Ward Profile
            </h1>

            <p className="govuk-body-l">
              Administrative unit in{" "}
              <strong>{ward.constituency_name}</strong>,{" "}
              <strong>{ward.county_name}</strong>.
            </p>

            {/* PRINT */}
            <div className="govuk-!-margin-bottom-6 print-hide">
              <PrintPageButton />
            </div>

            {/* ========================= */}
            {/* OVERVIEW */}
            {/* ========================= */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">
              Overview & Geography
            </h2>

            <GovUKSummaryList
              items={[
                { key: "Ward Code", value: ward.ward_code },
                { key: "County", value: ward.county_name },
                { key: "Constituency", value: ward.constituency_name },
                {
                  key: "Registered Voters (2022)",
                  value:
                    ward.registered_voters_2022?.toLocaleString() ?? "—",
                },
                {
                  key: "Population Estimate",
                  value:
                    ward.population_estimate?.toLocaleString() ?? "—",
                },
                {
                  key: "Land Area",
                  value: ward.land_area_km2
                    ? `${ward.land_area_km2} km²`
                    : "—",
                },
              ]}
            />

            {/* ========================= */}
            {/* LEADERSHIP */}
            {/* ========================= */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">
              Local Governance
            </h2>

            {leadership ? (
              <GovUKSummaryList
                items={[
                  {
                    key: "Member of County Assembly (MCA)",
                    value: leadership.mca_name ?? "—",
                  },
                  {
                    key: "Political Party",
                    value: leadership.mca_party ?? "—",
                  },
                  {
                    key: "Contact",
                    value: leadership.mca_contact ?? "—",
                  },
                ]}
              />
            ) : (
              <p className="govuk-body">
                No leadership data available.
              </p>
            )}

            {/* ========================= */}
            {/* SCHOOLS */}
            {/* ========================= */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">
              Education Facilities
            </h2>

            {schools?.length ? (
              <GovUKTable
                caption="Schools in this ward"
                headers={[
                  { text: "Name" },
                  { text: "Type" },
                ]}
                rows={schools.map((s) => ({
                  cells: [s.name, s.type ?? "—"],
                }))}
              />
            ) : (
              <p className="govuk-body">
                No schools recorded.
              </p>
            )}

            {/* ========================= */}
            {/* HEALTH */}
            {/* ========================= */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">
              Health Facilities
            </h2>

            {health?.length ? (
              <GovUKTable
                caption="Health facilities in this ward"
                headers={[
                  { text: "Name" },
                  { text: "Type" },
                ]}
                rows={health.map((h) => ({
                  cells: [
                    h.name,
                    h.facility_type ?? "—",
                  ],
                }))}
              />
            ) : (
              <p className="govuk-body">
                No health facilities recorded.
              </p>
            )}

            {/* ========================= */}
            {/* PROJECTS */}
            {/* ========================= */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">
              Development Projects
            </h2>

            {projects?.length ? (
              <GovUKTable
                caption="Ward development projects"
                headers={[
                  { text: "Project" },
                  { text: "Status" },
                  { text: "Year" },
                ]}
                rows={projects.map((p) => ({
                  cells: [
                    p.name,
                    p.status ?? "—",
                    p.year ?? "—",
                  ],
                }))}
              />
            ) : (
              <p className="govuk-body">
                No projects available.
              </p>
            )}

            {/* ========================= */}
            {/* RELATED WARDS */}
            {/* ========================= */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">
              Other wards in {ward.constituency_name}
            </h2>

            <ul className="govuk-list govuk-list--bullet">
              {relatedWards?.map((w) => (
                <li key={w.id}>
                  <Link href={`/counties/wards/${w.slug}`}>
                    {w.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* ========================= */}
            {/* LAST UPDATED */}
            {/* ========================= */}
            <LastUpdated
              lastUpdated={ward.updated_at}
              published={ward.created_at}
            />

          </div>
        </div>

        {/* ========================= */}
        {/* FEEDBACK (GOV.UK STANDARD) */}
        {/* ========================= */}
        <GovUKFeedback />

      </main>
    </div>
  );
}