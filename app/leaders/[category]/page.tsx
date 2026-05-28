import { notFound } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";

type Leader = {
  id: string;
  name: string;
  title: string;
  category: string;
  county?: string;
  constituency?: string;
  description: string;
  link?: string;
};

export default async function LeadersByCategory({ 
  params 
}: { 
  params: Promise<{ category: string }> 
}) {
  const { category } = await params;
  const supabase = await createClient();

  const { data: leadersData, error } = await supabase
    .from('leaders')
    .select('*')
    .ilike('category', `%${category.replace(/-/g, ' ')}%`)
    .order('name', { ascending: true });

  if (error || !leadersData || leadersData.length === 0) {
    notFound();
  }

  const displayName = category
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/leaders" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Current Leaders", href: "/leaders" },
          { text: displayName, href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">{displayName} Leaders</h1>
        <p className="govuk-body-l">
          Showing {leadersData.length} leaders in the <strong>{displayName}</strong> category.
        </p>

        <ul className="govuk-list">
          {leadersData.map((leader: Leader) => (
            <li key={leader.id} className="govuk-!-margin-bottom-6 pb-6 border-b border-gray-200 last:border-b-0">
              <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
                <Link href={`/leaders/${category}/${leader.id}`} className="govuk-link">
                  {leader.name}
                </Link>
              </h3>
              <p className="govuk-body font-medium">{leader.title}</p>
              {(leader.county || leader.constituency) && (
                <p className="govuk-body-s text-gray-600">
                  {leader.county && `County: ${leader.county}`}
                  {leader.constituency && ` • Constituency: ${leader.constituency}`}
                </p>
              )}
              <p className="govuk-body-s">{leader.description}</p>
            </li>
          ))}
        </ul>

        
      </main>
    </div>
  );
}