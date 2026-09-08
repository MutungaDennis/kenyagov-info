import { redirect } from "next/navigation";
import { adminPath } from "@/lib/admin-path";

export default function SiteStatusControl() {
  // The kill switch / site status feature has been completely removed.
  redirect(adminPath());
}
