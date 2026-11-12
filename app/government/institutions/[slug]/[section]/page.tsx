import { notFound } from "next/navigation";
import ReferralInfoPage from "@/components/healthcare/ReferralInfoPage";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";
const sections = ["contact", "patient-information", "how-to-get-care"] as const;
type Props = { params: Promise<{ slug: string; section: string }> };

export default async function HospitalSectionPage({ params }: Props) {
  const { slug, section } = await params;
  if (!sections.includes(section as (typeof sections)[number])) notFound();
  const supabase = createPublicClient();
  const { data: institution, error } = await supabase.from("institutions").select("name,short_name,slug,phone,email,physical_address,map_url,template_key,template_data").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error) throw new Error("The institution directory is temporarily unavailable.");
  if (!institution || !["healthcare-referral-hospital", "healthcare"].includes(institution.template_key || "")) notFound();
  return <ReferralInfoPage slug={slug} institution={institution} kind={section as (typeof sections)[number]} />;
}
