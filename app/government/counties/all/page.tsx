import AllCountiesClient from "./AllCountiesClient";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createPublicClient } from "@/lib/supabase/public";

// Revalidate every hour to keep data fresh without slowing down the build
export const revalidate = 3600;

export default async function AllCountiesPage() {
  const supabase = createPublicClient();
  
  // Fetch directly from the canonical 'counties' table
  const { data: counties, error } = await supabase
    .from("counties")
    .select("slug, name, code, headquarters, region")
    .order("code", { ascending: true });

  if (error) {
    console.error("Error fetching counties:", error);
  }

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Counties", href: "/government/counties" },
          { text: "All 47 Counties", href: "" },
        ]}
      />
      {/* Pass the server-fetched data to the interactive client component */}
      <AllCountiesClient initialCounties={counties || []} />
    </>
  );
}