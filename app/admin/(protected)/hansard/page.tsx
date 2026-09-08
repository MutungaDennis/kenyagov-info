import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import { getSanityStudioUrl } from "@/lib/sanity/studioUrl";
import HansardHub, {
  type HansardSittingRow,
  type HansardTab,
} from "@/components/admin/hansard/HansardHub";

const sanity = createSanityWriteClient();
const studioBase = getSanityStudioUrl();

type PageProps = {
  searchParams: Promise<{
    tab?: string;
    date?: string;
    house?: string;
    id?: string;
  }>;
};

function parseTab(raw?: string): HansardTab {
  if (raw === "manual" || raw === "upload" || raw === "sittings") return raw;
  return "sittings";
}

function parseHouse(
  raw?: string,
): "national-assembly" | "senate" | "county-assembly" | undefined {
  if (
    raw === "national-assembly" ||
    raw === "senate" ||
    raw === "county-assembly"
  ) {
    return raw;
  }
  return undefined;
}

export default async function HansardManagementPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const sittings: HansardSittingRow[] = await sanity.fetch(
    `*[_type == "hansardSitting"] | order(sittingDate desc) {
      _id,
      title,
      houseType,
      sittingDate,
      sittingPeriod,
      isActive,
      "contributionCount": count(contributions)
    }`,
  );

  return (
    <HansardHub
      sittings={sittings}
      studioBase={studioBase}
      initialTab={parseTab(sp.tab)}
      initialLoadDate={sp.date}
      initialLoadHouse={parseHouse(sp.house)}
      initialDocumentId={sp.id}
    />
  );
}
