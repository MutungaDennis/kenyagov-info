import ServicesHub, {
  type ServicesTab,
} from "@/components/admin/services/ServicesHub";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AdminServicesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = (["list", "new", "upload", "links"].includes(sp.tab || "")
    ? sp.tab
    : "list") as ServicesTab;

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <ServicesHub initialTab={tab === "new" ? "list" : tab} />
      </main>
    </div>
  );
}
