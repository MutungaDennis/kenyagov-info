import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { constitutionRefs } from "@/lib/constitution-links";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 3;

export const metadata: Metadata = buildPageMetadata({
  title: "The main institutions of national government - How government works",
  description: "At national level, public power is distributed among the Executive, Parliament and the Judiciary.",
  path: `${guideBase}/${sections[index].slug}`,
});

export default function Page() {
  const previous = index > 0 ? sections[index - 1] : null;
  const next = index < sections.length - 1 ? sections[index + 1] : null;

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: guideName, href: guideBase },
          { text: "The main institutions of national government" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="The main institutions of national government"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            At national level, public power is distributed among the Executive,
            Parliament and the Judiciary.
          </p>

          <p className="govuk-body">
            They perform different constitutional roles. This helps prevent
            public power from being concentrated in one institution.
          </p>

          <h2 className="govuk-heading-m">
            The Executive
          </h2>

          <p className="govuk-body">
            The national Executive includes the President, Deputy President and
            the rest of the Cabinet.
          </p>

          <p className="govuk-body">
            The President is both Head of State and Head of Government.
          </p>

          <p className="govuk-body">
            The Executive is responsible for functions such as:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>implementing national laws and policies</li>
            <li>directing national administration</li>
            <li>developing government policy</li>
            <li>coordinating ministries and state departments</li>
            <li>preparing national budget and policy proposals</li>
            <li>performing other executive functions assigned by law</li>
          </ul>

          <p className="govuk-body">
            Cabinet Secretaries are responsible for ministries or areas of
            government assigned to them.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.executive.href}
              className="govuk-link"
            >
              {constitutionRefs.executive.label}
            </Link>
            .
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/presidency" className="govuk-link">
                The Presidency
              </Link>
            </li>

            <li>
              <Link href="/government/cabinet" className="govuk-link">
                The Cabinet
              </Link>
            </li>

            <li>
              <Link
                href="/government/institutions"
                className="govuk-link"
              >
                Ministries and public institutions
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-m">
            Parliament
          </h2>

          <p className="govuk-body">
            Parliament is Kenya&apos;s national legislature. It consists of the{" "}
            <strong>National Assembly</strong> and the <strong>Senate</strong>.
          </p>

          <p className="govuk-body">
            Parliament makes legislation, represents the people and performs
            oversight and financial functions given to it by the Constitution.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.legislature.href}
              className="govuk-link"
            >
              {constitutionRefs.legislature.label}
            </Link>
            .
          </p>

          <h3 className="govuk-heading-s">
            National Assembly
          </h3>

          <p className="govuk-body">
            The National Assembly represents the people of constituencies and
            special interests provided for by the Constitution.
          </p>

          <p className="govuk-body">
            Its functions include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>participating in national law-making</li>
            <li>determining allocation of national revenue</li>
            <li>appropriating money for national government expenditure</li>
            <li>overseeing national revenue and expenditure</li>
            <li>overseeing state organs within its constitutional mandate</li>
          </ul>

          <h3 className="govuk-heading-s">
            Senate
          </h3>

          <p className="govuk-body">
            The Senate represents the counties and serves to protect the
            interests of counties and their governments.
          </p>

          <p className="govuk-body">
            Its functions include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              participating in law-making where Bills concern county governments
            </li>
            <li>
              determining the allocation of nationally raised revenue among
              counties as provided by the Constitution
            </li>
            <li>
              overseeing national revenue allocated to county governments
            </li>
            <li>
              participating in certain constitutional proceedings involving the
              President or Deputy President
            </li>
          </ul>

          <div className="govuk-inset-text">
            The National Assembly and Senate are both parts of Parliament, but
            they do not perform identical functions.
          </div>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link
                href="/government/legislature"
                className="govuk-link"
              >
                Parliament overview
              </Link>
            </li>

            <li>
              <Link
                href="/government/legislature/national-assembly/members"
                className="govuk-link"
              >
                Members of the National Assembly
              </Link>
            </li>

            <li>
              <Link
                href="/government/legislature/senate/senators"
                className="govuk-link"
              >
                Senators
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-m">
            The Judiciary
          </h2>

          <p className="govuk-body">
            Judicial authority is exercised by courts and tribunals established
            by or under the Constitution.
          </p>

          <p className="govuk-body">
            The Judiciary interprets and applies the law, resolves disputes and
            protects the constitutional and legal rights of people appearing
            before the courts.
          </p>

          <p className="govuk-body">
            Judges and judicial officers are required to exercise judicial
            authority independently and subject only to the Constitution and
            the law.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.judiciary.href}
              className="govuk-link"
            >
              {constitutionRefs.judiciary.label}
            </Link>
            .
          </p>

          <h3 className="govuk-heading-s">
            Superior courts
          </h3>

          <ul className="govuk-list govuk-list--bullet">
            <li>Supreme Court</li>
            <li>Court of Appeal</li>
            <li>High Court</li>
            <li>Employment and Labour Relations Court</li>
            <li>Environment and Land Court</li>
          </ul>

          <h3 className="govuk-heading-s">
            Subordinate courts
          </h3>

          <p className="govuk-body">
            The judicial system also includes subordinate courts established
            under the Constitution and legislation, including magistrates&apos;
            courts and other courts or tribunals provided for by law.
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/judiciary" className="govuk-link">
                How the Judiciary works
              </Link>
            </li>

            <li>
              <Link href="/topics/crime-justice" className="govuk-link">
                Crime, justice and the law
              </Link>
            </li>
          </ul>

          <SectionPager
            previous={previous ? { href: `${guideBase}/${previous.slug}`, title: previous.title } : null}
            next={next ? { href: `${guideBase}/${next.slug}`, title: next.title } : null}
            parent={{ href: guideBase, title: guideName }}
          />

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> {lastUpdated}
          </p>
        </div>

        <RelatedNav links={[...relatedLinks]} />
      </div>
    </>
  );
}
