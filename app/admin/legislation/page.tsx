import { createServiceClient } from "@/lib/supabase/service";
import LegislationHub, {
  type LegislationTab,
} from "@/components/admin/legislation/LegislationHub";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function parseTab(raw?: string): LegislationTab {
  if (raw === "upload" || raw === "list") return raw;
  return "list";
}

export default async function LegislationAdminPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  let counties: Array<{ id: string; name: string; slug: string }> = [];
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("counties")
      .select("id, name, slug")
      .order("name");
    counties = (data || []).map((c) => ({
      id: String(c.id),
      name: String(c.name),
      slug: String(c.slug),
    }));
  } catch (err) {
    console.error("[legislation admin] counties load failed", err);
  }

  return (
    <LegislationHub initialTab={parseTab(sp.tab)} counties={counties} />
  );
}
