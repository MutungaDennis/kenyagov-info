import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import InstitutionPeople from "@/components/institutions/InstitutionPeople";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

async function getTemporaryBody(slug: string) {
  const db = createPublicClient();
  const { data, error } = await db
    .from("institutions")
    .select(
      "id,slug,name,short_name,description,mandate,temporary_body_type,appointing_authority,establishment_act,term_start_date,term_end_date,status,source_url,parent_institution_id",
    )
    .eq("slug", slug)
    .eq("record_kind", "temporary_body")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error("Temporary body records are temporarily unavailable.");
  }
  if (!data) return null;

  const parent = data.parent_institution_id
    ? await db
        .from("institutions")
        .select("name,slug")
        .eq("id", data.parent_institution_id)
        .eq("record_kind", "institution")
        .maybeSingle()
    : null;

  if (parent?.error) {
    throw new Error("The creating institution could not be loaded.");
  }

  return { body: data, parent: parent?.data || null };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getTemporaryBody(slug);
  if (!result) return { title: "Temporary body not found" };
  return {
    title: `${result.body.name} — temporary public body`,
    description:
      result.body.description ||
      result.body.mandate ||
      `${result.body.name} is a temporary public body appointed by ${result.parent?.name || "a Kenyan government institution"}.`,
  };
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function TemporaryBodyPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getTemporaryBody(slug);
  if (!result) notFound();

  const { body, parent } = result;
  const start = formatDate(body.term_start_date);
  const end = formatDate(body.term_end_date);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          ...(parent
            ? [
                {
                  text: parent.name,
                  href: `/government/institutions/${parent.slug}`,
                },
              ]
            : []),
          { text: body.name },
        ]}
      />
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <span className="govuk-caption-l">
          Temporary public body · {body.temporary_body_type}
        </span>
        <h1 className="govuk-heading-xl">{body.name}</h1>
        <div className="govuk-inset-text">
          This is a time-limited public body, not a government institution.
          {parent && (
            <>
              {" "}
              It was created under{" "}
              <Link
                className="govuk-link"
                href={`/government/institutions/${parent.slug}`}
              >
                {parent.name}
              </Link>
              .
            </>
          )}
        </div>
        {body.status && body.status.toLowerCase() !== "active" && (
          <p className="govuk-body">
            <strong className="govuk-tag govuk-tag--grey">{body.status}</strong>
          </p>
        )}
        <h2 className="govuk-heading-l">Purpose and appointment</h2>
        <p className="govuk-body">
          {body.mandate ||
            body.description ||
            "Details about this body’s mandate have not been recorded."}
        </p>
        <dl className="govuk-summary-list">
          {body.appointing_authority && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Appointing authority</dt>
              <dd className="govuk-summary-list__value">
                {body.appointing_authority}
              </dd>
            </div>
          )}
          {body.establishment_act && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Appointment instrument</dt>
              <dd className="govuk-summary-list__value">
                {body.establishment_act}
              </dd>
            </div>
          )}
          {(start || end) && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Term</dt>
              <dd className="govuk-summary-list__value">
                {start || "Start date not recorded"} to {end || "present"}
              </dd>
            </div>
          )}
          {parent && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Creating institution</dt>
              <dd className="govuk-summary-list__value">
                <Link
                  className="govuk-link"
                  href={`/government/institutions/${parent.slug}`}
                >
                  {parent.name}
                </Link>
              </dd>
            </div>
          )}
        </dl>
        {body.source_url && (
          <p className="govuk-body">
            <a className="govuk-link" href={body.source_url}>
              View source document
            </a>
          </p>
        )}
        <InstitutionPeople
          institutionId={body.id}
          status={body.status}
          entityLabel={body.temporary_body_type?.toLowerCase() || "temporary body"}
        />
      </main>
    </div>
  );
}
