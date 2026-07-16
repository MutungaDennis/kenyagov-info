import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import PageContents from "@/components/site/PageContents";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Registering a death — government steps",
  description:
    "Life-event guide: death notification, death certificate and related Kenyan public processes.",
};

export default function RegisteringADeathGuidePage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Guides", href: "/guides" },
          { text: "Registering a death" },
        ]}
        caption="Life event"
        title="Registering a death — government steps"
        lead="What families typically need to do with government after a death in Kenya. This is general information, not legal or funeral advice."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning </span>
              Only use official registration channels. Do not pay unofficial
              agents who promise “express certificates” outside government
              systems.
            </strong>
          </div>

          <PageContents
            items={[
              { href: "#notify", text: "Medical and burial processes" },
              { href: "#register", text: "Register the death" },
              { href: "#certificate", text: "Death certificate uses" },
              { href: "#estate", text: "Estates and succession (high level)" },
              { href: "#help", text: "Where to get help" },
            ]}
          />

          <section id="notify" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">1. Medical and burial processes</h2>
            <p className="govuk-body">
              Hospitals or authorised medical practitioners issue death-related
              medical documentation. Burial and cremation arrangements follow
              family, cultural and local authority rules.
            </p>
          </section>

          <section id="register" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">2. Register the death</h2>
            <p className="govuk-body">
              Death registration creates the legal record needed for a death
              certificate. Use civil registration / eCitizen pathways or
              assisted service at a{" "}
              <Link href="/huduma-centres" className="govuk-link">
                Huduma Centre
              </Link>{" "}
              where available.
            </p>
            <p className="govuk-body">
              <Link
                href="/topics/identity-civil-registration"
                className="govuk-link"
              >
                Identity and civil registration
              </Link>
            </p>
          </section>

          <section id="certificate" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">3. Death certificate uses</h2>
            <p className="govuk-body">A death certificate is often required for:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>bank and insurance claims</li>
              <li>pension and social security processes</li>
              <li>succession and estate administration</li>
              <li>updating voter and other public registers where applicable</li>
            </ul>
          </section>

          <section id="estate" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">4. Estates and succession (high level)</h2>
            <p className="govuk-body">
              Inheritance and estate administration follow succession law and may
              involve the courts or other formal processes. This website does not
              provide legal advice — speak to a qualified advocate or legal aid
              provider for your situation.
            </p>
            <p className="govuk-body">
              <Link href="/topics/crime-justice" className="govuk-link">
                Crime, justice and the law
              </Link>
            </p>
          </section>

          <section id="help" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Where to get help</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link href="/ecitizen" className="govuk-link">
                  eCitizen explained
                </Link>
              </li>
              <li>
                <Link href="/contact-government" className="govuk-link">
                  Contact government
                </Link>
              </li>
              <li>
                <Link href="/scams" className="govuk-link">
                  Scams and fake websites
                </Link>
              </li>
            </ul>
          </section>
        </div>

        <RelatedNav
          links={[
            { text: "Having a baby", href: "/guides/having-a-baby" },
            { text: "Starting a business", href: "/guides/starting-a-business" },
            { text: "All guides", href: "/guides" },
            { text: "Popular services", href: "/services/popular" },
          ]}
        />
      </div>
    </>
  );
}
