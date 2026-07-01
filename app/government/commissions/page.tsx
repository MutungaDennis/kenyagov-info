// app/government/commissions/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export default function CommissionsPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Commissions and Independent Bodies", href: "/government/commissions" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              Constitutional commissions and independent bodies
            </h1>
            
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              These institutions operate independently from the three arms of government to ensure accountability, protect public interest, and safeguard the Constitution of Kenya 2010.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-8">
              <p className="govuk-body">
                Often described as a <strong>quasi-fourth arm of government</strong>, these 23 bodies serve as vital checks and balances — protecting the Constitution, fighting corruption, ensuring fair elections, and safeguarding public resources.
              </p>
            </div>

            {/* ========================================== */}
            {/* SECTION A: CONSTITUTIONAL COMMISSIONS      */}
            {/* ========================================== */}
            <section className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l govuk-!-margin-bottom-3">
                A. Constitutional Commissions
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-4">
                Multi-member state boards established under the Constitution to protect the public interest, guide national resources, and act as a check on executive power.
              </p>
              <p className="govuk-body-s govuk-!-margin-bottom-4 govuk-!-font-weight-bold">
                13 institutions
              </p>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/iebc" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Independent Electoral and Boundaries Commission (IEBC)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Manages elections, voter registration, and constituency boundaries.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/eacc" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Ethics and Anti-Corruption Commission (EACC)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Fights corruption and promotes integrity in public service.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/cra" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Commission on Revenue Allocation (CRA)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Advises on how national revenue should be shared between the national and county governments.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/salaries-commission" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Salaries and Remuneration Commission (SRC)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Sets and reviews pay and benefits for all public officers.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/kenya-national-commission-on-human-rights" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Kenya National Commission on Human Rights (KNCHR)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Promotes and protects human rights in Kenya.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/national-gender-commission" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    National Gender and Equality Commission (NGEC)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Promotes gender equality and inclusion for marginalised groups.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/commission-on-admin-justice" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Commission on Administrative Justice (CAJ)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    The Ombudsman — handles complaints about unfair treatment by government offices.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/national-land-commission" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    National Land Commission (NLC)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Manages public land and resolves land disputes.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/psc" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Public Service Commission (PSC)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Recruits and manages public servants in the national government.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/teachers-service-commission" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Teachers Service Commission (TSC)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Recruits, manages, and disciplines teachers in public schools.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/parliamentary-service-commission" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Parliamentary Service Commission (PSC)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Manages the staff and administration of Parliament.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/judicial-service-commission" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Judicial Service Commission (JSC)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Recommends the appointment of judges and manages the administration of the Judiciary.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/national-police-service-commission" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    National Police Service Commission (NPSC)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Recruits, promotes, and disciplines officers in the National Police Service.
                  </p>
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* SECTION B: INDEPENDENT OFFICES             */}
            {/* ========================================== */}
            <section className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l govuk-!-margin-bottom-3">
                B. Independent Offices
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-4">
                Single-holder offices established under the Constitution to oversee public spending and hold the government to account for how it uses taxpayers' money.
              </p>
              <p className="govuk-body-s govuk-!-margin-bottom-4 govuk-!-font-weight-bold">
                2 institutions
              </p>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/auditor-general" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Office of the Auditor-General (OAG)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Audits all government accounts and reports findings to Parliament.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/controller-of-budget" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Office of the Controller of Budget (COB)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Approves withdrawals from public funds and makes sure the budget is followed.
                  </p>
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* SECTION C: OTHER SOVEREIGN BODIES          */}
            {/* ========================================== */}
            <section className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l govuk-!-margin-bottom-3">
                C. Other Sovereign Constitutional Bodies
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-4">
                Independent state bodies set up by the Constitution to manage Kenya's legal, financial, and security systems. They work separately from the regular civil service.
              </p>
              <p className="govuk-body-s govuk-!-margin-bottom-4 govuk-!-font-weight-bold">
                8 institutions
              </p>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/cbk" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Central Bank of Kenya (CBK)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Sets interest rates and manages the country's money supply to keep prices stable.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/office-of-director-public-prosecutions" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Office of the Director of Public Prosecutions (ODPP)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Decides whether to bring criminal charges and conducts prosecutions in court on behalf of the State.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/office-of-attorney-general" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Office of the Attorney-General (AG)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    The Government's main legal adviser. Drafts laws and represents the State in court.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/office-of-registrar-political-parties" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Office of the Registrar of Political Parties (ORPP)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Registers political parties and makes sure they follow the law on party conduct and financing.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/kenya-defence-forces" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Kenya Defence Forces (KDF)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Protects Kenya's territory and people. Made up of the Kenya Army, the Air Force, and the Navy.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/kenya-national-intelligence-service" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    National Intelligence Service (NIS)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Collects and analyses information to protect Kenya from security threats at home and abroad.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/national-security-council" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    National Security Council (NSC)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Oversees the country's security services and advises the President on national security matters.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/national-police-service-commission" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    National Police Service (NPS)
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Keeps law and order across Kenya. Includes the Kenya Police Service and the Administration Police Service.
                  </p>
                </li>
              </ul>
            </section>

          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                Related content
              </h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/government/institutions" className="govuk-link">
                      All government institutions
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/people" className="govuk-link">
                      All government officials
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/cabinet" className="govuk-link">
                      The Cabinet
                    </Link>
                  </li>
                  <li>
                    <Link href="/constitution" className="govuk-link">
                      Constitution of Kenya
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}