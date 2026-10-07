import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import ChevronLinkList from "@/components/site/ChevronLinkList";
import RelatedNav from "@/components/site/RelatedNav";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = buildPageMetadata({
  title: "The Constitution and laws",
  description:
    "Find the Constitution of Kenya, Acts of Parliament, county legislation, subsidiary legislation, treaties, the Kenya Gazette and official documents.",
  path: "/constitution-and-laws",
});

export default function ConstitutionAndLawsPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "The Constitution and laws" },
        ]}
        title="The Constitution and laws"
        lead="The Constitution is the supreme law of Kenya. Parliament and county assemblies make other laws under it."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-m">The Constitution</h2>
          <ChevronLinkList
            ariaLabel="The Constitution"
            items={[
              {
                href: "/constitution",
                title: "Constitution of Kenya 2010",
                description: "Read the full text by chapter and article, with plain-language help.",
              },
              {
                href: "/how-government-works",
                title: "How government works",
                description: "A plain-language guide to how the Constitution shapes government.",
              },
            ]}
          />

          <h2 className="govuk-heading-m govuk-!-margin-top-6">Laws</h2>
          <ChevronLinkList
            ariaLabel="Laws"
            items={[
              {
                href: "/legislation/acts",
                title: "Acts of Parliament",
                description: "National laws passed by the National Assembly and the Senate.",
              },
              {
                href: "/legislation/counties",
                title: "County laws",
                description: "Laws made by the assemblies of the 47 counties.",
              },
              {
                href: "/legislation/subsidiary",
                title: "Subsidiary legislation",
                description: "Regulations, rules and orders made under an Act.",
              },
              {
                href: "/legislation/treaties",
                title: "Treaties",
                description: "Regional and international agreements that apply to Kenya.",
              },
            ]}
          />

          <h2 className="govuk-heading-m govuk-!-margin-top-6">Official records and documents</h2>
          <ChevronLinkList
            ariaLabel="Official records and documents"
            items={[
              {
                href: "/kenya-gazette",
                title: "Kenya Gazette",
                description: "Official notices, appointments and legal notices.",
              },
              {
                href: "/documents",
                title: "Official documents",
                description: "Vision 2030, policy papers and key publications.",
              },
              {
                href: "/access-to-information",
                title: "Access to information",
                description: "How to ask a public body for information.",
              },
            ]}
          />
        </div>

        <RelatedNav
          links={[
            { text: "Parliament", href: "/government/legislature" },
            { text: "The Judiciary", href: "/government/judiciary" },
            { text: "Find a bill in Parliament", href: "/government/legislature/tracker/bills" },
          ]}
        />
      </div>
    </>
  );
}