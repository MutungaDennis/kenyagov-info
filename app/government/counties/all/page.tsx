import { redirect } from "next/navigation";

/** Legacy URL — directory now lives at /government/counties */
export default function AllCountiesRedirectPage() {
  redirect("/government/counties");
}
