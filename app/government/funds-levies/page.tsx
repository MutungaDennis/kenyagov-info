import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import type { FundParent, FundRecord } from "@/lib/funds/types";
import FundsDirectory from "./FundsDirectory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Government funds, levies and schemes — citizenguide.Ke",
  description:
    "Explore Kenya's public funds, levies and schemes, who administers them, who they serve, and how to find official information.",
  alternates: { canonical: "https://www.citizenguide.ke/government/funds-levies" },
  robots: { index: true, follow: true },
};

async function getFunds(): Promise<{ funds: FundRecord[]; parents: Record<string, FundParent>; unavailable: boolean }> {
  try {
    const db = createPublicClient();
    const { data, error } = await db
      .from("institutions")
      .select(
        "id,slug,name,short_name,institution_type,fund_levy_type,fund_classification,fund_legal_form,accessibility_type,funding_source,fund_operational_structure,description,mandate,target_population,legal_basis_name,legal_basis_reference,establishment_act,parent_institution_id,supervising_ministry_id,website_url,portal_url,application_url,status,is_active",
      )
      .eq("record_kind", "fund_levy")
      .eq("is_active", true)
      .order("name");

    if (error || !data) return { funds: [], parents: {}, unavailable: true };

    const funds = data as FundRecord[];
    const parentIds = [...new Set(funds.map((fund) => fund.parent_institution_id).filter((id): id is string => Boolean(id)))];
    if (parentIds.length === 0) return { funds, parents: {}, unavailable: false };

    const parentResult = await db
      .from("institutions")
      .select("id,slug,name")
      .eq("record_kind", "institution")
      .in("id", parentIds);

    const parents = Object.fromEntries(
      ((parentResult.data || []) as FundParent[]).map((parent) => [parent.id, parent]),
    );
    return { funds, parents, unavailable: false };
  } catch {
    return { funds: [], parents: {}, unavailable: true };
  }
}

export default async function FundsAndLeviesPage() {
  const { funds, parents, unavailable } = await getFunds();
  return <FundsDirectory funds={funds} parents={parents} unavailable={unavailable} />;
}
