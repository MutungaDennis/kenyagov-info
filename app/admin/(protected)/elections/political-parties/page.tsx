import ElectionsManager from "@/components/admin/ElectionsManager";

export const metadata = { title: "Political parties | Admin" };

export default function PoliticalPartiesAdminPage() {
  return <ElectionsManager section="parties" />;
}
