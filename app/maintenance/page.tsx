import { redirect } from 'next/navigation';
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Site maintenance",
  description: "CitizenGuide.KE is temporarily unavailable while we carry out maintenance.",
  path: "/maintenance",
  noIndex: true,
});


export default function MaintenancePage() {
  // Kill switch feature has been removed. Redirect to home.
  redirect('/');
}