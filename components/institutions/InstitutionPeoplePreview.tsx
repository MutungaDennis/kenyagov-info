"use client";

import { useEffect, useState } from "react";
import { createBrowserClientAsync } from "@/lib/supabase/client";

type Person = { id: string; name: string; title: string | null; start_date: string | null; is_current: boolean | null };

export default function InstitutionPeoplePreview({ institutionId }: { institutionId: string }) {
  const [people, setPeople] = useState<Person[]>([]);
  useEffect(() => { let active = true; void createBrowserClientAsync().then((db) => db.from("institution_leaders").select("id,name,title,start_date,is_current").eq("institution_id", institutionId).order("is_current", { ascending: false }).order("start_date", { ascending: false }).then(({ data }) => { if (active) setPeople((data || []) as Person[]); })); return () => { active = false; }; }, [institutionId]);
  return <div className="healthcare-people-grid">{people.length ? people.map((person) => <article className="healthcare-person-card" key={person.id}><h3 className="govuk-heading-m">{person.name}</h3><p className="govuk-body">{person.title || "Institution official"}</p>{person.is_current && <p className="govuk-caption-m">Current appointment</p>}</article>) : <p className="govuk-body">No management or board members have been recorded for this institution yet.</p>}</div>;
}
