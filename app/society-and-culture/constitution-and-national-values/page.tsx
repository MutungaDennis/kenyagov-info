// app/society-and-culture/constitution-and-national-values/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

export default function ConstitutionAndNationalValuesPage() {
  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          { text: "Constitution and national values", href: "/society-and-culture/constitution-and-national-values" },
        ]}
      />

      
        
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">National identity and heritage</span>
            <h1 className="govuk-heading-xl">The Constitution and national values</h1>
            <p className="govuk-body-l">
              An overview of Kenya's constitutional framework, the core principles of governance, and the shared values that shape civic life.
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
                <li><a className="govuk-link" href="#introduction">Introduction to the Constitution</a></li>
                <li><a className="govuk-link" href="#national-values">National values and principles of governance</a></li>
                <li><a className="govuk-link" href="#national-identity">National identity and diversity</a></li>
                <li><a className="govuk-link" href="#government-structure">Structure of government</a></li>
                <li><a className="govuk-link" href="#bill-of-rights">Fundamental rights and freedoms</a></li>
                <li><a className="govuk-link" href="#civic-responsibilities">Civic responsibilities</a></li>
                <li><a className="govuk-link" href="#public-participation">Public participation</a></li>
                <li><a className="govuk-link" href="#devolution">Devolution</a></li>
                <li><a className="govuk-link" href="#commissions">Constitutional commissions and independent offices</a></li>
                <li><a className="govuk-link" href="#amending">Amending the Constitution</a></li>
                <li><a className="govuk-link" href="#history">Constitutional history</a></li>
              </ol>
            </nav>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 1. INTRODUCTION */}
            <section id="introduction" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Introduction to the Constitution</h2>
              <p className="govuk-body">
                The{' '}
                <Link href="/constitution" className="govuk-link">
                  Constitution of Kenya
                </Link>
                {' '}was promulgated on 27 August 2010. It is the supreme law of the Republic and binds all state organs, public officers, and citizens.
              </p>
              <p className="govuk-body">
                The Constitution:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>sets up the framework for how Kenya is governed</li>
                <li>protects fundamental rights through a comprehensive Bill of Rights</li>
                <li>divides authority between the national government and 47 county governments</li>
                <li>establishes the values that hold the nation together</li>
              </ul>
              <p className="govuk-body">
                Read the full{' '}
                <Link href="/constitution" className="govuk-link">
                  Constitution of Kenya 2010
                </Link>
                {' '}on this website.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 2. NATIONAL VALUES */}
            <section id="national-values" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">National values and principles of governance</h2>
              <p className="govuk-body">
                <Link href="/constitution/chapter/2/article/10" className="govuk-link">
                  Article 10
                </Link>
                {' '}of the Constitution lists the national values that bind all state organs, state officers, public entities, and citizens whenever they apply or interpret the law, or make public policy decisions.
              </p>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Patriotism and national unity</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Encourages devotion to the development, security and cultural heritage of Kenya. It prioritises shared nationhood over individual or ethnic interests.
                  </p>
                </div>
              </details>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Sharing and devolution of power</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Prevents the concentration of absolute authority in one central body. Power and resources are shared across the 47 county governments.
                  </p>
                </div>
              </details>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">The rule of law</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Every person, regardless of rank or status, is equal before the law. No one is above the law.
                  </p>
                </div>
              </details>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Democracy and participation of the people</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Governance must be carried out through democratically elected representatives and open public participation.
                  </p>
                </div>
              </details>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Human dignity, equity and social justice</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    All public systems must protect the inherent worth of every person, ensure fair distribution of resources, and remove barriers that disadvantage marginalised communities.
                  </p>
                </div>
              </details>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Equality</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Every person is equal before the law and has the right to equal protection and benefit of the law, including full and equal enjoyment of all rights and fundamental freedoms.
                  </p>
                </div>
              </details>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Protection of the marginalised</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    The interests of minority and marginalised groups must be protected and given special attention in national development.
                  </p>
                </div>
              </details>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Good governance, integrity, transparency and accountability</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Public administration must be transparent, free from corruption, and answerable to the public.
                  </p>
                </div>
              </details>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Sustainable development</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Development must meet the needs of the present without compromising the ability of future generations to meet their own needs.
                  </p>
                </div>
              </details>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 3. NATIONAL IDENTITY */}
            <section id="national-identity" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">National identity and diversity</h2>
              <p className="govuk-body">
                The Constitution recognises Kenya's cultural diversity as the foundation of its national identity. It balances a single, shared citizenship with deep respect for different ethnic traditions and languages.
              </p>
              <p className="govuk-body">
                Explore related topics:
              </p>
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/society-and-culture/national-symbols" className="govuk-link">
                    National symbols
                  </Link>
                  {' '}— the flag, Coat of Arms, anthem, motto and pledge
                </li>
                <li>
                  <Link href="/society-and-culture/languages" className="govuk-link">
                    Languages
                  </Link>
                  {' '}— Kiswahili as the national language, alongside English and indigenous languages
                </li>
                <li>
                  <Link href="/society-and-culture/communities" className="govuk-link">
                    Communities
                  </Link>
                  {' '}— population data on Kenya's ethnic communities
                </li>
                <li>
                  <Link href="/society-and-culture/religion-and-faith" className="govuk-link">
                    Religion and faith
                  </Link>
                  {' '}— Kenya's diverse religious traditions
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 4. STRUCTURE OF GOVERNMENT */}
            <section id="government-structure" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Structure of government</h2>
              <p className="govuk-body">
                The Constitution divides state authority into three independent branches, plus a devolved tier of government:
              </p>
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/presidency" className="govuk-link">
                    The Executive
                  </Link>
                  {' '}— the President, Deputy President and Cabinet. Executes national laws and state policy.
                </li>
                <li>
                  <Link href="/government/legislature" className="govuk-link">
                    The Legislature
                  </Link>
                  {' '}— the National Assembly and Senate. Makes laws and oversees public spending.
                </li>
                <li>
                  <Link href="/government/judiciary" className="govuk-link">
                    The Judiciary
                  </Link>
                  {' '}— the courts, headed by the Chief Justice. Independent and has exclusive authority to interpret the law.
                </li>
                <li>
                  <Link href="/government/counties" className="govuk-link">
                    Devolved government
                  </Link>
                  {' '}— 47 County Governments, each with a County Executive (headed by a Governor) and a County Assembly.
                </li>
              </ul>
              <p className="govuk-body">
                See the full{' '}
                <Link href="/government" className="govuk-link">
                  government directory
                </Link>
                {' '}for a complete list of all state institutions.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 5. BILL OF RIGHTS */}
            <section id="bill-of-rights" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Fundamental rights and freedoms</h2>
              <p className="govuk-body">
                <Link href="/constitution/chapter/4" className="govuk-link">
                  Chapter 4
                </Link>
                {' '}of the Constitution contains a comprehensive Bill of Rights. It protects individual liberties and group rights. Key rights include:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>Equality and freedom from discrimination</strong> — equal treatment before the law regardless of race, sex, religion, ethnicity or social origin
                </li>
                <li>
                  <strong>Right to life</strong> — life begins at conception
                </li>
                <li>
                  <strong>Human dignity</strong> — every person has inherent dignity and the right to have that dignity respected
                </li>
                <li>
                  <strong>Freedom of expression and media</strong> — includes freedom to seek, receive and impart information
                </li>
                <li>
                  <strong>Freedom of religion and conscience</strong> — no state religion; every person may worship freely
                </li>
                <li>
                  <strong>Freedom of assembly and association</strong> — the right to gather peacefully and form organisations
                </li>
                <li>
                  <strong>Political rights</strong> — the right to vote, stand for election and participate in political processes
                </li>
                <li>
                  <strong>Economic and social rights</strong> — the right to health care, clean water, adequate housing, food, social security and education
                </li>
                <li>
                  <strong>Environmental rights</strong> — the right to a clean and healthy environment
                </li>
                <li>
                  <strong>Consumer rights</strong> — the right to goods and services of reasonable quality
                </li>
                <li>
                  <strong>Protection for specific groups</strong> — tailored protections for children, youth, persons with disabilities, older members of society and minority communities
                </li>
              </ul>
              <p className="govuk-body">
                Read the full{' '}
                <Link href="/constitution/chapter/4" className="govuk-link">
                  Bill of Rights (Chapter 4)
                </Link>
                .
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 6. CIVIC RESPONSIBILITIES */}
            <section id="civic-responsibilities" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Civic responsibilities</h2>
              <p className="govuk-body">
                A strong democracy depends on active civic participation. Key duties of Kenyan citizens include:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>Respecting the Constitution</strong> — upholding, defending and obeying the law
                </li>
                <li>
                  <strong>Paying taxes</strong> — contributing national and county taxes to fund public services
                </li>
                <li>
                  <strong>Democratic participation</strong> — registering to vote and taking part in elections and referendums
                </li>
                <li>
                  <strong>Respecting others</strong> — tolerating diverse opinions and protecting the freedoms of fellow citizens
                </li>
                <li>
                  <strong>Protecting the environment</strong> — cooperating with conservation efforts to preserve natural resources for future generations
                </li>
                <li>
                  <strong>Reporting corruption</strong> — reporting abuse of power and misuse of public resources
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 7. PUBLIC PARTICIPATION */}
            <section id="public-participation" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Public participation</h2>
              <p className="govuk-body">
                Public participation is a constitutional requirement. All law-making and public policy processes must include opportunities for citizens to contribute.
              </p>
              <p className="govuk-body">
                Government ministries, parliamentary committees and county executives are required to:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>give timely notice of proposed laws and policies</li>
                <li>hold public forums and consultations</li>
                <li>consider public views before making decisions</li>
              </ul>
              <p className="govuk-body">
                Citizens can take part through:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>Town hall meetings</strong> — attending county budget forums to influence local development priorities
                </li>
                <li>
                  <strong>Written submissions</strong> — sending memoranda to Parliament on pending bills
                </li>
                <li>
                  <strong>Citizen petitions</strong> — lodging formal petitions to Parliament to request investigations into public service delivery
                </li>
                <li>
                  <strong>Public hearings</strong> — giving oral evidence at committee hearings
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 8. DEVOLUTION */}
            <section id="devolution" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Devolution</h2>
              <p className="govuk-body">
                Devolution divides government functions between the National Government and 47 County Governments. Its main goal is to bring services closer to the people and ensure fair distribution of resources.
              </p>
              <p className="govuk-body">
                <strong>National government responsibilities</strong> include foreign policy, national defence, the judicial system, immigration, and economic planning.
              </p>
              <p className="govuk-body">
                <strong>County government responsibilities</strong> include agriculture, county health facilities, pre-primary education, local transport, and waste management.
              </p>
              <p className="govuk-body">
                Explore the{' '}
                <Link href="/government/counties" className="govuk-link">
                  47 county governments
                </Link>
                .
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 9. CONSTITUTIONAL COMMISSIONS */}
            <section id="commissions" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Constitutional commissions and independent offices</h2>
              <p className="govuk-body">
                <Link href="/constitution/chapter/15" className="govuk-link">
                  Chapter 15
                </Link>
                {' '}of the Constitution establishes independent commissions and offices. These bodies are free from executive control and are designed to safeguard democracy, protect human rights and ensure financial accountability.
              </p>

              <h3 className="govuk-heading-s">Constitutional commissions</h3>
              <p className="govuk-body-s">
                Multi-member bodies established under Article 248(2).
              </p>
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/iebc" className="govuk-link">
                    Independent Electoral and Boundaries Commission (IEBC)
                  </Link>
                  {' '}— conducts elections and manages voter registration
                </li>
                <li>
                  <Link href="/government/institutions/eacc" className="govuk-link">
                    Ethics and Anti-Corruption Commission (EACC)
                  </Link>
                  {' '}— fights corruption and promotes integrity in public office
                </li>
                <li>
                  <Link href="/government/institutions/cra" className="govuk-link">
                    Commission on Revenue Allocation (CRA)
                  </Link>
                  {' '}— recommends how national revenue is shared between national and county governments
                </li>
                <li>
                  <Link href="/government/institutions/salaries-commission" className="govuk-link">
                    Salaries and Remuneration Commission (SRC)
                  </Link>
                  {' '}— sets and reviews pay for all public officers
                </li>
                <li>
                  <Link href="/government/institutions/kenya-national-commission-on-human-rights" className="govuk-link">
                    Kenya National Commission on Human Rights (KNCHR)
                  </Link>
                  {' '}— promotes and protects human rights
                </li>
                <li>
                  <Link href="/government/institutions/national-gender-commission" className="govuk-link">
                    National Gender and Equality Commission (NGEC)
                  </Link>
                  {' '}— promotes gender equality and inclusion for marginalised groups
                </li>
                <li>
                  <Link href="/government/institutions/commission-on-admin-justice" className="govuk-link">
                    Commission on Administrative Justice (CAJ)
                  </Link>
                  {' '}— the Ombudsman; handles complaints of unfair treatment by government
                </li>
                <li>
                  <Link href="/government/institutions/national-land-commission" className="govuk-link">
                    National Land Commission (NLC)
                  </Link>
                  {' '}— manages public land and resolves land disputes
                </li>
                <li>
                  <Link href="/government/institutions/psc" className="govuk-link">
                    Public Service Commission (PSC)
                  </Link>
                  {' '}— recruits and manages public servants
                </li>
                <li>
                  <Link href="/government/institutions/teachers-service-commission" className="govuk-link">
                    Teachers Service Commission (TSC)
                  </Link>
                  {' '}— manages teachers in public schools
                </li>
                <li>
                  <Link href="/government/institutions/parliamentary-service-commission" className="govuk-link">
                    Parliamentary Service Commission
                  </Link>
                  {' '}— manages the administration of Parliament
                </li>
                <li>
                  <Link href="/government/institutions/judicial-service-commission" className="govuk-link">
                    Judicial Service Commission (JSC)
                  </Link>
                  {' '}— recommends judicial appointments and manages the Judiciary
                </li>
                <li>
                  <Link href="/government/institutions/national-police-service-commission" className="govuk-link">
                    National Police Service Commission (NPSC)
                  </Link>
                  {' '}— recruits, promotes and disciplines police officers
                </li>
              </ul>

              <h3 className="govuk-heading-s">Independent offices</h3>
              <p className="govuk-body-s">
                Single-holder offices established under Article 248(3).
              </p>
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/auditor-general" className="govuk-link">
                    Office of the Auditor-General
                  </Link>
                  {' '}— audits all government accounts and reports to Parliament
                </li>
                <li>
                  <Link href="/government/institutions/controller-of-budget" className="govuk-link">
                    Office of the Controller of Budget
                  </Link>
                  {' '}— approves withdrawals from public funds
                </li>
              </ul>

              <p className="govuk-body">
                See the full list of{' '}
                <Link href="/government/commissions" className="govuk-link">
                  constitutional commissions and independent bodies
                </Link>
                .
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 10. AMENDING THE CONSTITUTION */}
            <section id="amending" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Amending the Constitution</h2>
              <p className="govuk-body">
                The Constitution can be amended in two ways:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>Parliamentary process</strong> — under{' '}
                  <Link href="/constitution/chapter/18/article/256" className="govuk-link">
                    Article 256
                  </Link>
                  , amendments to non-sovereign provisions require approval by both Houses of Parliament
                </li>
                <li>
                  <strong>Popular initiative</strong> — under{' '}
                  <Link href="/constitution/chapter/18/article/257" className="govuk-link">
                    Article 257
                  </Link>
                  , citizens can propose amendments through a petition signed by at least 2 million registered voters, followed by approval in a national referendum
                </li>
              </ul>
              <p className="govuk-body">
                Amendments to certain key provisions (such as the supremacy of the Constitution, the territory of Kenya, and the Bill of Rights) can only be made through a referendum, as set out in{' '}
                <Link href="/constitution/chapter/18/article/255" className="govuk-link">
                  Article 255
                </Link>
                .
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 11. CONSTITUTIONAL HISTORY */}
            <section id="history" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Constitutional history</h2>
              <p className="govuk-body">
                Kenya's legal framework has evolved through three major constitutional phases:
              </p>
              
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">
                  Key milestones in Kenya's constitutional history
                </caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">Year</th>
                    <th scope="col" className="govuk-table__header">Milestone</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">15 December 1963</th>
                    <td className="govuk-table__cell">
                      <strong>Independence Constitution</strong> — drafted at the Lancaster House Conferences. It established a regional (majimbo) system of government that was later centralised.
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">1964 to 2008</th>
                    <td className="govuk-table__cell">
                      <strong>Centralisation and reform era</strong> — a long series of amendments changed the system of government. Kenya returned to multi-party democracy in 1991, and growing demands for reform eventually led to calls for a new constitution.
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">27 August 2010</th>
                    <td className="govuk-table__cell">
                      <strong>The current Constitution</strong> — approved by 67% of voters in a national referendum. It introduced devolution, a modern Bill of Rights, separation of powers and the national values in Article 10.
                    </td>
                  </tr>
                </tbody>
              </table>
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
                    <Link href="/constitution" className="govuk-link">
                      The Constitution of Kenya
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/national-symbols" className="govuk-link">
                      National symbols
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/languages" className="govuk-link">
                      Languages
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/communities" className="govuk-link">
                      Communities
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/religion-and-faith" className="govuk-link">
                      Religion and faith
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/holidays" className="govuk-link">
                      Public holidays
                    </Link>
                  </li>
                  <li>
                    <Link href="/government" className="govuk-link">
                      Government
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/commissions" className="govuk-link">
                      Constitutional commissions
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