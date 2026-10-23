import ElectionsManager from "@/components/admin/ElectionsManager";

export const metadata = { title: "Coalitions | Admin" };

export default function CoalitionsAdminPage() {
  return <ElectionsManager section="coalitions" />;
}
