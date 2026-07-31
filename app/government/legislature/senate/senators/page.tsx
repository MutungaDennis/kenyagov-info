import { Suspense } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import SenatorsClient from "./SenatorsClient";

export default function SenateSenatorsPage() {
  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "The Legislature", href: "/government/legislature" },
          { text: "Senate", href: "/government/legislature/senate" },
          { text: "Senators" },
        ]}
      />

      <div className="govuk-width-container">
        {/* Suspense boundary is required for useSearchParams() */}
        <Suspense fallback={
          <main className="govuk-main-wrapper">
            <p className="govuk-body">Loading senators...</p>
          </main>
        }>
          <SenatorsClient />
        </Suspense>
      </div>
    </>
  );
}