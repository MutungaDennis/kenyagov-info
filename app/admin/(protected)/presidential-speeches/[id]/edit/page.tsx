import PresidentialSpeechAdminForm from "@/components/admin/PresidentialSpeechAdminForm";

export const dynamic = "force-dynamic";

export default async function EditPresidentialSpeechPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PresidentialSpeechAdminForm id={id} />;
}
