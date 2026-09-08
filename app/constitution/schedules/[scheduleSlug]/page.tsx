import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ConstitutionShell from "@/components/constitution/ConstitutionShell";
import { getSchedule } from "@/lib/constitution/data";

type Props = {
  params: Promise<{
    scheduleSlug: string;
  }>;
};

const SCHEDULES = [
  {
    slug: "first",
    label: "First Schedule",
    title: "Counties",
  },
  {
    slug: "second",
    label: "Second Schedule",
    title: "National symbols",
  },
  {
    slug: "third",
    label: "Third Schedule",
    title: "National Oaths and affirmations",
  },
  {
    slug: "fourth",
    label: "Fourth Schedule",
    title:
      "Distribution of functions between the National Government and the county governments",
  },
  {
    slug: "fifth",
    label: "Fifth Schedule",
    title: "Legislation to be enacted by Parliament",
  },
  {
    slug: "sixth",
    label: "Sixth Schedule",
    title: "Transitional and consequential provisions",
  },
] as const;

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { scheduleSlug } = await params;
  const schedule = await getSchedule(scheduleSlug);

  if (!schedule) {
    return {
      title: "Schedule | Constitution of Kenya, 2010",
    };
  }

  return {
    title: `${schedule.schedule_label}: ${schedule.title} | Constitution of Kenya`,
    description: `Read the ${schedule.schedule_label} of the Constitution of Kenya, 2010 — ${schedule.title}.`,
    alternates: {
      canonical: `/constitution/schedules/${schedule.slug}`,
    },
  };
}

export default async function SchedulePage({
  params,
}: Props) {
  const { scheduleSlug } = await params;
  const schedule = await getSchedule(scheduleSlug);

  if (!schedule) {
    notFound();
  }

  const currentIndex = SCHEDULES.findIndex(
    (item) => item.slug === scheduleSlug
  );

  const previous =
    currentIndex > 0
      ? SCHEDULES[currentIndex - 1]
      : null;

  const next =
    currentIndex >= 0 && currentIndex < SCHEDULES.length - 1
      ? SCHEDULES[currentIndex + 1]
      : null;

  return (
    <ConstitutionShell
      title={schedule.title}
      caption={`${schedule.schedule_label} · Constitution of Kenya, 2010`}
    >
      <article
        className="constitution-schedule-reading"
        dangerouslySetInnerHTML={{
          __html: schedule.body_html,
        }}
      />

      <nav
        className="govuk-pagination govuk-!-margin-top-8"
        aria-label="Schedule navigation"
      >
        {previous ? (
          <div className="govuk-pagination__prev">
            <Link
              className="govuk-link govuk-pagination__link"
              href={`/constitution/schedules/${previous.slug}`}
              rel="prev"
            >
              <svg
                className="govuk-pagination__icon govuk-pagination__icon--prev"
                xmlns="http://www.w3.org/2000/svg"
                height="13"
                width="15"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 15 13"
              >
                <path
                  d="m6.5938-.0078125-6.7266 6.7266 6.7441 6.7441 1.377-1.449-4.1856-4.1855h11.197v-2h-11.197l4.2031-4.2031z"
                  fill="currentColor"
                />
              </svg>

              <span className="govuk-pagination__link-title">
                Previous
              </span>

              <span className="govuk-visually-hidden">
                :
              </span>

              <span className="govuk-pagination__link-label">
                {previous.label}: {previous.title}
              </span>
            </Link>
          </div>
        ) : null}

        {next ? (
          <div className="govuk-pagination__next">
            <Link
              className="govuk-link govuk-pagination__link"
              href={`/constitution/schedules/${next.slug}`}
              rel="next"
            >
              <svg
                className="govuk-pagination__icon govuk-pagination__icon--next"
                xmlns="http://www.w3.org/2000/svg"
                height="13"
                width="15"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 15 13"
              >
                <path
                  d="m8.4062-.0078125-1.377 1.4492 4.1856 4.1855h-11.197v2h11.197l-4.2031 4.2031 1.377 1.4492 6.7266-6.7266z"
                  fill="currentColor"
                />
              </svg>

              <span className="govuk-pagination__link-title">
                Next
              </span>

              <span className="govuk-visually-hidden">
                :
              </span>

              <span className="govuk-pagination__link-label">
                {next.label}: {next.title}
              </span>
            </Link>
          </div>
        ) : null}
      </nav>

      <p className="govuk-body govuk-!-margin-top-6">
        <Link
          className="govuk-link govuk-link--no-visited-state"
          href="/constitution#schedules"
        >
          Back to all Schedules
        </Link>
      </p>
    </ConstitutionShell>
  );
}