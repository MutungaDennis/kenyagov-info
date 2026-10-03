import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "World Athletics Championships host cities",
  description:
    "Previous and future host cities of the World Athletics Championships, including Nairobi 2029.",
};

const hostCities = [
  ["1983", "Helsinki", "Finland"],
  ["1987", "Rome", "Italy"],
  ["1991", "Tokyo", "Japan"],
  ["1993", "Stuttgart", "Germany"],
  ["1995", "Gothenburg", "Sweden"],
  ["1997", "Athens", "Greece"],
  ["1999", "Seville", "Spain"],
  ["2001", "Edmonton", "Canada"],
  ["2003", "Paris", "France"],
  ["2005", "Helsinki", "Finland"],
  ["2007", "Osaka", "Japan"],
  ["2009", "Berlin", "Germany"],
  ["2011", "Daegu", "South Korea"],
  ["2013", "Moscow", "Russia"],
  ["2015", "Beijing", "China"],
  ["2017", "London", "United Kingdom"],
  ["2019", "Doha", "Qatar"],
  ["2022", "Eugene", "United States"],
  ["2023", "Budapest", "Hungary"],
  ["2025", "Tokyo", "Japan"],
  ["2027", "Beijing", "China"],
  ["2029", "Nairobi", "Kenya"],
  ["2031", "Munich", "Germany"],
] as const;

export default function HostCitiesPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          {
            text: "World Athletics Championships Nairobi 2029",
            href: "/world-athletics-championships-2029",
          },
          {
            text: "About the championships",
            href: "/world-athletics-championships-2029/about",
          },
          { text: "Host cities" },
        ]}
        title="Previous and future host cities"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            Nairobi will become the first African city to host the{" "}
            <ExternalLink href="https://worldathletics.org/">
              World Athletics
            </ExternalLink>{" "}
            Championships. The table lists completed editions and host cities
            selected for future championships.
          </p>

          <div className="govuk-table__container">
            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-table__caption--m">
                Championship host cities
              </caption>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Year
                  </th>
                  <th scope="col" className="govuk-table__header">
                    City
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Country
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {hostCities.map(([year, city, country]) => (
                  <tr className="govuk-table__row" key={year}>
                    <th scope="row" className="govuk-table__header">
                      {year}
                    </th>
                    <td className="govuk-table__cell">{city}</td>
                    <td className="govuk-table__cell">{country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="govuk-heading-l">Changes to the normal cycle</h2>
          <p className="govuk-body">
            The Eugene edition was originally planned for 2021 and took place
            in 2022 after changes to the international sporting calendar. The
            Budapest edition followed in 2023.
          </p>

          <h2 className="govuk-heading-l">Future editions</h2>
          <p className="govuk-body">
            Beijing will host in 2027, followed by Nairobi in 2029 and Munich
            in 2031. Details for future editions can change as planning
            progresses.
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <Link
              href="/world-athletics-championships-2029/about"
              className="govuk-link govuk-link--no-visited-state"
            >
              Back to About the championships
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
