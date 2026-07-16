import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";

import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

import PrintPageButton from "@/components/govuk/PrintPageButton";
import LastUpdated from "@/components/govuk/LastUpdated";

export const revalidate = 3600;


interface AboutPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WardAboutPage({ params }: AboutPageProps) {
  const supabase = createPublicClient();
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: ward, error } = await supabase
    .from("wards")
    .select("*")
    .eq("slug", decodedSlug)
    .single();

  if (error || !ward) {
    notFound();
  }

  const [ { data: schools }, { data: health }, { data: projects } ] = await Promise.all([
    supabase.from("ward_schools").select("*").eq("ward_id", ward.id).order("name"),
    supabase.from("ward_health_facilities").select("*").eq("ward_id", ward.id).order("name"),
    supabase.from("ward_projects").select("*").eq("ward_id", ward.id).order("created_at", { ascending: false }),
  ]);

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Wards", href: "/counties/wards" },
          { text: ward.name, href: `/counties/wards/${slug}` },
          { text: "About", href: "" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">{ward.name} Ward Details</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Public service listings, education infrastructures, health centres, and county deployment tracking logs.
            </p>
            <div className="govuk-!-margin-bottom-6 print-hide">
              <PrintPageButton />
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          {/* Enhanced GOV.UK Sidebar Navigation */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-6">
            <nav 
              style={{ borderTop: '2px solid #1d70b8', padding: '15px 0' }} 
              aria-label="Secondary Profile Navigation"
            >
              <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                <li style={{ paddingLeft: '16px' }}>
                  <Link 
                    href={`/counties/wards/${slug}`} 
                    className="govuk-link govuk-!-font-size-19" 
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    Overview & Geography
                  </Link>
                </li>
                <li style={{ 
                  paddingLeft: '12px', 
                  borderLeft: '4px solid #1d70b8', 
                  fontWeight: 'bold',
                  color: '#1d70b8'
                }}>
                  Facilities & Projects
                </li>
              </ul>
            </nav>
          </div>

          <div className="govuk-grid-column-two-thirds">
            
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Education Facilities</h2>
            {schools?.length ? (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                <table className="govuk-table" style={{ minWidth: '500px' }}>
                  <caption className="govuk-table__caption govuk-visually-hidden">Registered schools inside the ward.</caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Institution Name</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '150px' }}>Type</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {schools.map((s) => (
                      <tr key={s.id} className="govuk-table__row">
                        <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>{s.name}</th>
                        <td className="govuk-table__cell govuk-body-s">{s.type ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="govuk-body govuk-text-secondary govuk-!-margin-bottom-6">No public schools or educational complexes recorded in this boundary area.</p>
            )}

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Health Facilities</h2>
            {health?.length ? (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                <table className="govuk-table" style={{ minWidth: '500px' }}>
                  <caption className="govuk-table__caption govuk-visually-hidden">Registered public health infrastructure installations.</caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Facility Name</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '150px' }}>Classification</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {health.map((h) => (
                      <tr key={h.id} className="govuk-table__row">
                        <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>{h.name}</th>
                        <td className="govuk-table__cell govuk-body-s">{h.facility_type ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="govuk-body govuk-text-secondary govuk-!-margin-bottom-6">No public clinics, dispensaries, or health facilities recorded for this ward.</p>
            )}

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Development Projects</h2>
            {projects?.length ? (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                <table className="govuk-table" style={{ minWidth: '500px' }}>
                  <caption className="govuk-table__caption govuk-visually-hidden">Track record log of county development investments inside this unit.</caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Project Name</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '120px' }}>Status</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '80px' }}>Year</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {projects.map((p) => (
                      <tr key={p.id} className="govuk-table__row">
                        <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>{p.name}</th>
                        <td className="govuk-table__cell govuk-body-s">
                          <strong className={`govuk-tag ${p.status?.toLowerCase() === 'completed' ? 'govuk-tag--green' : 'govuk-tag--yellow'}`}>
                            {p.status ?? "—"}
                          </strong>
                        </td>
                        <td className="govuk-table__cell govuk-body-s">{p.year ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="govuk-body govuk-text-secondary govuk-!-margin-bottom-6">No county infrastructure investments or development records found for this unit.</p>
            )}

            {/* Replaced broken inline style with standard GOV.UK spacer utilities */}
            <div className="govuk-!-margin-top-8">
              <LastUpdated lastUpdated={ward.updated_at} published={ward.created_at} />
            </div>

            <div 
              className="govuk-!-margin-top-6" 
              style={{ paddingTop: '15px', borderTop: '1px solid #bfc1c3', display: 'flex', justifyContent: 'flex-start' }}
            >
              <Link href={`/counties/wards/${slug}`} className="govuk-link govuk-!-font-size-19" style={{ fontWeight: 'bold' }}>
                &larr; Back to Overview & Geography
              </Link>
            </div>

            
          </div>
        </div>
      
    
  
  </>
);
}
