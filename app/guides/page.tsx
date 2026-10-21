import { redirect } from "next/navigation";

export const metadata = {
  title: "Services and guidance",
  description:
    "Find plain-English Kenyan government service guidance, including complex procedures and county-specific requirements.",
};

// Services are the single canonical directory. Keep this route as a compatibility
// redirect for bookmarks and links that still use the old “Guides” label.
export default function GuidesPage() {
  redirect("/services");
}
