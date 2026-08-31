import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createPublicClient } from "@/lib/supabase/public";
import CountyAssembliesDirectoryClient from "./CountyAssembliesDirectoryClient";

export const revalidate = 3600;

export default async function CountyAssembliesPage() {
  const supabase = createPublicClient();
  const { data: counties, error } = await supabase
    .from("counties")
    .select("slug, name, code, headquarters, region")
    .order("code", { ascending: true });

  if (error) {
    console.error("[county-assemblies] fetch failed:", error);
  }

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Counties", href: "/government/counties" },
          { text: "County Assemblies" },
        ]}
      />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
            County Assemblies
          </h1>
          <p className="govuk-body govuk-!-margin-bottom-2">
            The legislative arm of Kenya&apos;s 47 county governments. Open an
            assembly to view its institution profile.
          </p>
          <p className="govuk-body govuk-!-margin-bottom-6">
            <Link href="/government/counties/governors" className="govuk-link">
              County Executives
            </Link>
            {" · "}
            <Link
              href="/government/counties/county-assemblies/mcas"
              className="govuk-link"
            >
              Members of County Assembly (MCAs)
            </Link>
            {" · "}
            <Link href="/government/counties" className="govuk-link">
              Counties
            </Link>
            {" · "}
            <Link href="/government/counties/devolution" className="govuk-link">
              Devolution
            </Link>
          </p>

          <CountyAssembliesDirectoryClient initialCounties={counties || []} />
        </main>
      </div>
    </>
  );
}
