import Link from "next/link";
import { createSanityClient } from "@/lib/sanity/createSanityClient";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { PortableText } from "@portabletext/react";

const sanityClient = createSanityClient();

export const revalidate = 3600;

interface Bill {
  _id: string;
  title: string;
  slug: { current: string };
  billNumber: string;
  house: "national-assembly" | "senate" | "county-assembly";
  county?: string;
  status: string;
  introducedDate: string;
  sponsor?: string;
  parliamentaryTerm: string;
  summary?: any[];
  topics?: string[];
  lastActionDate?: string;
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
    house?: string;
    status?: string;
    term?: string;
  }>;
}

function getStatusTagClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("assent") || s.includes("passed") || s.includes("enacted")) return "govuk-tag--green";
  if (s.includes("reject") || s.includes("withdraw") || s.includes("lapsed")) return "govuk-tag--red";
  if (s.includes("committee") || s.includes("reading")) return "govuk-tag--blue";
  return "govuk-tag--grey";
}

export default async function BillsTracker({ searchParams }: PageProps) {
  const { q = "", house = "", status = "", term = "" } = await searchParams;

  let bills: Bill[] = [];

  try {
    let filter = `_type == "bill"`;

    if (q) {
      filter += ` && (
        title match "*${q}*" || 
        billNumber match "*${q}*" || 
        sponsor match "*${q}*" || 
        topics match "*${q}*"
      )`;
    }

    if (house) filter += ` && house == "${house}"`;
    if (status) filter += ` && status match "*${status}*"`;
    if (term) filter += ` && parliamentaryTerm match "*${term}*"`;

    bills = await sanityClient.fetch(`
      *[${filter}] 
      | order(introducedDate desc) [0...100] {
        _id,
        title,
        slug,
        billNumber,
        house,
        county,
        status,
        introducedDate,
        sponsor,
        parliamentaryTerm,
        "summary": summary[0...2],
        topics,
        lastActionDate
      }
    `);
  } catch (error) {
    console.error("Error fetching bills from Sanity:", error);
  }

  const uniqueTerms = Array.from(
    new Set(bills.map((b) => b.parliamentaryTerm).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  const uniqueStatuses = Array.from(
    new Set(bills.map((b) => b.status).filter(Boolean))
  ).sort();

  const houseOptions = [
    { value: "", label: "All Houses" },
    { value: "national-assembly", label: "National Assembly" },
    { value: "senate", label: "Senate" },
    { value: "county-assembly", label: "County Assemblies" },
  ];

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Legislature", href: "/legislature" },
          { text: "Tracker", href: "/legislature/tracker" },
          { text: "Bills", href: "" },
        ]}
      />

      
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Republic of Kenya</span>
            <h1 className="govuk-heading-xl">Bills &amp; Legislative Tracker</h1>
            <p className="govuk-body-l">
              Track the progress of Bills through the National Assembly, Senate, and County Assemblies.
            </p>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Filters */}
        <form method="GET" className="govuk-!-margin-bottom-6">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="q">Search Bills</label>
                <input
                  className="govuk-input"
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="Bill number, title, sponsor..."
                />
              </div>
            </div>

            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="house">House</label>
                <select className="govuk-select" id="house" name="house" defaultValue={house}>
                  {houseOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="status">Status</label>
                <select className="govuk-select" id="status" name="status" defaultValue={status}>
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="term">Parliamentary Term</label>
                <select className="govuk-select" id="term" name="term" defaultValue={term}>
                  <option value="">All Terms</option>
                  {uniqueTerms.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="govuk-grid-column-two-thirds govuk-!-padding-top-6">
              <button type="submit" className="govuk-button govuk-button--secondary govuk-!-margin-right-2">
                Apply Filters
              </button>
              {(q || house || status || term) && (
                <Link href="/legislature/tracker/bills" className="govuk-link govuk-!-margin-left-2">
                  Clear all filters
                </Link>
              )}
            </div>
          </div>
        </form>

        {/* Results Summary */}
        <div className="govuk-grid-row govuk-!-margin-bottom-4">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m">
              {bills.length} Bill{bills.length !== 1 ? "s" : ""} Found
            </h2>
          </div>
        </div>

        {/* Bills List */}
        {bills.length > 0 ? (
          <div className="govuk-grid-row">
            {bills.map((bill) => {
              const statusClass = getStatusTagClass(bill.status);
              const houseLabel =
                bill.house === "national-assembly"
                  ? "National Assembly"
                  : bill.house === "senate"
                  ? "Senate"
                  : bill.county
                  ? `${bill.county} County Assembly`
                  : "County Assembly";

              return (
                <div key={bill._id} className="govuk-grid-column-one-half govuk-!-margin-bottom-4">
                  <div className="govuk-summary-card">
                    <div className="govuk-summary-card__title-wrapper">
                      <h3 className="govuk-summary-card__title">
                        <Link
                          href={`/legislature/tracker/bills/${bill.slug.current}`}
                          className="govuk-link"
                        >
                          {bill.billNumber} — {bill.title.length > 80 ? bill.title.substring(0, 77) + "..." : bill.title}
                        </Link>
                      </h3>
                    </div>

                    <div className="govuk-summary-card__content">
                      <div className="govuk-!-margin-bottom-2">
                        <span className="govuk-tag govuk-tag--blue govuk-!-margin-right-2">{houseLabel}</span>
                        <span className={`govuk-tag ${statusClass}`}>{bill.status}</span>
                      </div>

                      <dl className="govuk-summary-list govuk-summary-list--no-border govuk-!-margin-bottom-3">
                        {bill.sponsor && (
                          <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">Sponsor</dt>
                            <dd className="govuk-summary-list__value">{bill.sponsor}</dd>
                          </div>
                        )}
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Introduced</dt>
                          <dd className="govuk-summary-list__value">
                            {new Date(bill.introducedDate).toLocaleDateString("en-KE", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </dd>
                        </div>
                        {bill.lastActionDate && (
                          <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">Last Action</dt>
                            <dd className="govuk-summary-list__value">
                              {new Date(bill.lastActionDate).toLocaleDateString("en-KE", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </dd>
                          </div>
                        )}
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Term</dt>
                          <dd className="govuk-summary-list__value">{bill.parliamentaryTerm}</dd>
                        </div>
                      </dl>

                      {bill.summary && bill.summary.length > 0 && (
                        <div className="govuk-body-s govuk-!-margin-bottom-3">
                          <PortableText value={bill.summary} />
                        </div>
                      )}

                      {bill.topics && bill.topics.length > 0 && (
                        <div className="govuk-!-margin-bottom-3">
                          {bill.topics.slice(0, 5).map((topic, index) => (
                            <span key={index} className="govuk-tag govuk-tag--grey govuk-!-margin-right-1 govuk-!-font-size-14">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}

                      <Link
                        href={`/legislature/tracker/bills/${bill.slug.current}`}
                        className="govuk-link govuk-!-font-weight-bold"
                      >
                        View full progress, documents &amp; timeline →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="govuk-inset-text">
            <h3 className="govuk-heading-s">No bills found</h3>
            <p className="govuk-body">
              {q || house || status || term
                ? "No bills match your current filters. Try broadening your search."
                : "No bills have been added to the tracker yet."}
            </p>
            {(q || house || status || term) && (
              <Link href="/legislature/tracker/bills" className="govuk-button govuk-button--secondary govuk-!-margin-top-2">
                Clear filters
              </Link>
            )}
          </div>
        )}

        {/* Helpful Section */}
        <div className="govuk-grid-row govuk-!-margin-top-8">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m">Understanding the Legislative Process</h2>
            <p className="govuk-body">
              Most Bills go through several stages: First Reading, Second Reading, Committee Stage, Third Reading, and finally assent by the President.
            </p>
            <p className="govuk-body">
              <Link href="/legislature/hansard" className="govuk-link">Browse Hansard records</Link> to see debates on these Bills.
            </p>
          </div>
        </div>

        <div className="govuk-!-margin-top-8">
        </div>
      
    
  
  </>
);
}