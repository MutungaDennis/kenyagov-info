'use client';

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { createClient } from "@/lib/supabase/client";
import type { Leader, LeaderCategory } from "@/lib/supabase/leaders";

export default function LeadersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [categories, setCategories] = useState<LeaderCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      try {
        const [leadersData, categoriesData] = await Promise.all([
          supabase.from('leaders').select('*').order('name', { ascending: true }),
          supabase.from('leader_categories').select('*').order('name', { ascending: true })
        ]);
        
        if (leadersData.data) setLeaders(leadersData.data);
        if (categoriesData.data) setCategories(categoriesData.data);
      } catch (error) {
        console.error('Error fetching leaders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredLeaders = useMemo(() => {
    return leaders
      .filter((leader) => {
        const matchesSearch =
          leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leader.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (leader.county && leader.county.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory =
          selectedCategory === "All" || leader.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, selectedCategory, leaders]);

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Current Leaders", href: "/leaders" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Current Leaders</h1>
        <p className="govuk-body-l">
          Elected and appointed public office holders across all arms and levels of government.
        </p>

        {/* Search & Filter */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="search-leaders">
                Search leaders
              </label>
              <input
                className="govuk-input"
                id="search-leaders"
                type="text"
                placeholder="Search by name, title, county..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="category-filter">
                Filter by category
              </label>
              <select
                className="govuk-select"
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Leaders</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="govuk-body-s govuk-!-margin-bottom-6">
            <p>Loading leaders...</p>
          </div>
        )}

        {!isLoading && (
          <p className="govuk-body-s govuk-!-margin-bottom-6">
            Showing {filteredLeaders.length} leaders
          </p>
        )}

        {/* Leaders List - FIXED */}
        {!isLoading && (
          <ul className="govuk-list">
            {filteredLeaders.map((leader) => (
            <li 
              key={leader.id} 
              className="govuk-!-margin-bottom-6 pb-6 border-b border-gray-200 last:border-b-0"
            >
              <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
                {leader.link ? (
                  <Link href={leader.link} className="govuk-link">
                    {leader.name}
                  </Link>
                ) : (
                  <span>{leader.name}</span>
                )}
              </h3>
              <p className="govuk-body govuk-!-margin-bottom-1 font-medium">
                {leader.title}
              </p>

              {(leader.county || leader.constituency) && (
                <p className="govuk-body-s text-gray-600">
                  {leader.county && `County: ${leader.county}`}
                  {leader.county && leader.constituency && " • "}
                  {leader.constituency && `Constituency/Ward: ${leader.constituency}`}
                </p>
              )}

              <p className="govuk-body-s">{leader.description}</p>
            </li>
            ))}
          </ul>

          {filteredLeaders.length === 0 && (
            <p className="govuk-body">No leaders found. Try adjusting your search or filter.</p>
          )}
        )}

        <GovUKFeedback />
      </main>
    </div>
  );
}
