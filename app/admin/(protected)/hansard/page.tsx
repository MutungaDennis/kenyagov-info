import { createClient } from "@/lib/supabase/server";
import { listHansard, getHansardDocument } from "@/lib/hansard/queries";
import HansardWorkbench from "@/components/admin/hansard/HansardWorkbench";
export default async function HansardManagementPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
 const { id } = await searchParams; const db = await createClient();
 const rows = []; for (let page = 1; ; page++) { const result = await listHansard({ page, pageSize: 500 }, db); rows.push(...result.rows); if (rows.length >= result.total) break; }
 const initialDocument = id ? await getHansardDocument({ id }, db) : null;
 return <HansardWorkbench sittings={rows} initialDocument={initialDocument} />;
}
