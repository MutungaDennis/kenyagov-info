import { Suspense } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import MembersClient from "./MembersClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Members of the National Assembly",
  description: "Members of the National Assembly of Kenya by constituency and party.",
  path: "/government/legislature/national-assembly/members",
});


export default function NationalAssemblyMembersPage() {
  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "The Legislature", href: "/government/legislature" },
          { text: "National Assembly", href: "/government/institutions/national-assembly" },
          { text: "Members" },
        ]}
      />

      <div className="govuk-width-container">
        {/* Suspense boundary is required for useSearchParams() in Next.js App Router */}
        <Suspense fallback={
          <main className="govuk-main-wrapper">
            <p className="govuk-body">Loading members...</p>
          </main>
        }>
          <MembersClient />
        </Suspense>
      </div>
    </>
  );
}