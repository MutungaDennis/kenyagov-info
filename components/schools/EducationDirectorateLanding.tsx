import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import PublicSchools from "@/components/schools/PublicSchools";

export const EDUCATION_DIRECTORATES = {
  "directorate-primary-education": {
    title: "Directorate of Primary Education",
    description: "Find published public primary and junior schools, and browse by county, level or school category.",
  },
  "directorate-secondary-education": {
    title: "Directorate of Secondary Education",
    description: "Find published public senior secondary schools, and browse by county, level or school category.",
  },
} as const;

export type EducationDirectorateSlug = keyof typeof EDUCATION_DIRECTORATES;

export function isEducationDirectorateSlug(slug: string): slug is EducationDirectorateSlug {
  return Object.hasOwn(EDUCATION_DIRECTORATES, slug);
}

export default function EducationDirectorateLanding({ slug }: { slug: EducationDirectorateSlug }) {
  const directorate = EDUCATION_DIRECTORATES[slug];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={[
        { text: "Home", href: "/" },
        { text: "Government", href: "/government" },
        { text: "Institutions", href: "/government/institutions" },
        { text: directorate.title },
      ]} />
      <main className="govuk-main-wrapper" id="main-content">
        <span className="govuk-caption-l">Ministry of Education</span>
        <h1 className="govuk-heading-xl">{directorate.title}</h1>
        <p className="govuk-body-l">{directorate.description}</p>
        <PublicSchools fixedDirectorate={slug} autoOpen />
      </main>
    </div>
  );
}
