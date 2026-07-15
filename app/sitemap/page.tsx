'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


export default function SitemapPage() {
  return (
    <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Sitemap", href: "/sitemap" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Sitemap</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              A comprehensive directory of all sections, registers, and public information pages available on CitizenGuide.KE.
            </p>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">
              Topics and services
            </h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/topics" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  Browse topics
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">
                  Life events and service clusters for citizens.
                </p>
              </li>
              <li>
                <Link href="/services" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  Public services
                </Link>
              </li>
              <li>
                <Link href="/services/popular" className="govuk-link">
                  Popular services
                </Link>
              </li>
              <li>
                <Link href="/services/a-z" className="govuk-link">
                  Services A to Z
                </Link>
              </li>
              <li>
                <Link href="/browse" className="govuk-link">
                  Browse (topics)
                </Link>
              </li>
              <li>
                <Link href="/ecitizen" className="govuk-link">
                  eCitizen explained
                </Link>
              </li>
              <li>
                <Link href="/huduma-centres" className="govuk-link">
                  Huduma Centres
                </Link>
              </li>
              <li>
                <Link href="/huduma-centres/locations" className="govuk-link">
                  Huduma Centre locations
                </Link>
              </li>
              <li>
                <Link href="/guides" className="govuk-link">
                  Guides and life events
                </Link>
              </li>
              <li>
                <Link href="/guides/having-a-baby" className="govuk-link">
                  Having a baby
                </Link>
              </li>
              <li>
                <Link href="/guides/registering-a-death" className="govuk-link">
                  Registering a death
                </Link>
              </li>
              <li>
                <Link href="/guides/starting-a-business" className="govuk-link">
                  Starting a business
                </Link>
              </li>
              <li>
                <Link href="/kenya-gazette" className="govuk-link">
                  Kenya Gazette
                </Link>
              </li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">
              Civic explainers
            </h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/how-government-works" className="govuk-link">
                  How government works
                </Link>
              </li>
              <li>
                <Link href="/county-vs-national" className="govuk-link">
                  County vs national government
                </Link>
              </li>
              <li>
                <Link href="/how-public-money-works" className="govuk-link">
                  How public money works
                </Link>
              </li>
              <li>
                <Link href="/find-your-representatives" className="govuk-link">
                  Find your representatives
                </Link>
              </li>
              <li>
                <Link href="/contact-government" className="govuk-link">
                  Contact government
                </Link>
              </li>
              <li>
                <Link href="/complain-about-government" className="govuk-link">
                  Complain about government
                </Link>
              </li>
              <li>
                <Link href="/access-to-information" className="govuk-link">
                  Access to information
                </Link>
              </li>
              <li>
                <Link href="/scams" className="govuk-link">
                  Scams and fake websites
                </Link>
              </li>
              <li>
                <Link href="/emergency-and-safety" className="govuk-link">
                  Emergency and safety
                </Link>
              </li>
            </ul>

            {/* Category 1: Government Hub */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Government</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Government Hub</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Central directory for all government institutions, officials, and transparency registers.</p>
              </li>
            </ul>

            {/* Category 2: The Executive */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">The Executive</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/presidency" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">The Presidency</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Overview of the Executive Office of the President, key offices, and subordinate bodies.</p>
              </li>
              <li>
                <Link href="/government/deputy-presidency" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Office of the Deputy President</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Key positions and institutions under the Deputy President.</p>
              </li>
              <li>
                <Link href="/government/prime-cabinet-secretary" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Office of the Prime Cabinet Secretary</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Coordination of government ministries and public service delivery.</p>
              </li>
              <li>
                <Link href="/government/cabinet" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">The Cabinet</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Cabinet Secretaries and the executive leadership of government.</p>
              </li>
            </ul>

            {/* Category 3: Government Institutions */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Government Institutions</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/institutions" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">All Government Institutions</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Complete directory of ministries, state departments, commissions, and parastatals.</p>
              </li>
              <li>
                <Link href="/government/commissions" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Constitutional Commissions and Independent Bodies</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Chapter 15 commissions, independent offices, and sovereign constitutional bodies.</p>
              </li>
            </ul>

            {/* Category 4: Government Officials */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Government Officials</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/people" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">All Government Officials (A-Z)</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Directory of all current government officials, searchable and filterable.</p>
              </li>
            </ul>

            {/* Category 5: Transparency and Registers */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Transparency and Registers</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/cabinet-decisions" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Cabinet Decisions</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Official dispatches and policy approvals passed during Cabinet sessions.</p>
              </li>
              <li>
                <Link href="/government/executive-orders" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Presidential Executive Orders</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Formal policy directives and ministerial re-organisations.</p>
              </li>
              <li>
                <Link href="/government/presidential-visits" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Register of International Visits</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Diplomatic itineraries, overseas summits, and bilateral outcomes.</p>
              </li>
              <li>
                <Link href="/government/publications" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Publications</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Policy papers, reports, and official government publications.</p>
              </li>
              <li>
                <Link href="/government/speeches" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Speeches</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Official speeches and addresses by government leaders.</p>
              </li>
              <li>
                <Link href="/government/consultations" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Open Consultations</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Policy drafts open for public participation.</p>
              </li>
            </ul>

            {/* Category 6: The Legislature */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">The Legislature</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/legislature" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Parliament of Kenya</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Overview of the National Assembly and Senate.</p>
              </li>
              <li>
                <Link href="/government/legislature/national-assembly/members" className="govuk-link">Members of the National Assembly</Link>
              </li>
              <li>
                <Link href="/government/legislature/senate/senators" className="govuk-link">Senators</Link>
              </li>
              <li>
                <Link href="/government/legislature/tracker/bills" className="govuk-link">Bills Tracker</Link>
              </li>
              <li>
                <Link href="/government/legislature/tracker/papers" className="govuk-link">Tabled Papers</Link>
              </li>
              <li>
                <Link href="/government/legislature/tracker/questions" className="govuk-link">Parliamentary Questions</Link>
              </li>
              <li>
                <Link href="/government/legislature/hansard/national-assembly" className="govuk-link">Hansard - National Assembly</Link>
              </li>
              <li>
                <Link href="/government/legislature/hansard/senate" className="govuk-link">Hansard - Senate</Link>
              </li>
            </ul>

            {/* Category 7: The Judiciary */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">The Judiciary</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/judiciary" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">The Judiciary</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Overview of the Kenyan court system and judicial administration.</p>
              </li>
              <li>
                <Link href="/government/judiciary/supreme-court" className="govuk-link">Supreme Court of Kenya</Link>
              </li>
              <li>
                <Link href="/government/judiciary/administration" className="govuk-link">Judicial Administration</Link>
              </li>
            </ul>

            {/* Category 8: Counties and Devolution */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Counties and Devolution</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/counties" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">County Governments</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Explore the 47 county governments, their leadership, and performance.</p>
              </li>
              <li>
                <Link href="/government/counties/all" className="govuk-link">All 47 Counties</Link>
              </li>
              <li>
                <Link href="/government/counties/governors" className="govuk-link">County Governors and Deputies</Link>
              </li>
              <li>
                <Link href="/government/counties/wards" className="govuk-link">Wards and Constituencies</Link>
              </li>
              <li>
                <Link href="/government/counties/devolution" className="govuk-link">Understanding Devolution</Link>
              </li>
              <li>
                <Link href="/government/counties/performance" className="govuk-link">County Performance Dashboard</Link>
              </li>
              <li>
                <Link href="/government/counties/analytics" className="govuk-link">County Analytics</Link>
              </li>
            </ul>

            {/* Category 9: Elections and Politics */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Elections and Politics</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/elections" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Elections</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Kenya's electoral system, voter registration, and election results.</p>
              </li>
              <li>
                <Link href="/elections/general-elections" className="govuk-link">General Elections</Link>
              </li>
              <li>
                <Link href="/elections/by-elections" className="govuk-link">By-Elections</Link>
              </li>
              <li>
                <Link href="/elections/referendums" className="govuk-link">Referendums</Link>
              </li>
              <li>
                <Link href="/elections/voter-registration" className="govuk-link">Voter Registration</Link>
              </li>
              <li>
                <Link href="/elections/registered-voters" className="govuk-link">Registered Voters Data</Link>
              </li>
              <li>
                <Link href="/elections/political-parties" className="govuk-link">Political Parties</Link>
              </li>
              <li>
                <Link href="/elections/coalitions" className="govuk-link">Political Coalitions</Link>
              </li>
            </ul>

            {/* Category 10: Constitution and Laws */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Constitution and Laws</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/constitution" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Constitution of Kenya 2010</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">The supreme law of Kenya, with all chapters and articles.</p>
              </li>
              <li>
                <Link href="/acts/parliament" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Acts of Parliament</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Laws enacted by the Parliament of Kenya.</p>
              </li>
            </ul>

            {/* Category 11: Documents and Publications */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Documents and Publications</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/documents" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Documents Hub</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Key government documents, sessional papers, and strategic plans.</p>
              </li>
              <li>
                <Link href="/documents/vision-2030" className="govuk-link">Kenya Vision 2030</Link>
              </li>
              <li>
                <Link href="/documents/sessional-papers/1965-no-10" className="govuk-link">Sessional Paper No. 10 of 1965 (African Socialism)</Link>
              </li>
              <li>
                <Link href="/documents/sessional-papers/1986-no-1" className="govuk-link">Sessional Paper No. 1 of 1986</Link>
              </li>
              <li>
                <Link href="/documents/sessional-papers/2012-no-1" className="govuk-link">Sessional Paper No. 1 of 2012</Link>
              </li>
            </ul>

            {/* Category 12: Guides and Society */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Guides and Society</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/guides" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Guides</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Step-by-step guides on government processes and citizen rights.</p>
              </li>
              <li>
                <Link href="/society-and-culture" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Society and Culture</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Kenyan heritage, languages, national symbols, and cultural calendar.</p>
              </li>
            </ul>

            {/* Category 13: Public Services */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Public Services</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/services" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">All Services</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Central hub for civil registration pathways and common informational guides.</p>
              </li>
            </ul>

            {/* Category 14: Search and Data */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Search and Data</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/search/all" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Search All Government Content</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Search across all government documents, institutions, and officials.</p>
              </li>
              <li>
                <Link href="/open-data" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Open Data</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Machine-readable datasets and machine-to-machine disclosures.</p>
              </li>
            </ul>

            {/* Category 15: Platform Information */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Platform Information</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li><Link href="/about" className="govuk-link">About CitizenGuide.KE</Link></li>
              <li><Link href="/editorial-policy" className="govuk-link">Editorial policy</Link></li>
              <li><Link href="/content-style-guide" className="govuk-link">Content style guide</Link></li>
              <li><Link href="/disclaimer" className="govuk-link">Disclaimer</Link></li>
              <li><Link href="/corrections" className="govuk-link">Corrections</Link></li>
              <li><Link href="/help" className="govuk-link">Help and Support Centre</Link></li>
              <li><Link href="/contact-government" className="govuk-link">Contact government</Link></li>
              <li><Link href="/contact" className="govuk-link">Contact this website</Link></li>
              <li><Link href="/feedback" className="govuk-link">Feedback</Link></li>
              <li><Link href="/support" className="govuk-link">Support</Link></li>
              <li><Link href="/accessibility" className="govuk-link">Accessibility Statement</Link></li>
              <li><Link href="/privacy" className="govuk-link">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="govuk-link">Cookies Policy</Link></li>
              <li><Link href="/terms" className="govuk-link">Terms and Conditions</Link></li>
            </ul>

          </div>
        </div>
      
    
  
    </>
);
}