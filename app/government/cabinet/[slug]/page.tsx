'use client';

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { officialsRegistry } from "@/lib/data/ministers";

export default function MinisterDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const official = officialsRegistry[slug];

  if (!official) {
    notFound();
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Cabinet", href: "/government/cabinet" },
          { text: official.fullName, href: `/government/cabinet/${official.slug}` },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          
          {/* ==================== MAIN CONTENT (2/3) ==================== */}
          <div className="govuk-grid-column-two-thirds">
            
            <span className="govuk-caption-m">Cabinet Official</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              {official.fullName}
            </h1>

            {/* Current Roles */}
            <div className="govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Current roles</h2>
              <ul className="govuk-list govuk-list--bullet govuk-!-padding-left-4">
                {official.assignments.map((assignment, index) => (
                  <li key={`${official.slug}-role-${index}`} className="govuk-body-s govuk-!-margin-bottom-2">
                    <strong>{assignment.roleTitle}</strong>
                    {assignment.department && assignment.departmentSlug && (
                      <>
                        {" at the "}
                        <Link 
                          href={`/government/organisations/${assignment.departmentSlug}`}
                          className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold"
                        >
                          {assignment.department}
                        </Link>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ==================== BIOGRAPHY ==================== */}
            <h2 id="biography" className="govuk-heading-m govuk-!-margin-top-4 govuk-!-margin-bottom-3">
              Biography
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-8">
              {official.biography}
            </p>

            {/* ==================== RESPONSIBILITIES ==================== */}
            {official.responsibilities && official.responsibilities.length > 0 && (
              <>
                <h2 id="responsibilities" className="govuk-heading-m govuk-!-margin-bottom-3">
                  Responsibilities
                </h2>
                <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-8 govuk-!-padding-left-4">
                  {official.responsibilities.map((resp, idx) => (
                    <li key={`resp-${idx}`} className="govuk-body-s govuk-!-margin-bottom-2">
                      {resp}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* ==================== EDUCATION ==================== */}
            {official.education && official.education.length > 0 && (
              <>
                <h2 id="education" className="govuk-heading-m govuk-!-margin-bottom-3">
                  Education
                </h2>
                <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-8 govuk-!-padding-left-4">
                  {official.education.map((edu, idx) => (
                    <li key={`edu-${idx}`} className="govuk-body-s govuk-!-margin-bottom-2">
                      {edu}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* ==================== POLITICAL CAREER ==================== */}
            {official.politicalCareer && official.politicalCareer.length > 0 && (
              <>
                <h2 id="political-career" className="govuk-heading-m govuk-!-margin-bottom-3">
                  Political career
                </h2>
                <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-8 govuk-!-padding-left-4">
                  {official.politicalCareer.map((role, idx) => (
                    <li key={`career-${idx}`} className="govuk-body-s govuk-!-margin-bottom-2">
                      {role}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* ==================== PERSONAL LIFE ==================== */}
            {official.personalLife && (
              <>
                <h2 id="personal-life" className="govuk-heading-m govuk-!-margin-bottom-3">
                  Personal life
                </h2>
                <p className="govuk-body govuk-!-margin-bottom-8">
                  {official.personalLife}
                </p>
              </>
            )}

          </div>

          {/* ==================== SIDEBAR (1/3) — Only TOC ==================== */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-padding-top-4" role="complementary">
              <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible govuk-!-margin-bottom-4" />

              {/* Single clean TOC in sidebar */}
              <nav aria-labelledby="sidebar-contents-heading" className="govuk-!-margin-bottom-6">
                <h3 id="sidebar-contents-heading" className="govuk-heading-s govuk-!-margin-bottom-2">On this page</h3>
                <ul className="govuk-list govuk-list--bullet govuk-body-s">
                  <li><a href="#biography" className="govuk-link govuk-link--no-visited-state">Biography</a></li>
                  <li><a href="#responsibilities" className="govuk-link govuk-link--no-visited-state">Responsibilities</a></li>
                  
                  {official.education && official.education.length > 0 && (
                    <li><a href="#education" className="govuk-link govuk-link--no-visited-state">Education</a></li>
                  )}
                  {official.politicalCareer && official.politicalCareer.length > 0 && (
                    <li><a href="#political-career" className="govuk-link govuk-link--no-visited-state">Political career</a></li>
                  )}
                  {official.personalLife && (
                    <li><a href="#personal-life" className="govuk-link govuk-link--no-visited-state">Personal life</a></li>
                  )}
                </ul>
              </nav>
            </aside>
          </div>

        </div>
      </main>
    </div>
  );
}