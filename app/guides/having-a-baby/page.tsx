import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import PageContents from "@/components/site/PageContents";
import { constitutionRefs } from "@/lib/constitution-links";

export const metadata: Metadata = {
  title: "Having a baby — government steps",
  description:
    "Life-event guide: registering a birth, health cover pointers and related Kenyan government processes.",
};

export default function HavingABabyGuidePage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Guides", href: "/guides" },
          { text: "Having a baby" },
        ]}
        caption="Life event"
        title="Having a baby — government steps"
        lead="A plain-language overview of common public processes after a birth in Kenya. This is not medical advice and does not replace hospital or midwife guidance."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              Applications and payments happen on official systems such as{" "}
              <Link href="/ecitizen" className="govuk-link">
                eCitizen
              </Link>{" "}
              or at{" "}
              <Link href="/huduma-centres" className="govuk-link">
                Huduma Centres
              </Link>
              , not on this website.
            </p>
          </div>

          <PageContents
            items={[
              { href: "#health", text: "Health and the birth" },
              { href: "#register", text: "Register the birth" },
              { href: "#documents", text: "Documents you may need later" },
              { href: "#benefits", text: "Social protection and support" },
              { href: "#next", text: "What to do next" },
            ]}
          />

          <section id="health" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">1. Health and the birth</h2>
            <p className="govuk-body">
              Maternity care is provided through public and private facilities.
              County governments manage many public health facilities. National
              referral hospitals handle complex cases.
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link href="/topics/health" className="govuk-link">
                  Health and social care topic
                </Link>
              </li>
              <li>
                <Link href="/county-vs-national" className="govuk-link">
                  County vs national functions
                </Link>
              </li>
            </ul>
          </section>

          <section id="register" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">2. Register the birth</h2>
            <p className="govuk-body">
              Births should be registered so the child can obtain a birth
              certificate and later a national identity card. Registration is a
              civil registration function of the national government.
            </p>
            <ol className="govuk-list govuk-list--number">
              <li>Obtain the hospital or midwife notification documents.</li>
              <li>
                Start the registration process through official channels (often
                eCitizen or a designated registration office / Huduma Centre).
              </li>
              <li>Keep the certificate safe for school and future ID applications.</li>
            </ol>
            <p className="govuk-body">
              <Link
                href="/topics/identity-civil-registration"
                className="govuk-link"
              >
                Identity and civil registration
              </Link>
            </p>
          </section>

          <section id="documents" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">3. Documents you may need later</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>birth certificate</li>
              <li>parents’ national IDs or passports</li>
              <li>immunisation records from health facilities</li>
              <li>school admission documents as the child grows</li>
            </ul>
          </section>

          <section id="benefits" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">4. Social protection and support</h2>
            <p className="govuk-body">
              Some families may qualify for social protection programmes. Rules
              change — check official ministry and county social development
              offices.
            </p>
            <p className="govuk-body">
              <Link
                href="/topics/benefits-social-protection"
                className="govuk-link"
              >
                Benefits and social protection
              </Link>
            </p>
            <p className="govuk-body">
              Economic and social rights, including health-related rights, are
              framed in{" "}
              <Link
                href={constitutionRefs.economicSocialRights.href}
                className="govuk-link"
              >
                {constitutionRefs.economicSocialRights.label}
              </Link>
              .
            </p>
          </section>

          <section id="next" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">What to do next</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link href="/services/popular" className="govuk-link">
                  Popular services
                </Link>
              </li>
              <li>
                <Link href="/scams" className="govuk-link">
                  Avoid scams and fake agents
                </Link>
              </li>
              <li>
                <Link href="/contact-government" className="govuk-link">
                  Contact government
                </Link>
              </li>
            </ul>
          </section>
        </div>

        <RelatedNav
          links={[
            { text: "Registering a death", href: "/guides/registering-a-death" },
            { text: "Starting a business", href: "/guides/starting-a-business" },
            { text: "All guides", href: "/guides" },
            { text: "All topics", href: "/topics" },
          ]}
        />
      </div>
    </>
  );
}
