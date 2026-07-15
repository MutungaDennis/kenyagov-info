import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const metadata: Metadata = {
  title: "County vs national government",
  description:
    "Which level of government does what in Kenya — a citizen guide to devolution and the Fourth Schedule.",
};

export default function CountyVsNationalPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "County vs national" },
        ]}
        caption="Devolution"
        title="County vs national government"
        lead="Kenya has two levels of government: the national government and 47 county governments. Knowing which level is responsible helps you contact the right office and use the right portal."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">Why it matters</h2>
          <p className="govuk-body">
            Before 2010, most power sat at the centre. The Constitution
            introduced devolution so that some services and decisions happen
            closer to communities. Functions are mainly listed in the Fourth
            Schedule of the Constitution.
          </p>
          <p className="govuk-body">
            Some services involve both levels — for example health policy may be
            national while many public hospitals and dispensaries are run by
            counties.
          </p>

          <h2 className="govuk-heading-l">Examples of national functions</h2>
          <p className="govuk-body">
            These are commonly national (simplified examples — always check the
            Constitution and current law for the full list):
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>foreign affairs and international trade</li>
            <li>national defence and police (national security organs)</li>
            <li>immigration, citizenship and civil registration frameworks</li>
            <li>national economic policy and monetary policy institutions</li>
            <li>courts and the national justice system</li>
            <li>primary and secondary education policy frameworks and national examinations</li>
            <li>national trunk roads and national infrastructure in assigned areas</li>
          </ul>

          <h2 className="govuk-heading-l">Examples of county functions</h2>
          <p className="govuk-body">Counties commonly handle:</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>county health facilities and pharmacies</li>
            <li>early childhood education and childcare facilities</li>
            <li>county transport and county roads</li>
            <li>trade development and regulation, including markets and local licensing</li>
            <li>county planning and development</li>
            <li>agricultural implementation and some local natural resource roles</li>
            <li>county public works and firefighting services</li>
            <li>control of pollution and public nuisances at county level</li>
          </ul>

          <h2 className="govuk-heading-l">Who leads each level</h2>
          <h3 className="govuk-heading-m">National</h3>
          <p className="govuk-body">
            President, Deputy President, Cabinet Secretaries, Parliament
            (National Assembly and Senate), and national institutions.
          </p>
          <h3 className="govuk-heading-m">County</h3>
          <p className="govuk-body">
            Governor, deputy governor, county executive committee, and the
            county assembly (including MCAs elected by ward).
          </p>
          <p className="govuk-body">
            <Link href="/find-your-representatives" className="govuk-link">
              Find your representatives
            </Link>
          </p>

          <h2 className="govuk-heading-l">Money</h2>
          <p className="govuk-body">
            Counties receive a share of nationally raised revenue and may raise
            some local revenue (for example rates and local fees). Oversight and
            reporting involve national and county institutions.
          </p>
          <p className="govuk-body">
            <Link href="/how-public-money-works" className="govuk-link">
              How public money works
            </Link>
          </p>

          <h2 className="govuk-heading-l">If you are not sure who to contact</h2>
          <ol className="govuk-list govuk-list--number">
            <li>Identify the service (for example passport vs county business permit).</li>
            <li>
              Check whether it is listed as national or county in reliable
              guidance — start with our{" "}
              <Link href="/topics" className="govuk-link">
                topics
              </Link>{" "}
              and{" "}
              <Link href="/services" className="govuk-link">
                services
              </Link>
              .
            </li>
            <li>
              Use{" "}
              <Link href="/contact-government" className="govuk-link">
                contact government
              </Link>{" "}
              for official channels.
            </li>
          </ol>

          <p className="govuk-body">
            More on devolution:{" "}
            <Link href="/government/counties/devolution" className="govuk-link">
              devolution hub
            </Link>
            . County directory:{" "}
            <Link href="/government/counties" className="govuk-link">
              all counties
            </Link>
            .
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "How government works", href: "/how-government-works" },
            { text: "County governments", href: "/government/counties" },
            { text: "Local and county services", href: "/topics/local-county-services" },
            { text: "Constitution", href: "/constitution" },
            { text: "Governors", href: "/government/counties/governors" },
          ]}
        />
      </div>
    </>
  );
}
