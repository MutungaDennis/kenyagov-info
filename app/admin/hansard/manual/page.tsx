import { redirect } from "next/navigation";
import { adminPath } from "@/lib/admin-path";

type PageProps = {
  searchParams: Promise<{ date?: string; house?: string; id?: string }>;
};

/** Legacy route — Hansard is unified at /admin/hansard?tab=manual */
export default async function ManualHansardRedirect({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = new URLSearchParams({ tab: "manual" });
  if (sp.date) params.set("date", sp.date);
  if (sp.house) params.set("house", sp.house);
  if (sp.id) params.set("id", sp.id);
  redirect(`${adminPath("hansard")}?${params.toString()}`);
}
