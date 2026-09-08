import { redirect } from "next/navigation";
import { adminPath } from "@/lib/admin-path";

/** Legacy route — Hansard is unified at /admin/hansard?tab=upload */
export default function UploadHansardRedirect() {
  redirect(`${adminPath("hansard")}?tab=upload`);
}
