// app/society-and-culture/languages/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

export const revalidate = 86400;
export const dynamic = "force-static";

export default function LanguagesPage() {
  return (
    <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          { text: "Languages", href: "/society-and-culture/languages" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <span className="govuk-caption-xl">People and communities</span>
            <h1 className="govuk-heading-xl">Languages of Kenya</h1>
            
            <p className="govuk-body-l">
              Kenya is a multilingual country with over 68 languages spoken across its communities. This page explains the constitutional status of languages, the major language families, and efforts to preserve linguistic diversity.
            </p>
          </div>
        </div>

        <div className="govuk-grid-row govuk-!-margin-top-6">
          
          {/* Main content */}
          <div className="govuk-grid-column-two-thirds">

            {/* Table of contents */}
            <nav className="govuk-!-margin-bottom-8" aria-label="Page contents">
              <h2 className="govuk-heading-s">Contents</h2>
              <ol className="govuk-list govuk-list--spaced">
                <li><a className="govuk-link" href="#constitutional-status">Constitutional status of languages</a></li>
                <li><a className="govuk-link" href="#linguistic-families">Indigenous language families</a></li>
                <li><a className="govuk-link" href="#sign-language">Kenyan Sign Language and Braille</a></li>
                <li><a className="govuk-link" href="#urban-trends">Urban language evolution (Sheng)</a></li>
                <li><a className="govuk-link" href="#endangered-languages">Endangered languages</a></li>
                <li><a className="govuk-link" href="#preservation">Language preservation efforts</a></li>
              </ol>
            </nav>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Constitutional Status */}
            <section id="constitutional-status" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Constitutional status of languages</h2>
              <p className="govuk-body">
                <Link href="/constitution/chapter/1/article/7" className="govuk-link">
                  Article 7
                </Link>
                {' '}of the Constitution recognises two categories of languages for official use:
              </p>

              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">
                  Constitutional classification of languages in Kenya
                </caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">Classification</th>
                    <th scope="col" className="govuk-table__header">Language</th>
                    <th scope="col" className="govuk-table__header">Role</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">National language</th>
                    <td className="govuk-table__cell">Kiswahili</td>
                    <td className="govuk-table__cell">The language of national identity and cultural expression. Used to promote unity across ethnic groups.</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Official languages</th>
                    <td className="govuk-table__cell">Kiswahili and English</td>
                    <td className="govuk-table__cell">Used for government business, legislation, court proceedings, and official records.</td>
                  </tr>
                </tbody>
              </table>

              <p className="govuk-body">
                The Constitution also requires the State to promote and protect the diversity of languages among Kenyan communities, and to develop and promote the use of Kenyan Sign Language and Braille.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Linguistic Families */}
            <section id="linguistic-families" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Indigenous language families</h2>
              <p className="govuk-body">
                Beyond English and Kiswahili, Kenya is home to over 40 indigenous languages. These belong to three major African language families:
              </p>

              <h3 className="govuk-heading-s">Bantu languages</h3>
              <p className="govuk-body">
                The largest language group in Kenya, spoken mainly in the Western, Nyanza, Central and Coastal regions. Major Bantu languages include:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>Kikuyu (Gĩkũyũ)</li>
                <li>Luhya (Luyia)</li>
                <li>Kamba (Kĩkamba)</li>
                <li>Kisii (Ekegusii)</li>
                <li>Meru (Kĩmĩrũ)</li>
                <li>Mijikenda (nine dialects including Giriama, Digo, and Duruma)</li>
                <li>Taita (Kidawida)</li>
              </ul>

              <h3 className="govuk-heading-s">Nilotic languages</h3>
              <p className="govuk-body">
                Spoken by communities around Lake Victoria and the Rift Valley. Nilotic languages are divided into three groups:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>River-Lake Nilotic (Luo)</strong> — spoken by the Luo community around Lake Victoria
                </li>
                <li>
                  <strong>Highlands Nilotic (Kalenjin)</strong> — includes Kipsigis, Nandi, Tugen, Pokot, Marakwet, Keiyo, Sabaot and Terik
                </li>
                <li>
                  <strong>Plains Nilotic</strong> — includes Maasai (Maa), Samburu, and Turkana
                </li>
              </ul>

              <h3 className="govuk-heading-s">Cushitic languages</h3>
              <p className="govuk-body">
                Spoken mainly by pastoralist communities in the northern and north-eastern arid regions:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>Somali (Af-Soomaali)</li>
                <li>Oromo (Afaan Oromoo)</li>
                <li>Rendille</li>
                <li>Borana (Afaan Borana)</li>
                <li>Gabbra</li>
                <li>Orma</li>
              </ul>

              <p className="govuk-body">
                Kenya also has a small number of languages from other families, including Arabic (spoken along the coast) and Hindi (spoken by the Asian community).
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Sign Language */}
            <section id="sign-language" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Kenyan Sign Language and Braille</h2>
              <p className="govuk-body">
                The Constitution requires the State to promote the use of communication methods for people with disabilities.
              </p>
              <p className="govuk-body">
                <strong>Kenyan Sign Language (KSL)</strong> is the primary visual language used by the deaf community in Kenya. It has its own grammar and structure, distinct from spoken or written languages. KSL interpreters are used in:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>national broadcasting services</li>
                <li>public courts and tribunals</li>
                <li>Parliament and county assemblies</li>
                <li>schools for the deaf</li>
              </ul>
              <p className="govuk-body">
                <strong>Braille</strong> is the tactile writing system used by blind and visually impaired Kenyans. The Kenya Institute for the Blind produces educational materials and official documents in Braille.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Urban Trends */}
            <section id="urban-trends" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Urban language evolution (Sheng)</h2>
              <p className="govuk-body">
                In multi-ethnic urban centres like Nairobi, Mombasa and Kisumu, a dynamic language hybrid called <strong>Sheng</strong> has emerged.
              </p>
              <p className="govuk-body">
                Sheng blends Kiswahili grammar with vocabulary drawn from English, indigenous languages, and local slang. While it began as youth slang, it is now widely used in:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>commercial advertising</li>
                <li>popular music and entertainment</li>
                <li>public health campaigns</li>
                <li>social media and digital communication</li>
              </ul>
              <p className="govuk-body">
                Sheng serves as a bridge across ethnic and class divides in urban Kenya, though it is not recognised as an official language.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Endangered Languages */}
            <section id="endangered-languages" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Endangered languages</h2>
              <p className="govuk-body">
                Several indigenous languages in Kenya are at risk of disappearing. A language is considered endangered when the younger generation no longer learns or speaks it as their first language.
              </p>
              <p className="govuk-body">
                Languages at risk include:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>El Molo</strong> — spoken by fewer than 10 people around Lake Turkana. Considered critically endangered.
                </li>
                <li>
                  <strong>Omotik</strong> — a Southern Nilotic language with very few remaining speakers.
                </li>
                <li>
                  <strong>Yaaku (Mogogodo)</strong> — formerly spoken by the Mukogodo community in Laikipia County. Most speakers have shifted to Maasai.
                </li>
                <li>
                  <strong>Suba</strong> — spoken around Lake Victoria, with speakers increasingly shifting to Luo.
                </li>
                <li>
                  <strong>Assan</strong> — a Cushitic language that is nearly extinct.
                </li>
              </ul>
              <p className="govuk-body">
                Language loss often occurs when communities shift to more widely spoken languages for economic or social reasons. When a language disappears, so does the unique cultural knowledge, oral traditions, and worldview it carries.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Preservation Efforts */}
            <section id="preservation" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Language preservation efforts</h2>
              <p className="govuk-body">
                Several institutions and initiatives work to preserve Kenya's linguistic heritage:
              </p>
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <strong>Kenya Institute of Curriculum Development (KICD)</strong> — develops mother-tongue education materials for early primary schools. Children are taught in their local language for the first three years of primary school.
                </li>
                <li>
                  <strong>National Museums of Kenya</strong> — documents and archives indigenous languages, including recording oral histories and traditional knowledge.
                </li>
                <li>
                  <strong>Universities</strong> — institutions like the University of Nairobi, Kenyatta University, and Maseno University offer degree programmes in linguistics and African languages.
                </li>
                <li>
                  <strong>Community language boards</strong> — some communities have established boards to standardise orthography (writing systems) and produce dictionaries.
                </li>
                <li>
                  <strong>Digital archives</strong> — projects like the Endangered Languages Project and local digital initiatives are creating online resources for minority languages.
                </li>
              </ul>
              <p className="govuk-body">
                The{' '}
                <Link href="/government/institutions/kiswahili-institute" className="govuk-link">
                  Kiswahili Institute (Chama cha Kiswahili Tanzania)
                </Link>
                {' '}works regionally to promote Kiswahili across East Africa, including standardisation and development of new terminology.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <LastUpdated published="2026-05-22" lastUpdated="2026-07-02" />

          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/society-and-culture/communities" className="govuk-link">
                      Communities
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/national-symbols" className="govuk-link">
                      National symbols
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/constitution-and-national-values" className="govuk-link">
                      Constitution and national values
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/heritage-sites" className="govuk-link">
                      Heritage sites
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture" className="govuk-link">
                      All society and culture
                    </Link>
                  </li>
                </ul>
              </nav>

              <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

              <div className="govuk-inset-text">
                <p className="govuk-body govuk-!-margin-bottom-0">
                  The Ministry of Education, Science and Technology oversees language policy and mother-tongue education in Kenya.
                </p>
              </div>
            </aside>
          </div>
        </div>
      
    
  
    </>
);
}