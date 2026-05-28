'use client';

import React from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

export default function LanguagesPage() {
  return (
    <div className="govuk-width-container">
      {/* GOV.UK Navigation Breadcrumbs */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and Culture", href: "/society-and-culture" },
          { text: "Languages", href: "/society-and-culture/languages" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* HEADER SECTION */}
        <div className="govuk-grid-row govuk-!-margin-bottom-7">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">National Identity and Heritage</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              Languages Spoken in Kenya
            </h1>
            <p className="govuk-body-l">
              An educational guide to Article 7 of the Constitution of Kenya, outlining the official, national, and indigenous languages that shape communication and social integration.
            </p>
          </div>
        </div>

        {/* CONTENT AND SIDEBAR MATRIX */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            {/* 1. CONSTITUTIONAL STATUS OF LANGUAGES */}
            <section id="constitutional-status" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">1. Constitutional Status</h2>
              <p className="govuk-body">
                Article 7 of the Constitution of Kenya clearly divides the linguistic structure of the public sector into two distinct categories to foster administrative efficiency while preserving national identity:
              </p>

              {/* Accessible Data Table for Language Classifications */}
              <table className="govuk-table govuk-!-margin-bottom-4">
                <caption className="govuk-table__caption govuk-table__caption--s">Constitutional Language Status (Article 7)</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header" style={{ width: "30%" }}>Classification</th>
                    <th scope="col" className="govuk-table__header" style={{ width: "25%" }}>Language</th>
                    <th scope="col" className="govuk-table__header">Statutory Application and Role</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>National Language</th>
                    <td className="govuk-table__cell">Kiswahili</td>
                    <td className="govuk-table__cell">Article 7(1). Serves as the primary medium for cultural expression, national identity, and inter-ethnic cohesion.</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>Official Languages</th>
                    <td className="govuk-table__cell">Kiswahili and English</td>
                    <td className="govuk-table__cell">Article 7(2). Both languages are legally authorized for public administration, legislative records, judicial proceedings, and official government publications.</td>
                  </tr>
                </tbody>
              </table>

              <p className="govuk-body">
                Furthermore, Article 7(3) places a mandatory requirement on the State to promote and protect the diversity of language among all Kenyan communities, alongside developing and facilitating the use of Kenyan Sign Language (KSL) and Braille.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 2. THE THREE MAJOR LINGUISTIC FAMILIES */}
            <section id="linguistic-families" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">2. Indigenous Language Families</h2>
              <p className="govuk-body">
                Beyond the administrative usage of English and Kiswahili, Kenya is home to over 40 distinct indigenous languages. These belong structurally to three primary African linguistic families:
              </p>

              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>Bantu Languages:</strong> The largest linguistic category in Kenya, spoken primarily across the Western, Nyanza, Central, and Coastal regions. Examples include Kikuyu, Luhya, Kamba, Kisii, Meru, and Mijikenda dialects.
                </li>
                <li>
                  <strong>Nilotic Languages:</strong> Spoken by communities concentrated along Lake Victoria and the Great Rift Valley system. This family is traditionally sub-categorized into River-Lake Nilotic (Luo), Highlands Nilotic (Kalenjin dialects), and Plains Nilotic (Maasai, Samburu, and Turkana).
                </li>
                <li>
                  <strong>Cushitic Languages:</strong> Spoken predominantly by pastoralist communities inhabiting the expansive northern and north-eastern arid zones, including Somali, Oromo, Rendille, and Borana languages.
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
            {/* 3. KENYAN SIGN LANGUAGE & ACCESSIBILITY */}
            <section id="sign-language" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">3. Kenyan Sign Language (KSL) and Braille</h2>
              <p className="govuk-body">
                The State has a constitutional obligation under Article 7(3)(b) to promote the development and use of indigenous modes of communication for persons with disabilities. 
              </p>
              <p className="govuk-body">
                Kenyan Sign Language (KSL) is the primary visual language used by the deaf community in Kenya. It features unique grammatical structures distinct from spoken or written languages. KSL interpreters are legally integrated into national broadcasting services, public courts, and major legislative assemblies to ensure equitable access to government data.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 4. URBAN LANGUAGE TRENDS */}
            <section id="urban-trends" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">4. Urban Language Evolution (Sheng)</h2>
              <p className="govuk-body">
                In multi-ethnic urban centers such as Nairobi, Mombasa, and Kisumu, language practices have evolved dynamically. This shift has given rise to <strong>Sheng</strong>—a vibrant, rapid-changing language hybrid.
              </p>
              <p className="govuk-body">
                Sheng blends standard Kiswahili grammar structure with a mixed vocabulary drawn from English, indigenous languages, and localized slang expressions. While it originated primarily among urban youth, it has grown into a mainstream medium utilized across commercial advertising, youth development programs, public health campaigns, and popular musical media to bridge ethnic gaps.
              </p>
            </section>
          </div>

          {/* SIDEBAR NAVIGATION COLUMN */}
          <aside className="govuk-grid-column-one-third" role="complementary">
            <div style={{ borderTop: "2px solid #1d70b8", paddingTop: "15px" }}>
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Related Guidance</h2>
              <ul className="govuk-list govuk-body-s">
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/communities" className="govuk-link">
                    <strong>Communities and Cultural Groups</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/national-symbols" className="govuk-link">
                    <strong>Official National Symbols Registry</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/traditional-culture" className="govuk-link">
                    <strong>Traditional Practices &amp; Ceremonies</strong>
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* FEEDBACK & FOOTER METADATA */}
        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-full">
            <LastUpdated published="2026-05-22" lastUpdated="2026-05-22" />
            
          </div>
        </div>

      </main>
    </div>
  );
}
