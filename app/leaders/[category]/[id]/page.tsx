import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";

type Leader = {
  id: string;
  name: string;
  title: string;
  category: string;
  county?: string;
  constituency?: string;
  organization?: string;
  description: string;
  image?: string;
};

export default async function LeaderProfile({ 
  params 
}: { 
  params: Promise<{ category: string; id: string }> 
}) {
  const { category, id } = await params;
  const supabase = await createClient();

  const { data: leader, error } = await supabase
    .from('leaders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !leader) {
    notFound();
  }

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href={`/leaders/${category}`} /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Current Leaders", href: "/leaders" },
          { text: category, href: `/leaders/${category}` },
          { text: leader.name, href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <p className="govuk-caption-l">{leader.title}</p>
        <h1 className="govuk-heading-xl">{leader.name}</h1>

        {/* Image */}
        <div className="govuk-!-margin-bottom-8">
          {leader.image ? (
            <Image
              src={leader.image}
              alt={leader.name}
              width={280}
              height={350}
              className="rounded-sm shadow-sm"
              priority
            />
          ) : (
            <div className="w-[280px] h-[350px] bg-gray-100 border border-gray-300 flex items-center justify-center text-8xl">
              👤
            </div>
          )}
        </div>

        <h2 className="govuk-heading-l">Key information</h2>
        <dl className="govuk-summary-list">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Position</dt>
            <dd className="govuk-summary-list__value">{leader.title}</dd>
          </div>
          {leader.county && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">County</dt>
              <dd className="govuk-summary-list__value">{leader.county}</dd>
            </div>
          )}
        </dl>

        <h2 className="govuk-heading-l govuk-!-margin-top-9">Biography</h2>
        <div className="govuk-body">
          <p>{leader.description}</p>
        </div>

        
      </main>
    </div>
  );
}