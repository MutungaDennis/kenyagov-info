// app/society-and-culture/national-symbols/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

export default function NationalSymbolsPage() {
  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          { text: "National symbols", href: "/society-and-culture/national-symbols" },
        ]}
      />

      
        
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">National identity and heritage</span>
            <h1 className="govuk-heading-xl">National symbols of Kenya</h1>
            <p className="govuk-body-l">
              <Link href="/constitution/chapter/2/article/9" className="govuk-link">
                Article 9(1) of the Constitution of Kenya
              </Link>
              {' '}establishes the official national symbols. These represent the sovereignty, unity and shared values of the Republic.
            </p>
          </div>
        </div>

        <div className="govuk-grid-row govuk-!-margin-top-6">
          
          {/* Main content */}
          <div className="govuk-grid-column-two-thirds">

            {/* Legal notice */}
            <div className="govuk-inset-text govuk-!-margin-bottom-8">
              <p className="govuk-body">
                The National Flag, Emblems and Names Act (Cap. 99) protects Kenya's national symbols. It is an offence to use the Coat of Arms, Public Seal or other protected emblems for commercial purposes without written permission from the Cabinet Secretary.
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                For this reason, this page provides textual descriptions of the symbols rather than graphic reproductions.
              </p>
            </div>

            {/* Table of contents */}
            <nav className="govuk-!-margin-bottom-8" aria-label="Page contents">
              <h2 className="govuk-heading-s">Contents</h2>
              <ol className="govuk-list govuk-list--spaced">
                <li><a className="govuk-link" href="#national-flag">The national flag</a></li>
                <li><a className="govuk-link" href="#coat-of-arms">The Coat of Arms</a></li>
                <li><a className="govuk-link" href="#national-anthem">The national anthem</a></li>
                <li><a className="govuk-link" href="#national-motto">The national motto</a></li>
                <li><a className="govuk-link" href="#national-pledge">The national pledge</a></li>
                <li><a className="govuk-link" href="#public-seal">The Public Seal</a></li>
              </ol>
            </nav>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 1. THE NATIONAL FLAG */}
            <section id="national-flag" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">The national flag</h2>
              <p className="govuk-body">
                The national flag is the most recognised symbol of Kenya. It is based on the flag of the Kenya African National Union (KANU), which led the country to independence in 1963.
              </p>
              <p className="govuk-body">
                The flag has a ratio of 2:3 (height to width). From top to bottom, it consists of equal horizontal bands of black, white, red, white and green, with a traditional Maasai shield and two crossed spears in the centre.
              </p>

              <h3 className="govuk-heading-s">Meaning of the flag elements</h3>
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">
                  The meaning of each element on the national flag
                </caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">Element</th>
                    <th scope="col" className="govuk-table__header">Meaning</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Black</th>
                    <td className="govuk-table__cell">The people of Kenya</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Red</th>
                    <td className="govuk-table__cell">The blood shed during the struggle for independence</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Green</th>
                    <td className="govuk-table__cell">The country's natural wealth and agricultural resources</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">White fimbriation</th>
                    <td className="govuk-table__cell">Peace, honesty and unity</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Shield and spears</th>
                    <td className="govuk-table__cell">The defence of freedom and national sovereignty</td>
                  </tr>
                </tbody>
              </table>

              <div className="govuk-warning-text">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-visually-hidden">Warning</span>
                  Flying the national flag on private vehicles is restricted by law to the President, Deputy President, Chief Justice, Speakers of Parliament, Cabinet Secretaries and accredited foreign diplomats.
                </strong>
              </div>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 2. THE COAT OF ARMS */}
            <section id="coat-of-arms" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">The Coat of Arms</h2>
              <p className="govuk-body">
                The Coat of Arms is the official state emblem of Kenya. It is used on government documents, official correspondence and state buildings. The design is described in the Second Schedule of the Constitution.
              </p>
              <p className="govuk-body">The Coat of Arms contains the following elements:</p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>Two lions</strong> — two golden African lions standing on either side, holding traditional spears. They symbolise wildlife heritage and national courage.
                </li>
                <li>
                  <strong>The central shield</strong> — features the national colours (black, red, green and white) with a rooster holding an axe. The rooster represents the new dawn and the spirit of hard work.
                </li>
                <li>
                  <strong>Mount Kenya</strong> — the entire composition rests on a silhouette of Mount Kenya, the country's highest mountain.
                </li>
                <li>
                  <strong>Agricultural produce</strong> — the foreground shows Kenya's main crops: coffee, pyrethrum, sisal, tea, maize and pineapples.
                </li>
                <li>
                  <strong>The motto scroll</strong> — at the base, a scroll bears the national motto "Harambee".
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 3. THE NATIONAL ANTHEM */}
            <section id="national-anthem" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">The national anthem</h2>
              <p className="govuk-body">
                Kenya's national anthem was composed in 1963 by a committee led by Graham Hyslop, G.W. Senoga Zake, Peter Kibukosya and Washington Omondi. It was first performed at the independence ceremony on 12 December 1963.
              </p>
              <p className="govuk-body">
                The anthem has three stanzas, written in both Kiswahili and English.
              </p>

              <h3 className="govuk-heading-s">Stanza 1</h3>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <p className="govuk-body">
                    <strong>Kiswahili</strong><br />
                    Ee Mungu nguvu yetu<br />
                    Ilete baraka kwetu<br />
                    Haki iwe ngao na mlinzi<br />
                    Natukae na undugu<br />
                    Amani na uhuru<br />
                    Raha tupate na ustawi
                  </p>
                </div>
                <div className="govuk-grid-column-one-half">
                  <p className="govuk-body">
                    <strong>English</strong><br />
                    O God of all creation<br />
                    Bless this our land and nation<br />
                    Justice be our shield and defender<br />
                    May we dwell in unity<br />
                    Peace and liberty<br />
                    Plenty be found within our borders
                  </p>
                </div>
              </div>

              <h3 className="govuk-heading-s">Stanza 2</h3>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <p className="govuk-body">
                    <strong>Kiswahili</strong><br />
                    Amkeni ndugu zetu<br />
                    Tufanye sote bidii<br />
                    Nasi tujitoe kwa nguvu<br />
                    Nchi yetu ya Kenya<br />
                    Tunayoipenda<br />
                    Tuwe tayari kuilinda
                  </p>
                </div>
                <div className="govuk-grid-column-one-half">
                  <p className="govuk-body">
                    <strong>English</strong><br />
                    Let one and all arise<br />
                    With hearts both strong and true<br />
                    Service be our earnest endeavour<br />
                    And our homeland of Kenya<br />
                    Heritage of splendour<br />
                    Firm may we stand to defend
                  </p>
                </div>
              </div>

              <h3 className="govuk-heading-s">Stanza 3</h3>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <p className="govuk-body">
                    <strong>Kiswahili</strong><br />
                    Natujenge taifa letu<br />
                    Ee, ndio wajibu wetu<br />
                    Kenya istahili heshima<br />
                    Tuungane mikono<br />
                    Pamoja kazini<br />
                    Kila siku tuwe na shukrani
                  </p>
                </div>
                <div className="govuk-grid-column-one-half">
                  <p className="govuk-body">
                    <strong>English</strong><br />
                    Let all with one accord<br />
                    In common bond united<br />
                    Build this our nation together<br />
                    And the glory of Kenya<br />
                    The fruit of our labour<br />
                    Fill every heart with thanksgiving
                  </p>
                </div>
              </div>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 4. THE NATIONAL MOTTO */}
            <section id="national-motto" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">The national motto</h2>
              <p className="govuk-body">
                Kenya's national motto is <strong>"Harambee"</strong>, a Kiswahili word meaning "Let us all pull together".
              </p>
              <p className="govuk-body">
                The motto appears on the scroll at the base of the Coat of Arms. It represents the Kenyan tradition of community-based mutual assistance, where people come together to contribute resources and labour for the common good.
              </p>
              <p className="govuk-body">
                The Harambee spirit was central to Kenya's early development, with communities raising funds to build schools, hospitals and other social facilities.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 5. THE NATIONAL PLEDGE */}
            <section id="national-pledge" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">The national pledge</h2>
              <p className="govuk-body">
                The National Pledge of Loyalty is a civic declaration recited at public assemblies, schools and official ceremonies. It affirms a citizen's commitment to the Republic of Kenya.
              </p>
              <div className="govuk-inset-text">
                <p className="govuk-body govuk-!-margin-bottom-0">
                  "I pledge my loyalty to the Republic of Kenya and to the National Flag; that I will diligently serve my country with all my heart, mind and strength; and that I will maintain and defend the integrity of Kenya, against all enemies, both internal and external, so help me God."
                </p>
              </div>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 6. THE PUBLIC SEAL */}
            <section id="public-seal" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">The Public Seal</h2>
              <p className="govuk-body">
                The Public Seal is the official stamp used by the Executive to validate important state documents, including treaties, presidential proclamations and high-level legal instruments.
              </p>
              <p className="govuk-body">
                The seal is circular and features the graphic elements of the national Coat of Arms. It is kept in the custody of the President.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <LastUpdated
              published="2026-05-22"
              lastUpdated="2026-07-02"
            />

          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/society-and-culture/holidays" className="govuk-link">
                      Public holidays
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/constitution-and-national-values" className="govuk-link">
                      Constitution and national values
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/national-events" className="govuk-link">
                      National events
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/heritage-sites" className="govuk-link">
                      Heritage sites
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/cultural-calendar" className="govuk-link">
                      Cultural calendar
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture" className="govuk-link">
                      All society and culture
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      
    
  
  </>
);
}