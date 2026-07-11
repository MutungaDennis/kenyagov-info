import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


export default function JudiciaryAdministrationPage() {
  return (
    <>
    
      {/* <GovUKBackLink href="/judiciary" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Judiciary", href: "/judiciary" },
          { text: "Administration", href: "/judiciary/administration" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Judiciary Administration & Leadership</h1>
            <p className="govuk-body-l">
              The day-to-day administration and management of the Judiciary is led by the Chief Justice, supported by key offices, registrars, and directorates.
            </p>

            {/* Leadership */}
            <h2 className="govuk-heading-l">Key Leadership</h2>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">Chief Justice</h3>
                <p className="govuk-body"><strong>Hon. Lady Justice Martha Koome, EGH</strong></p>
                <p className="govuk-body-s">Head of the Judiciary and President of the Supreme Court</p>
              </div>
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">Deputy Chief Justice</h3>
                <p className="govuk-body"><strong>Hon. Lady Justice Philomena Mbete Mwilu, EGH</strong></p>
                <p className="govuk-body-s">Vice-President of the Supreme Court</p>
              </div>
            </div>

            <h3 className="govuk-heading-m govuk-!-margin-top-9">Chief Registrar of the Judiciary</h3>
            <p className="govuk-body"><strong>Hon. Winfridah Boyani Mokaya, CBS</strong></p>
            <p className="govuk-body-s">
              Chief Administrator and Accounting Officer of the Judiciary. Also serves as Secretary to the Judicial Service Commission.
            </p>

            {/* Administrative Offices */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">Administrative Offices</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li><strong>Office of the Chief Justice</strong></li>
              <li><strong>Office of the Deputy Chief Justice</strong></li>
              <li><strong>Office of the Chief Registrar of the Judiciary</strong></li>
              <li><strong>Office of the President of the Court of Appeal</strong></li>
              <li><strong>Office of the Principal Judge of the High Court</strong></li>
              <li><strong>Office of the Principal Judge, Employment & Labour Relations Court (ELRC)</strong></li>
              <li><strong>Office of the Presiding Judge, Environment & Land Court (ELC)</strong></li>
              <li><strong>Chief of Staff, Office of the Chief Justice</strong></li>
              <li><strong>Office of the Judiciary Ombudsman</strong></li>
            </ul>

            {/* Registrars */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">Office of Registrars</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Registrar, Supreme Court (RSC)</li>
              <li>Registrar, Court of Appeal (RCoA)</li>
              <li>Registrar, High Court (RHC)</li>
              <li>Registrar, Employment & Labour Relations Court (RELRC)</li>
              <li>Registrar, Environment & Land Court (RELC)</li>
              <li>Registrar, Magistrates’ Courts (RMC)</li>
              <li>Registrar, Small Claims Court</li>
              <li>Registrar, Tribunals (RT)</li>
              <li>Registrar, Court Annexed Mediation (RCAM)</li>
              <li>Registrar, Kenya Judiciary Academy (KJA)</li>
            </ul>

            {/* Directorates */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">Directorates & Units</h2>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <ul className="govuk-list govuk-list--bullet">
                  <li>Directorate of Human Resource Management & Development (DHRMD)</li>
                  <li>Directorate of Planning & Organisational Performance</li>
                  <li>Directorate of ICT</li>
                  <li>Directorate of Finance</li>
                  <li>Directorate of Accounts</li>
                </ul>
              </div>
              <div className="govuk-grid-column-one-half">
                <ul className="govuk-list govuk-list--bullet">
                  <li>Directorate of Supply Chain Management</li>
                  <li>Directorate of Public Affairs & Communication</li>
                  <li>Directorate of Administration & Security Services (DDAS)</li>
                  <li>Department of Construction & Maintenance Works (DCMW)</li>
                  <li>Information & Record Management Unit</li>
                </ul>
              </div>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Judicial Service Commission (JSC)</h2>
            <p className="govuk-body">
              Independent constitutional body responsible for recruiting, promoting, and disciplining judges and judicial officers. Chaired by the Chief Justice.
            </p>

            
          </div>
        </div>
      
    
  
    </>
);
}