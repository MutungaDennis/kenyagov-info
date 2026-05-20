import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default async function PoliticalPartyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();

  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // -------------------------
  // FETCH PARTY
  // -------------------------
  const { data: party, error } = await supabase
    .from("political_parties")
    .select(`
      id,
      name,
      slug,
      abbreviation,
      symbol,
      colors,
      slogan,
      status,
      certificate_serial_no,
      certificate_issue_date,
      certificate_date,
      postal_address,
      head_office_location,
      previous_names,
      changes,
      coalition_id
    `)
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (error || !party) {
    notFound();
  }

  // -------------------------
  // FETCH COALITION (optional)
  // -------------------------
  let coalition: any = null;

  if (party.coalition_id) {
    const { data } = await supabase
      .from("coalitions")
      .select("id, name, abbreviation")
      .eq("id", party.coalition_id)
      .maybeSingle();

    coalition = data;
  }

  // -------------------------
  // RELATED PARTIES
  // -------------------------
  const { data: related } = await supabase
    .from("political_parties")
    .select("id, name, slug, abbreviation")
    .neq("id", party.id)
    .limit(6);

  // -------------------------
  // DATE FORMATTING
  // -------------------------
  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="govuk-width-container">

      {/* BREADCRUMBS */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Political parties", href: "/political-parties" },
          { text: party.name, href: `/political-parties/${party.slug}` },
        ]}
      />

      {/* TITLE */}
      <h1 className="govuk-heading-xl">{party.name}</h1>

      {/* TAGS */}
      <div className="govuk-!-margin-bottom-4">

        {party.abbreviation && (
          <strong className="govuk-tag govuk-!-margin-right-2">
            {party.abbreviation}
          </strong>
        )}

        {party.status && (
          <strong
            className={`govuk-tag ${
              party.status === "active"
                ? ""
                : "govuk-tag--grey"
            }`}
          >
            {party.status.toUpperCase()}
          </strong>
        )}

        {coalition && (
          <strong className="govuk-tag govuk-tag--green govuk-!-margin-left-2">
            {coalition.name}
          </strong>
        )}
      </div>

      {/* SLOGAN */}
      {party.slogan && (
        <p className="govuk-body-l">{party.slogan}</p>
      )}

      <div className="govuk-grid-row">

        {/* MAIN CONTENT */}
        <div className="govuk-grid-column-two-thirds">

          {/* ===================== */}
          {/* CORE DETAILS */}
          {/* ===================== */}
          <h2 className="govuk-heading-l">Party details</h2>

          <dl className="govuk-summary-list">

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Symbol</dt>
              <dd className="govuk-summary-list__value">
                {party.symbol || "—"}
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Party colours</dt>
              <dd className="govuk-summary-list__value">
                {party.colors || "—"}
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Head office</dt>
              <dd className="govuk-summary-list__value">
                {party.head_office_location || "—"}
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Postal address</dt>
              <dd className="govuk-summary-list__value">
                {party.postal_address || "—"}
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Status</dt>
              <dd className="govuk-summary-list__value">
                {party.status || "Unknown"}
              </dd>
            </div>

          </dl>

          {/* ===================== */}
          {/* CERTIFICATE INFO */}
          {/* ===================== */}
          <h2 className="govuk-heading-l">Registration details</h2>

          <dl className="govuk-summary-list">

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Certificate serial number
              </dt>
              <dd className="govuk-summary-list__value">
                {party.certificate_serial_no || "—"}
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Certificate issue date
              </dt>
              <dd className="govuk-summary-list__value">
                {formatDate(party.certificate_issue_date || party.certificate_date)}
              </dd>
            </div>

          </dl>

          {/* ===================== */}
          {/* CHANGES / NOTES */}
          {/* ===================== */}
          {(party.previous_names || party.changes) && (
            <>
              <h2 className="govuk-heading-l">Changes & history</h2>

              <dl className="govuk-summary-list">

                {party.previous_names && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Previous names</dt>
                    <dd className="govuk-summary-list__value">
                      {party.previous_names}
                    </dd>
                  </div>
                )}

                {party.changes && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Recent changes / notes</dt>
                    <dd className="govuk-summary-list__value">
                      {party.changes}
                    </dd>
                  </div>
                )}

              </dl>
            </>
          )}

          {/* ===================== */}
          {/* COALITION */}
          {/* ===================== */}
          <h2 className="govuk-heading-l">Coalition</h2>

          <p className="govuk-body">
            {coalition ? (
              <Link
                href={`/coalitions/${coalition.id}`}
                className="govuk-link"
              >
                {coalition.name}
              </Link>
            ) : (
              "This party is not currently part of any coalition."
            )}
          </p>

          {/* ===================== */}
          {/* RELATED PARTIES */}
          {/* ===================== */}
          {related && related.length > 0 && (
            <>
              <h2 className="govuk-heading-l">Other political parties</h2>

              <ul className="govuk-list govuk-list--bullet">
                {related.map((p: any) => (
                  <li key={p.id}>
                    <Link
                      href={`/political-parties/${p.slug}`}
                      className="govuk-link"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

        </div>

        {/* SIDEBAR */}
        <div className="govuk-grid-column-one-third">

          <aside className="govuk-inset-text">
            <h3 className="govuk-heading-s">About this register</h3>
            <p className="govuk-body-s">
              Political parties are regulated by the Office of the Registrar of Political Parties (ORPP)
              under the Political Parties Act (Cap. 7D).
            </p>
          </aside>

          <aside className="govuk-inset-text">
            <h3 className="govuk-heading-s">Status guide</h3>
            <p className="govuk-body-s">
              Active parties are fully registered. Others may be deregistered,
              suspended, or undergoing compliance review.
            </p>
          </aside>

        </div>
      </div>

      {/* FOOTER */}
      <div className="govuk-!-margin-top-8">
        <p className="govuk-body-s govuk-hint">
          Data sourced from ORPP register. Updates may lag behind official gazette notices.
        </p>
      </div>

      <GovUKFeedback />

    </main>
  );
}