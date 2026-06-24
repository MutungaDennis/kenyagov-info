import { notFound } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from 'next';

export async function generateMetadata({ params }: ProfileProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: leader } = await supabase.from('leaders').select('name, title').eq('id', id).single();
  if (leader) {
    return {
      title: `${leader.name} - ${leader.title}`,
      description: `Profile and details for ${leader.name}, ${leader.title}.`,
    };
  }
  return { title: 'Leader Profile' };
}

interface ProfileProps {
  params: Promise<{ category: string; id: string }>;
}

export default async function LeaderProfile({ params }: ProfileProps) {
  const { category, id } = await params;
  const supabase = await createClient();
  const isCountyAssembly = category.toLowerCase() === "county-assembly";

  let leaderProfileData: {
    name: string;
    title: string;
    county?: string;
    description: string;
    status: string;
    additionalDetails: Array<{ label: string; value: string | React.ReactNode }>;
    committees: Array<{ name: string; role: string }>;
  };

  if (isCountyAssembly) {
    // 1. Fetch comprehensive model matching the alphanumeric unique text slug
    const { data: mca, error } = await supabase
      .from('mcas')
      .select(`
        *, 
        counties ( name ), 
        wards ( name, ward_code ), 
        political_parties ( name, abbreviation )
      `)
      .eq('slug', id)
      .single();

    if (error || !mca) notFound();

    leaderProfileData = {
      name: `Hon. ${mca.first_name} ${mca.surname}`,
      title: mca.assembly_role,
      county: mca.counties?.name,
      status: mca.status,
      committees: mca.committees || [],
      description: mca.seat_type === 'Elected' 
        ? `Hon. ${mca.first_name} ${mca.surname} is the democratically elected representative for ${mca.wards?.name || 'N/A'} Ward (Code: ${mca.wards?.ward_code || 'N/A'}), serving within the ${mca.counties?.name || 'N/A'} County Assembly infrastructure for election cycle term ${mca.term_count}.`
        : `Hon. ${mca.first_name} ${mca.surname} is an appointed legislator within the ${mca.counties?.name || 'N/A'} County Assembly, selected to represent the special interest group or gender parity seat matching the ${mca.nomination_category} framework.`,
      additionalDetails: [
        { label: "Deployment Designation", value: mca.seat_type },
        { 
          label: "Representation Category", 
          value: mca.seat_type === 'Nominated' ? mca.nomination_category : `Geographic Ward (${mca.wards?.name})` 
        },
        { label: "Gender Composition", value: mca.gender },
        { 
          label: "Political Affiliation", 
          value: mca.political_parties ? `${mca.political_parties.name} (${mca.political_parties.abbreviation})` : "Independent Candidate" 
        },
        { 
          label: "Official Work Correspondence", 
          value: mca.official_email ? (
            <a href={`mailto:${mca.official_email}`} className="govuk-link break-all">{mca.official_email}</a>
          ) : (
            <span className="text-gray-500 italic">Not publicly published</span>
          ) 
        },
        { label: "Date of Swearing In", value: new Date(mca.term_start_date).toLocaleDateString('en-KE', { dateStyle: 'long' }) }
      ]
    };
  } else {
    // Fallback strategy for general traditional categories (e.g. Governors)
    const { data, error } = await supabase
      .from('leaders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) notFound();

    leaderProfileData = {
      name: data.name,
      title: data.title,
      county: data.county,
      status: 'Active',
      committees: [],
      description: data.description,
      additionalDetails: [
        { label: "Legislative Tier", value: data.title },
        { label: "Administrative Location", value: data.county ? `${data.county} County` : "National Level" }
      ]
    };
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Current Leaders", href: "/leaders" },
          { text: category.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), href: `/leaders/${category}` },
          { text: leaderProfileData.name, href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        {/* Top Header Grid Section */}
        <div className="govuk-grid-row border-b-4 border-blue-800 pb-4 mb-8">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l font-bold tracking-wide uppercase text-blue-800">
              {leaderProfileData.county ? `${leaderProfileData.county} County Assembly` : "Public Official Profile"}
            </span>
            <h1 className="govuk-heading-xl mb-2">{leaderProfileData.name}</h1>
            <p className="govuk-body-l text-gray-700 font-medium mb-0">{leaderProfileData.title}</p>
          </div>
          
          <div className="govuk-grid-column-one-third flex justify-start md:justify-end items-center pt-4 md:pt-0">
            <strong className={`govuk-tag ${leaderProfileData.status === 'Active' ? 'govuk-tag--green' : 'govuk-tag--red'} text-base px-4 py-1`}>
              {leaderProfileData.status} Representation
            </strong>
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Descriptive Biography Block */}
            <h2 className="govuk-heading-l">Biography and Mandate</h2>
            <div className="govuk-body bg-gray-50 border-l-4 border-gray-300 p-4 mb-8">
              <p className="mb-0 leading-relaxed">{leaderProfileData.description}</p>
            </div>

            {/* Structured Key Information List */}
            <h2 className="govuk-heading-l">Key Profile Data</h2>
            <dl className="govuk-summary-list govuk-!-margin-bottom-9">
              {leaderProfileData.additionalDetails.map((detail, idx) => (
                <div className="govuk-summary-list__row" key={idx}>
                  <dt className="govuk-summary-list__key text-gray-600 font-medium">
                    {detail.label}
                  </dt>
                  <dd className="govuk-summary-list__value font-semibold">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* House Standing Committees Configuration */}
            {isCountyAssembly && (
              <div className="govuk-!-margin-top-9">
                <h2 className="govuk-heading-l">Assembly Committee Assignments</h2>
                <p className="govuk-body-m text-gray-600">
                  Standing and sector-specific oversight committee structures assigned to this member:
                </p>
                
                {leaderProfileData.committees && leaderProfileData.committees.length > 0 ? (
                  <table className="govuk-table">
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row border-b-2 border-black">
                        <th scope="col" className="govuk-table__header text-left py-2">Committee Name</th>
                        <th scope="col" className="govuk-table__header text-left py-2">Designated Role</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {leaderProfileData.committees.map((committee: any, index: number) => (
                        <tr key={index} className="govuk-table__row border-b border-gray-200 hover:bg-gray-50">
                          <td className="govuk-table__cell py-3 font-medium">{committee.name}</td>
                          <td className="govuk-table__cell py-3">
                            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
                              committee.role === 'Chairperson' ? 'bg-blue-100 text-blue-800' :
                              committee.role === 'Vice-Chairperson' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {committee.role || "Member"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="govuk-inset-text italic text-gray-500">
                    No legislative or steering committee mappings have been published for this representative.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
