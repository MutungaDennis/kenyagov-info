import ParliamentaryCommitteeEditor from "@/components/admin/ParliamentaryCommitteeEditor";

export default async function EditParliamentaryCommitteePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ParliamentaryCommitteeEditor committeeId={id} />;
}
