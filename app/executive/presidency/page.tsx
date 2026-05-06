import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";

export default function PresidencyPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/executive" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Presidency", href: "/executive/presidency" },
        ]}
      />

      <h1 className="govuk-heading-xl">The Presidency</h1>
      <p className="govuk-body-l">Office of the President and Deputy President</p>

      <GovUKSummaryList
        items={[
          { key: "Constitutional Role", value: "Head of State and Government, Commander-in-Chief" },
          { key: "Current President", value: "H.E. Dr. William Samoei Ruto" },
          { key: "Current Deputy President", value: "H.E. Rigathi Gachagua" },
          { key: "Term", value: "5 years (maximum two terms)" },
        ]}
      />
    </div>
  );
}