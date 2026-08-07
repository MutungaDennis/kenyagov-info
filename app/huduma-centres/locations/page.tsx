import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "@/components/site/ExternalLink";
import LastUpdated from "@/components/govuk/LastUpdated";
import HudumaLocationsClient from "@/components/huduma/HudumaLocationsClient";
import { HUDUMA_SOURCE } from "@/lib/data/huduma-centres";
import {
  getAllHudumaCentres,
  getExtendedHoursCentres,
  hudumaStats,
  regionsWithHuduma,
} from "@/lib/data/huduma-centres.utils";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Huduma Centre locations",
  description:
    "Find Huduma Service Centres across Kenya by region or county — addresses, opening hours and extended-hours centres. Compiled from the official Huduma Kenya list.",
};

export default function HudumaLocationsPage() {
  const centres = getAllHudumaCentres();
  const stats = hudumaStats();
  const extended = getExtendedHoursCentres();
  const regions = regionsWithHuduma();

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Huduma Centres", href: "/huduma-centres" },
          { text: "Locations" },
        ]}
        title="Huduma Centre locations"
        lead={`Find a Huduma Service Centre near you. This directory lists ${stats.total} centres from the official Huduma Kenya list — filter by region, county or opening hours.`}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning </span>
              Confirm opening hours, which services are offered, and any queue
              arrangements before you travel. Prefer the official Huduma Kenya
              website.
            </strong>
          </div>

          <p className="govuk-body">
            <Link href="/huduma-centres" className="govuk-link">
              What Huduma Centres are
            </Link>
            {" · "}
            <Link href="/ecitizen" className="govuk-link">
              eCitizen explained
            </Link>
            {" · "}
            <ExternalLink href={HUDUMA_SOURCE.url}>
              {HUDUMA_SOURCE.label}
            </ExternalLink>
          </p>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-1">
              <strong>{stats.total}</strong> centres ·{" "}
              <strong>{stats.counties}</strong> counties ·{" "}
              <strong>{stats.regions}</strong> regions
            </p>
            <p className="govuk-body govuk-!-margin-bottom-0">
              <strong>{stats.extended}</strong> with extended hours (typically
              7:00 am to 7:00 pm) · <strong>{stats.standard}</strong> on
              standard hours (typically 8:00 am to 5:00 pm)
            </p>
          </div>

          <h2 className="govuk-heading-m">Opening hours</h2>
          <p className="govuk-body">
            Most centres open on standard government hours. Centres tagged{" "}
            <strong className="govuk-tag govuk-tag--green">
              Extended hours
            </strong>{" "}
            open earlier and close later — usually 7:00 am to 7:00 pm — according
            to Huduma Kenya.
          </p>
          <p className="govuk-body">
            <a className="govuk-link" href="#extended-hours">
              List of centres with extended hours
            </a>{" "}
            ({extended.length} centres)
          </p>

          <h2 className="govuk-heading-l">Find a centre</h2>
          <HudumaLocationsClient centres={centres} regions={regions} />

          <section
            id="extended-hours"
            className="govuk-!-margin-top-8 govuk-!-margin-bottom-6"
          >
            <h2 className="govuk-heading-l">Centres with extended hours</h2>
            <p className="govuk-body">
              These centres open earlier and close later (typically 7:00 am to
              7:00 pm), compared with the usual 8:00 am to 5:00 pm government
              business hours.
            </p>
            <ul className="govuk-list govuk-list--bullet">
              {extended.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong>
                  {" — "}
                  {c.county} ({c.cityOrTown})
                </li>
              ))}
            </ul>
          </section>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              <strong>Source:</strong>{" "}
              <ExternalLink href={HUDUMA_SOURCE.url}>
                {HUDUMA_SOURCE.label}
              </ExternalLink>
              . This page is an independent civic guide; Huduma Kenya remains
              authoritative for locations and hours.
            </p>
          </div>

          <p className="govuk-body-s">
            If a centre is missing, moved or renamed,{" "}
            <Link href="/corrections" className="govuk-link">
              request a correction
            </Link>
            .
          </p>

          <LastUpdated published="2025-01-01" lastUpdated="2026-08-08" />
        </div>

        <div className="govuk-grid-column-one-third">
          <aside role="complementary">
            <h2 className="govuk-heading-m">Related</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/huduma-centres" className="govuk-link">
                  Huduma Centres overview
                </Link>
              </li>
              <li>
                <ExternalLink href={HUDUMA_SOURCE.siteUrl}>
                  {HUDUMA_SOURCE.siteLabel}
                </ExternalLink>
              </li>
              <li>
                <Link href="/ecitizen" className="govuk-link">
                  eCitizen explained
                </Link>
              </li>
              <li>
                <Link href="/government/counties" className="govuk-link">
                  County governments
                </Link>
              </li>
              <li>
                <Link href="/services/popular" className="govuk-link">
                  Popular services
                </Link>
              </li>
              <li>
                <Link href="/scams" className="govuk-link">
                  Scams and fake websites
                </Link>
              </li>
              <li>
                <Link href="/search?q=Huduma" className="govuk-link">
                  Search this website
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
