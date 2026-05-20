// app/counties/wards/page.tsx

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WardsFilters from "@/components/wards/wards-filters";

interface SearchParams {
  county?: string;
  constituency?: string;
  q?: string;
}

export default async function WardsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();

  // ============================================
  // SEARCH PARAMS
  // ============================================

  const {
    county,
    constituency,
    q,
  } = await searchParams;

  // ============================================
  // GET COUNTIES
  // ============================================

  const { data: counties } = await supabase
    .from("counties")
    .select("name")
    .order("name");

  // ============================================
  // DETERMINE COUNTY FROM CONSTITUENCY
  // ============================================

  let selectedCounty = county;

  // If constituency selected without county,
  // automatically determine county
  if (constituency && !county) {
    const { data: constituencyCounty } =
      await supabase
        .from("constituencies")
        .select(`
          county_code,
          counties (
            name
          )
        `)
        .eq("name", constituency)
        .single();

    if (
      constituencyCounty &&
      constituencyCounty.counties
    ) {
      selectedCounty =
        constituencyCounty.counties.name;
    }
  }

  // ============================================
  // GET CONSTITUENCIES
  // ============================================

  let constituencyQuery = supabase
    .from("constituencies")
    .select(`
      name,
      county_code
    `)
    .order("name");

  // Filter constituencies by county
  if (selectedCounty) {
    const { data: countyData } =
      await supabase
        .from("counties")
        .select("code")
        .eq("name", selectedCounty)
        .single();

    if (countyData) {
      constituencyQuery =
        constituencyQuery.eq(
          "county_code",
          countyData.code
        );
    }
  }

  const { data: constituencies } =
    await constituencyQuery;

  // ============================================
  // WARDS QUERY
  // ============================================

  let wardsQuery = supabase
    .from("wards")
    .select(`
      id,
      slug,
      name,
      ward_code,
      county_name,
      constituency_name,
      registered_voters_2022
    `)
    .eq("is_active", true)
    .order("county_name", {
      ascending: true,
    })
    .order("constituency_name", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  // County filter
  if (selectedCounty) {
    wardsQuery = wardsQuery.eq(
      "county_name",
      selectedCounty
    );
  }

  // Constituency filter
  if (constituency) {
    wardsQuery = wardsQuery.eq(
      "constituency_name",
      constituency
    );
  }

  // Search filter
  if (q) {
    wardsQuery = wardsQuery.or(`
      name.ilike.%${q}%,
      constituency_name.ilike.%${q}%,
      county_name.ilike.%${q}%
    `);
  }

  const { data: wards, error } =
    await wardsQuery;

  // ============================================
  // ERROR STATE
  // ============================================

  if (error) {
    return (
      <main className="govuk-width-container">
        <h1 className="govuk-heading-l">
          Wards
        </h1>

        <p className="govuk-body">
          Error loading wards data.
        </p>

        <pre className="govuk-body-s">
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <main className="govuk-width-container">
      {/* BACK */}
      <Link
        href="/"
        className="govuk-back-link"
      >
        Back
      </Link>

      {/* TITLE */}
      <h1 className="govuk-heading-xl">
        Wards in Kenya
      </h1>

      <p className="govuk-body">
        Browse all wards in Kenya by county
        and constituency.
      </p>

      {/* ====================================== */}
      {/* FILTERS */}
      {/* ====================================== */}

      <WardsFilters
        counties={counties || []}
        constituencies={
          constituencies || []
        }
        selectedCounty={selectedCounty}
        selectedConstituency={
          constituency
        }
        search={q}
      />

      {/* ====================================== */}
      {/* RESULTS */}
      {/* ====================================== */}

      <div style={{ marginBottom: 20 }}>
        <p className="govuk-body">
          Showing{" "}
          <strong>
            {wards?.length || 0}
          </strong>{" "}
          wards
        </p>
      </div>

      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <table className="govuk-table">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th className="govuk-table__header">
              No.
            </th>

            <th className="govuk-table__header">
              Ward
            </th>

            <th className="govuk-table__header">
              Constituency
            </th>

            <th className="govuk-table__header">
              County
            </th>

            <th className="govuk-table__header">
              Registered Voters (2022)
            </th>
          </tr>
        </thead>

        <tbody className="govuk-table__body">
          {wards?.map(
            (ward, index) => (
              <tr
                key={ward.id}
                className="govuk-table__row"
              >
                {/* NUMBER */}
                <td className="govuk-table__cell">
                  {index + 1}
                </td>

                {/* WARD */}
                <td className="govuk-table__cell">
                  <Link
                    href={`/counties/wards/${ward.slug}`}
                    className="govuk-link"
                  >
                    {ward.name}
                  </Link>
                </td>

                {/* CONSTITUENCY */}
                <td className="govuk-table__cell">
                  {
                    ward.constituency_name
                  }
                </td>

                {/* COUNTY */}
                <td className="govuk-table__cell">
                  {ward.county_name}
                </td>

                {/* VOTERS */}
                <td className="govuk-table__cell">
                  {ward.registered_voters_2022?.toLocaleString() ??
                    "—"}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {/* ====================================== */}
      {/* EMPTY STATE */}
      {/* ====================================== */}

      {wards &&
        wards.length === 0 && (
          <div
            style={{
              marginTop: 30,
            }}
          >
            <p className="govuk-body">
              No wards found matching your
              filters.
            </p>

            <Link
              href="/counties/wards"
              className="govuk-link"
            >
              Clear filters
            </Link>
          </div>
        )}
    </main>
  );
}