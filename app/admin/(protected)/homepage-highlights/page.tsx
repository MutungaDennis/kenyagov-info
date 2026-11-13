import HomepageHighlightsEditor from "@/components/admin/HomepageHighlightsEditor";
import { getHomepageHighlights } from "@/lib/homepage-highlights";

export const dynamic = "force-dynamic";

export default async function HomepageHighlightsPage() {
  const initialConfig = await getHomepageHighlights();

  return (
    <>
      <span className="govuk-caption-l">Site management</span>
      <h1 className="govuk-heading-xl">Homepage highlights</h1>
      <p className="govuk-body">
        Choose the timely information shown on the public homepage. Add up to three categories or updates, set their links, and change the section name.
      </p>
      <HomepageHighlightsEditor initialConfig={initialConfig} />
    </>
  );
}
