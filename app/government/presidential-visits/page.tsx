import { redirect } from 'next/navigation';
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Presidential visits",
  description: "Visits by the President of Kenya across the counties and abroad.",
  path: "/government/presidential-visits",
});


export default function PresidentialVisitsRedirect() {
  // Instantly redirects the user to the Master Search Engine 
  // with the 'presidential_trip' filter pre-applied.
  redirect('/search/all?document_type=presidential_trip');
}
