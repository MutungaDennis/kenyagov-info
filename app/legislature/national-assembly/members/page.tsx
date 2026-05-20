'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKTable from "@/components/govuk/Table";
import GovUKFeedback from "@/components/govuk/Feedback";
import { nationalAssemblyMembers, type Member } from "@/data/national-assembly-members";

export default function NationalAssemblyMembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const filteredMembers = useMemo(() => {
    return nationalAssemblyMembers.filter((member) => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.constituency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.party.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesParty = !selectedParty || member.party === selectedParty;
      const matchesType = !selectedType || member.type === selectedType;

      return matchesSearch && matchesParty && matchesType;
    });
  }, [searchTerm, selectedParty, selectedType]);

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/legislature/national-assembly" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Legislature", href: "/legislature" },
          { text: "National Assembly", href: "/legislature/national-assembly" },
          { text: "Members", href: "/legislature/national-assembly/members" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-xl">Members of the National Assembly</h1>
            <p className="govuk-body-l">
              13th Parliament (2022–2027) — {filteredMembers.length} members found
            </p>

            {/* Filters */}
            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="search">Search Members</label>
                <input
                  className="govuk-input"
                  id="search"
                  type="text"
                  placeholder="Name, constituency or county..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="party">Party</label>
                <select 
                  className="govuk-select" 
                  id="party"
                  value={selectedParty}
                  onChange={(e) => setSelectedParty(e.target.value)}
                >
                  <option value="">All Parties</option>
                  <option value="ANC">ANC - Amani National Congress</option>
                  <option value="CCM">CCM - Chama Cha Mashinani</option>
                  <option value="DAP-K">DAP-K - Democratic Action Party</option>
                  <option value="DP">DP - Democratic Party of Kenya</option>
                  <option value="FORD-K">FORD-K - Forum for the Restoration of Democracy</option>
                  <option value="GDDP">GDDP - Grand Dream Development Party</option>
                  <option value="Independent">Independent</option>
                  <option value="JP">JP - Jubilee Party</option>
                  <option value="KANU">KANU - Kenya African National Union</option>
                  <option value="KUP">KUP - Kenya Union Party</option>
                  <option value="MCCP">MCCP - Maendeleo Chap Chap Party</option>
                  <option value="MDG">MDG - Movement for Democracy and Growth</option>
                  <option value="NAP-K">NAP-K - National Alliance Party</option>
                  <option value="NOPEU">NOPEU - National Ordinary People Empowerment Union</option>
                  <option value="ODM">ODM - Orange Democratic Movement</option>
                  <option value="PAA">PAA - Pamoja African Alliance</option>
                  <option value="TSP">TSP - The Service Party</option>
                  <option value="UDA">UDA - United Democratic Alliance</option>
                  <option value="UDM">UDM - United Democratic Movement</option>
                  <option value="UPA">UPA - United Progressive Alliance</option>
                  <option value="UPIA">UPIA - United Party of Independent Alliance</option>
                  <option value="WDM-K">WDM-K - Wiper Democratic Movement</option>
                </select>
              </div>

              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="type">Type</label>
                <select 
                  className="govuk-select" 
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Constituency">Constituency MP</option>
                  <option value="Women Representative">Women Representative</option>
                  <option value="Nominated">Nominated</option>
                </select>
              </div>
            </div>

            <h2 className="govuk-heading-m">Showing {filteredMembers.length} Members</h2>

            <GovUKTable
              caption="Members of the National Assembly"
              headers={[
                { text: "No." },
                { text: "Name" },
                { text: "Constituency / County" },
                { text: "Party" },
                { text: "Type" },
              ]}
              rows={filteredMembers.map((member, index) => ({
                cells: [
                  (index + 1).toString(),
                  <Link 
                    key={member.id} 
                    href={`/legislature/national-assembly/members/${member.slug}`} 
                    className="govuk-link"
                  >
                    {member.name}
                  </Link>,
                  member.constituency,
                  member.party,
                  member.type,
                ],
              }))}
            />
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}