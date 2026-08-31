import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createPublicClient } from "@/lib/supabase/public";
import CountiesDirectoryClient from "./CountiesDirectoryClient";

export const revalidate = 3600;

export default async function CountiesPage() {
  const supabase = createPublicClient();
  const { data: counties, error } = await supabase
    .from("counties")
    .select("slug, name, code, headquarters, region")
    .order("code", { ascending: true });

  if (error) {
    console.error("[counties] fetch failed:", error);
  }

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Counties" },
        ]}
      />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
            Counties of Kenya
          </h1>
          <p className="govuk-body govuk-!-margin-bottom-6">
            <Link href="/government/counties/governors" className="govuk-link">
              County Executives
            </Link>
            {" · "}
            <Link
              href="/government/counties/county-assemblies"
              className="govuk-link"
            >
              County Assemblies
            </Link>
            {" · "}
            <Link href="/government/counties/devolution" className="govuk-link">
              Devolution
            </Link>
          </p>

          <CountiesDirectoryClient initialCounties={counties || []} />
        </main>
      </div>
    </>
  );
}
