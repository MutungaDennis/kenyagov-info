import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


export default function IndependentBodies() {
  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Structure of Government", href: "/" },
          { text: "Independent Bodies", href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Independent Bodies</h1>
        <p className="govuk-body-l">
          These are institutions established by the Constitution of Kenya 2010 to operate independently 
          from the three arms of government, ensuring accountability, transparency, and protection of public interest.
        </p>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        {/* A. Constitutional Commissions */}
        <h2 className="govuk-heading-l">A. Constitutional Commissions</h2>
        <p className="govuk-body">
          Established under Chapter 15 of the Constitution (Articles 248–254).
        </p>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Independent Electoral and Boundaries Commission (IEBC)</h3>
                <p className="govuk-body-s">Manages elections, voter registration, and constituency boundaries.</p>
                <Link href="/independent-bodies/iebc" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Ethics and Anti-Corruption Commission (EACC)</h3>
                <p className="govuk-body-s">Fights corruption and promotes integrity in public service.</p>
                <Link href="/independent-bodies/eacc" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Commission on Revenue Allocation (CRA)</h3>
                <p className="govuk-body-s">Advises on equitable sharing of revenue between national and county governments.</p>
                <Link href="/independent-bodies/cra" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Salaries and Remuneration Commission (SRC)</h3>
                <p className="govuk-body-s">Sets and reviews remuneration for all public officers.</p>
                <Link href="/independent-bodies/src" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Kenya National Commission on Human Rights (KNCHR)</h3>
                <p className="govuk-body-s">Promotes and protects human rights in Kenya.</p>
                <Link href="/independent-bodies/knchr" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">National Gender and Equality Commission (NGEC)</h3>
                <p className="govuk-body-s">Promotes gender equality and inclusion for marginalized groups.</p>
                <Link href="/independent-bodies/ngec" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Commission on Administrative Justice (CAJ)</h3>
                <p className="govuk-body-s">Addresses complaints of maladministration and abuse of power.</p>
                <Link href="/independent-bodies/caj" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">National Land Commission (NLC)</h3>
                <p className="govuk-body-s">Manages public land and resolves land disputes.</p>
                <Link href="/independent-bodies/nlc" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Judicial Service Commission (JSC)</h3>
                <p className="govuk-body-s">Handles appointments, promotions, and discipline in the Judiciary.</p>
                <Link href="/independent-bodies/jsc" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Parliamentary Service Commission (PSC)</h3>
                <p className="govuk-body-s">Manages the administration of Parliament.</p>
                <Link href="/independent-bodies/psc" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Public Service Commission (PSC)</h3>
                <p className="govuk-body-s">Recruits and manages public servants.</p>
                <Link href="/independent-bodies/public-service-commission" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Teachers Service Commission (TSC)</h3>
                <p className="govuk-body-s">Manages the teaching service in Kenya.</p>
                <Link href="/independent-bodies/tsc" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        {/* B. Independent Offices */}
        <h2 className="govuk-heading-l">B. Independent Offices</h2>
        <p className="govuk-body">
          These are headed by a single office holder and enjoy the same level of constitutional independence.
        </p>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Office of the Auditor-General</h3>
                <p className="govuk-body-s">Audits all government accounts and reports to Parliament.</p>
                <Link href="/independent-bodies/auditor-general" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Office of the Controller of Budget</h3>
                <p className="govuk-body-s">Approves withdrawals from public funds and oversees budget implementation.</p>
                <Link href="/independent-bodies/controller-of-budget" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        {/* C. Constitutional Bodies (Broader Term) */}
        <h2 className="govuk-heading-l">C. Constitutional Bodies (Broader Term)</h2>
        <p className="govuk-body">
          &quot;Constitutional Bodies&quot; is a broad umbrella term that includes both Chapter 15 commissions/offices 
          and other institutions created by the Constitution to perform specific sovereign functions.
        </p>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Office of the Director of Public Prosecutions (ODPP)</h3>
                <p className="govuk-body-s">Prosecutes criminal cases on behalf of the State.</p>
                <Link href="/independent-bodies/odpp" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-half">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">Judicial Service Commission (JSC)</h3>
                <p className="govuk-body-s">Manages appointments, promotions, and discipline in the Judiciary.</p>
                <Link href="/independent-bodies/jsc" className="govuk-link">Learn more →</Link>
              </div>
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        <div className="govuk-panel">
          <h3 className="govuk-panel__title">Why are they important?</h3>
          <p className="govuk-body">
            These bodies serve as vital checks and balances, protecting the Constitution, fighting corruption, 
            ensuring fair elections, and safeguarding public resources — often described as a 
            <strong>quasi-fourth arm of government</strong>.
          </p>
        </div>

        
      </main>
    </div>
  );
}