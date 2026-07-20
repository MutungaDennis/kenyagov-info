'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { 
  officialsRegistry,
  executiveLeadershipIds,
  cabinetSecretariesIds,
  alsoAttendsCabinetIds
} from "@/lib/data/ministers";

export default function CabinetPage() {
  return (
    <>
    
      {/* Updated to reflect the Kenyan contextual URL pathing */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Cabinet", href: "/government/cabinet" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* GOV.UK Page Heading Typography */}
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              The Cabinet
            </h1>

            <p className="govuk-body-m govuk-!-margin-bottom-8">
              Read biographies and responsibilities of the Executive leadership, Cabinet Secretaries heading ministries, and officials who help coordinate government business.
            </p>

            {/* SECTION 1: EXECUTIVE LEADERSHIP */}
            <h2 className="govuk-heading-m govuk-!-margin-bottom-4">
              Executive Leadership
            </h2>
            
            <ul className="govuk-list govuk-!-padding-left-0">
              {executiveLeadershipIds.map((id) => {
                const official = officialsRegistry[id];
                if (!official) return null;
                
                const execAssignment = official.assignments.find(a => a.isExecutiveOffice) || official.assignments[0];

                return (
                  <li key={`${id}-exec`} className="govuk-!-margin-bottom-4">
                    <h3 className="govuk-heading-s govuk-!-margin-top-0 govuk-!-margin-bottom-1">
                      <Link 
                        href={`/government/cabinet/${official.slug}`} 
                        className="govuk-link govuk-link--no-visited-state"
                      >
                        {official.fullName}
                      </Link>
                    </h3>
                    <p className="govuk-body-s govuk-!-margin-bottom-2">
                      {execAssignment.roleTitle}
                    </p>
                    <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
                  </li>
                );
              })}
            </ul>

            {/* SECTION 2: CABINET SECRETARIES */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">
              Cabinet Secretaries
            </h2>

            <ul className="govuk-list govuk-!-padding-left-0">
              {cabinetSecretariesIds.map((id) => {
                const official = officialsRegistry[id];
                if (!official) return null;

                const csAssignment = official.assignments.find(a => !a.isExecutiveOffice) || official.assignments[0];

                return (
                  <li key={`${id}-cs`} className="govuk-!-margin-bottom-4">
                    <h3 className="govuk-heading-s govuk-!-margin-top-0 govuk-!-margin-bottom-1">
                      <Link 
                        href={`/government/cabinet/${official.slug}`} 
                        className="govuk-link govuk-link--no-visited-state"
                      >
                        {official.fullName}
                      </Link>
                    </h3>
                    
                    <p className="govuk-body-s govuk-!-margin-bottom-2">
                      {csAssignment.roleTitle},{" "}
                      {csAssignment.department && csAssignment.departmentSlug ? (
                        <Link 
                          href={`/government/institutions/${csAssignment.departmentSlug}`} 
                          className="govuk-link govuk-!-font-weight-bold govuk-link--no-visited-state"
                        >
                          {csAssignment.department}
                        </Link>
                      ) : null}
                    </p>
                    <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
                  </li>
                );
              })}
            </ul>

            {/* SECTION 3: ALSO ATTENDS CABINET */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">
              Also attends Cabinet
            </h2>

            <ul className="govuk-list govuk-!-padding-left-0">
              {alsoAttendsCabinetIds.map((id) => {
                const official = officialsRegistry[id];
                if (!official) return null;
                
                const baseAssignment = official.assignments[0];

                return (
                  <li key={`${id}-attendee`} className="govuk-!-margin-bottom-4">
                    <h3 className="govuk-heading-s govuk-!-margin-top-0 govuk-!-margin-bottom-1">
                      <Link 
                        href={`/government/cabinet/${official.slug}`} 
                        className="govuk-link govuk-link--no-visited-state"
                      >
                        {official.fullName}
                      </Link>
                    </h3>
                    
                    <p className="govuk-body-s govuk-!-margin-bottom-2">
                      {baseAssignment.roleTitle}
                      {baseAssignment.department && baseAssignment.departmentSlug ? (
                        <>
                          {", "}
                          <Link 
                            href={`/government/institutions/${baseAssignment.departmentSlug}`} 
                            className="govuk-link govuk-!-font-weight-bold govuk-link--no-visited-state"
                          >
                            {baseAssignment.department}
                          </Link>
                        </>
                      ) : null}
                    </p>
                    <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
                  </li>
                );
              })}
            </ul>

          </div>
        </div>
      
    
  
    </>
);
}
