import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = buildPageMetadata({
  title: "Find your representatives",
  description:
    "Find your MP, woman representative, senator, governor and MCA in Kenya. Choose the role to see who holds the office.",
  path: "/find-your-representatives",
});

const roles = [
  {
    group: "National level",
    items: [
      { text: "Member of Parliament (MP)", href: "/government/legislature/national-assembly/members?type=Constituency", hint: "Represents your constituency in the National Assembly." },
      { text: "Woman Representative", href: "/government/legislature/national-assembly/members?type=Women%20Representative", hint: "Represents your county in the National Assembly." },
      { text: "Senator", href: "/government/legislature/senate/senators?type=Elected", hint: "Represents your county in the Senate." },
      { text: "President and Deputy President", href: "/government/presidency", hint: "Elected by all Kenyans." },
    ],
  },
  {
    group: "County level",
    items: [
      { text: "Governor", href: "/government/counties/governors", hint: "Leads your county government." },
      { text: "Member of County Assembly (MCA)", href: "/government/counties/wards/mcas?type=Elected", hint: "Represents your ward in the county assembly." },
    ],
  },
  {
    group: "Nominated members",
    items: [
      { text: "Nominated MPs", href: "/government/legislature/national-assembly/members?type=Nominated", hint: "Represent special interests in the National Assembly." },
      { text: "Nominated Senators", href: "/government/legislature/senate/senators?type=Nominated", hint: "Represent special interests in the Senate." },
      { text: "Nominated MCAs", href: "/government/counties/wards/mcas?type=Nominated", hint: "Represent special interests in county assemblies." },
    ],
  },
];

export default function FindYourRepresentativesPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Find your representatives" },
        ]}
        title="Find your representatives"
        lead="Choose the person you want to find."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {roles.map((g) => (
            <section key={g.group} className="govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-m">{g.group}</h2>
              <ul className="govuk-list">
                {g.items.map((i) => (
                  <li key={i.text} className="govuk-!-margin-bottom-3">
                    <Link href={i.href} className="govuk-link govuk-!-font-weight-bold">
                      {i.text}
                    </Link>
                    <br />
                    <span className="govuk-hint govuk-!-margin-bottom-0">{i.hint}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <h2 className="govuk-heading-m">Leaders who are appointed</h2>
          <p className="govuk-body">
            Cabinet Secretaries and the heads of public bodies are appointed, not elected. Find them in{" "}
            <Link href="/government/cabinet" className="govuk-link">the Cabinet</Link> or{" "}
            <Link href="/government/institutions" className="govuk-link">institutions</Link>, or search{" "}
            <Link href="/government/people" className="govuk-link">all leaders and officials</Link> by name.
          </p>

          <div className="govuk-inset-text">
            After an election, updates can take time to appear. For legal
            certainty, use IEBC results and Kenya Gazette notices.
          </div>
        </div>
      </div>
    </>
  );
}
