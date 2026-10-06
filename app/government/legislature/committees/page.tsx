import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createPublicClient } from "@/lib/supabase/public";
import { chamberLabel, type ParliamentaryChamber } from "@/lib/legislature/committees";

export const dynamic = "force-dynamic";

type CommitteeRow = {
  id: string;
  chamber: ParliamentaryChamber;
  category: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export default async function ParliamentaryCommitteesPage() {
  let committees: CommitteeRow[] = [];
  let errorMessage: string | null = null;
  try {
    const result = await createPublicClient()
      .from("parliamentary_committees")
      .select("id,chamber,category,name,slug,description,is_active,sort_order")
      .eq("is_published", true)
      .order("chamber")
      .order("category")
      .order("sort_order")
      .order("name");
    if (result.error) throw result.error;
    committees = (result.data || []) as CommitteeRow[];
  } catch (error) {
    console.error("[parliamentary-committees] Could not load public committee directory:", error);
    errorMessage = "Committee information could not be loaded. Please try again later.";
  }

  return (
    <>
      <GovUKBreadcrumbs items={[
        { text: "Home", href: "/" },
        { text: "Government", href: "/government" },
        { text: "The Legislature", href: "/government/legislature" },
        { text: "Committees" },
      ]} />
      <main className="govuk-width-container govuk-main-wrapper">
        <span className="govuk-caption-l">National Assembly and Senate</span>
        <h1 className="govuk-heading-xl">Parliamentary committees</h1>
        <p className="govuk-body-l">
          Committees examine legislation, scrutinise government and public spending, and report to
          their House. Each committee page lists its members and the professional staff supporting it.
        </p>
        {errorMessage ? <div className="govuk-error-summary" role="alert"><p className="govuk-body">{errorMessage}</p></div> :
          committees.length === 0 ? <p className="govuk-inset-text">No published committees are currently available.</p> :
          (["national_assembly", "senate"] as const).map((chamber) => {
            const chamberRows = committees.filter((committee) => committee.chamber === chamber);
            if (!chamberRows.length) return null;
            const categories = [...new Set(chamberRows.map((committee) => committee.category))];
            return (
              <section className="govuk-!-margin-top-8" key={chamber}>
                <h2 className="govuk-heading-l">{chamberLabel(chamber)}</h2>
                {categories.map((category) => (
                  <section className="govuk-!-margin-bottom-7" key={category}>
                    <h3 className="govuk-heading-m">{category}</h3>
                    <ul className="govuk-list govuk-list--border">
                      {chamberRows.filter((committee) => committee.category === category).map((committee) => (
                        <li key={committee.id} className="govuk-!-padding-top-3 govuk-!-padding-bottom-3">
                          <h4 className="govuk-heading-s govuk-!-margin-bottom-1">
                            <Link className="govuk-link" href={`/government/legislature/committees/${committee.slug}`}>
                              {committee.name}
                            </Link>
                          </h4>
                          {committee.description && <p className="govuk-body-s govuk-!-margin-bottom-1">{committee.description}</p>}
                          {!committee.is_active && <strong className="govuk-tag govuk-tag--grey">Historical</strong>}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </section>
            );
          })}
      </main>
    </>
  );
}
