'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import type { CabinetOfficial } from "@/lib/data/ministers";

export default function MinisterDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [official, setOfficial] = useState<CabinetOfficial | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch("/data/ministers.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((registry: Record<string, CabinetOfficial>) => {
        if (!cancelled) setOfficial(registry[slug] ?? null);
      })
      .catch(() => {
        if (!cancelled) setOfficial(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (official === undefined) {
    return (
      <div className="govuk-width-container">
        <p className="govuk-body">Loading profile…</p>
      </div>
    );
  }

  if (!official) {
    return (
      <div className="govuk-width-container">
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Government", href: "/government" },
            { text: "Cabinet", href: "/government/cabinet" },
          ]}
        />
        <h1 className="govuk-heading-xl">Page not found</h1>
        <p className="govuk-body">
          That cabinet profile could not be found.{" "}
          <Link href="/government/cabinet" className="govuk-link">
            View the Cabinet
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Cabinet", href: "/government/cabinet" },
          {
            text: official.fullName,
            href: `/government/cabinet/${official.slug}`,
          },
        ]}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-m">Cabinet Official</span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
            {official.fullName}
          </h1>

          <div className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">
              Current roles
            </h2>
            <ul className="govuk-list govuk-list--bullet govuk-!-padding-left-4">
              {official.assignments.map((assignment, index) => (
                <li
                  key={`${official.slug}-role-${index}`}
                  className="govuk-body-s govuk-!-margin-bottom-2"
                >
                  <strong>{assignment.roleTitle}</strong>
                  {assignment.department && assignment.departmentSlug && (
                    <>
                      {" at the "}
                      <Link
                        href={`/government/institutions/${assignment.departmentSlug}`}
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

          <h2
            id="biography"
            className="govuk-heading-m govuk-!-margin-top-4 govuk-!-margin-bottom-3"
          >
            Biography
          </h2>
          <p className="govuk-body govuk-!-margin-bottom-8">
            {official.biography}
          </p>

          {official.responsibilities && official.responsibilities.length > 0 && (
            <>
              <h2
                id="responsibilities"
                className="govuk-heading-m govuk-!-margin-bottom-3"
              >
                Responsibilities
              </h2>
              <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-8 govuk-!-padding-left-4">
                {official.responsibilities.map((item, i) => (
                  <li key={i} className="govuk-body">
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {official.education && official.education.length > 0 && (
            <>
              <h2
                id="education"
                className="govuk-heading-m govuk-!-margin-bottom-3"
              >
                Education
              </h2>
              <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-8 govuk-!-padding-left-4">
                {official.education.map((item, i) => (
                  <li key={i} className="govuk-body">
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {official.politicalCareer && official.politicalCareer.length > 0 && (
            <>
              <h2
                id="career"
                className="govuk-heading-m govuk-!-margin-bottom-3"
              >
                Political career
              </h2>
              <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-8 govuk-!-padding-left-4">
                {official.politicalCareer.map((item, i) => (
                  <li key={i} className="govuk-body">
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {official.personalLife && (
            <>
              <h2
                id="personal"
                className="govuk-heading-m govuk-!-margin-bottom-3"
              >
                Personal life
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-8">
                {official.personalLife}
              </p>
            </>
          )}

          <p className="govuk-body">
            <Link href="/government/cabinet" className="govuk-link">
              ← Back to Cabinet
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
