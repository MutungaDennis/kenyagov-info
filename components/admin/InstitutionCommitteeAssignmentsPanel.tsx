"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import {
  chamberLabel,
  committeeMembershipStatus,
  parliamentaryChamberForInstitution,
  type CommitteePosition,
} from "@/lib/legislature/committees";
import styles from "./parliamentary-committee-editor.module.css";

type Candidate = { id: string; name: string; slug: string | null; title?: string };
type Committee = {
  id: string;
  name: string;
  category: string;
  is_active: boolean;
  is_published: boolean;
};
type PersonRef = { name?: string; slug?: string | null } | null;
type Membership = {
  id: string;
  committee_id: string;
  leader_id: string;
  position: CommitteePosition;
  start_date: string;
  end_date: string;
  sort_order: number;
  person: PersonRef;
};
type StaffEntry = {
  id: string;
  committee_id: string;
  leader_id: string;
  name: string;
  role_title: string;
  email: string;
  start_date: string;
  end_date: string;
  sort_order: number;
  person: PersonRef;
};

const POSITION_ORDER: Record<CommitteePosition, number> = {
  chairperson: 0,
  vice_chairperson: 1,
  member: 2,
};

const POSITION_OPTIONS: { value: CommitteePosition; label: string }[] = [
  { value: "chairperson", label: "Chairperson" },
  { value: "vice_chairperson", label: "Vice-Chairperson" },
  { value: "member", label: "Member" },
];

function membershipsSnapshot(rows: Membership[]) {
  return JSON.stringify(
    rows
      .map((row) => ({
        id: row.id,
        leader_id: row.leader_id,
        position: row.position,
        start_date: row.start_date || "",
        end_date: row.end_date || "",
        sort_order: Number(row.sort_order || 0),
      }))
      .sort((a, b) =>
        POSITION_ORDER[a.position] - POSITION_ORDER[b.position] ||
        a.sort_order - b.sort_order ||
        a.id.localeCompare(b.id),
      ),
  );
}

function staffSnapshot(rows: StaffEntry[]) {
  return JSON.stringify(
    rows
      .map((row) => ({
        id: row.id,
        leader_id: row.leader_id || "",
        name: row.name.trim(),
        role_title: row.role_title.trim(),
        email: row.email.trim(),
        start_date: row.start_date || "",
        end_date: row.end_date || "",
        sort_order: Number(row.sort_order || 0),
      }))
      .sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id)),
  );
}

function linkedPerson(raw: unknown): PersonRef {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const name = [row.first_name, row.other_names, row.surname]
    .filter((part): part is string => typeof part === "string" && Boolean(part.trim()))
    .join(" ")
    .trim() || (typeof row.full_name === "string" ? row.full_name : "");
  return { name, slug: typeof row.slug === "string" ? row.slug : null };
}

export default function InstitutionCommitteeAssignmentsPanel({
  institutionId,
  institutionSlug,
  institutionName,
}: {
  institutionId: string;
  institutionSlug: string;
  institutionName: string;
}) {
  const chamber = parliamentaryChamberForInstitution(institutionSlug, institutionName);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [staff, setStaff] = useState<StaffEntry[]>([]);
  const [members, setMembers] = useState<Candidate[]>([]);
  const [staffCandidates, setStaffCandidates] = useState<Candidate[]>([]);
  const [committeeId, setCommitteeId] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [coverageSearch, setCoverageSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<CommitteePosition>("member");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialSnapshots, setInitialSnapshots] = useState<Record<string, { memberships: string; staff: string }>>({});

  useEffect(() => {
    if (!chamber) return;
    let active = true;
    const load = async () => {
      try {
        const assignmentsResponse = await fetch(`/api/admin/institutions/${institutionId}/committee-assignments`, {
          credentials: "include",
          cache: "no-store",
        });
        const assignmentsJson = await assignmentsResponse.json();
        if (!assignmentsResponse.ok) {
          throw new Error([assignmentsJson.error, assignmentsJson.hint].filter(Boolean).join(" "));
        }
        if (!active) return;
        const rows: Committee[] = assignmentsJson.committees || [];
        setCommittees(rows);
        setCommitteeId((current) => current || rows.find((row) => row.is_active)?.id || rows[0]?.id || "");
        const loadedMemberships: Membership[] = (assignmentsJson.memberships || []).map((row: Record<string, unknown>) => ({
          id: String(row.id),
          committee_id: String(row.committee_id),
          leader_id: String(row.leader_id),
          position: row.position as CommitteePosition,
          start_date: String(row.start_date || ""),
          end_date: String(row.end_date || ""),
          sort_order: Number(row.sort_order || 1),
          person: linkedPerson(row.person),
        }));
        const loadedStaff: StaffEntry[] = (assignmentsJson.staff || []).map((row: Record<string, unknown>) => ({
          id: String(row.id),
          committee_id: String(row.committee_id),
          leader_id: String(row.leader_id || ""),
          name: String(row.name || ""),
          role_title: String(row.role_title || ""),
          email: String(row.email || ""),
          start_date: String(row.start_date || ""),
          end_date: String(row.end_date || ""),
          sort_order: Number(row.sort_order || 1),
          person: linkedPerson(row.person),
        }));
        setMemberships(loadedMemberships);
        setStaff(loadedStaff);
        const snapshots: Record<string, { memberships: string; staff: string }> = {};
        for (const item of rows) {
          snapshots[item.id] = {
            memberships: membershipsSnapshot(loadedMemberships.filter((row) => row.committee_id === item.id)),
            staff: staffSnapshot(loadedStaff.filter((row) => row.committee_id === item.id)),
          };
        }
        setInitialSnapshots(snapshots);
        setMembers(assignmentsJson.member_candidates || []);
        setStaffCandidates(assignmentsJson.staff_candidates || []);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load committee assignments.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [chamber, institutionId]);

  const committee = committees.find((row) => row.id === committeeId) || null;
  const committeeMemberships = useMemo(
    () => memberships
      .filter((row) => row.committee_id === committeeId)
      .sort((a, b) => POSITION_ORDER[a.position] - POSITION_ORDER[b.position] || a.sort_order - b.sort_order),
    [committeeId, memberships],
  );
  const committeeStaff = useMemo(
    () => staff.filter((row) => row.committee_id === committeeId),
    [committeeId, staff],
  );
  const dirtyCommitteeIds = committees
    .filter((item) =>
      membershipsSnapshot(memberships.filter((row) => row.committee_id === item.id)) !== (initialSnapshots[item.id]?.memberships || "[]") ||
      staffSnapshot(staff.filter((row) => row.committee_id === item.id)) !== (initialSnapshots[item.id]?.staff || "[]"))
    .map((item) => item.id);
  const hasPendingChanges = dirtyCommitteeIds.length > 0;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
  const alreadyCurrent = new Set(committeeMemberships
    .filter((row) => committeeMembershipStatus(row.start_date, row.end_date, today) === "current")
    .map((row) => row.leader_id));
  const availableMembers = members.filter((person) =>
    !alreadyCurrent.has(person.id) &&
    person.name.toLowerCase().includes(memberSearch.trim().toLowerCase()),
  );
  const availableStaff = staffCandidates.filter((person) =>
    person.name.toLowerCase().includes(staffSearch.trim().toLowerCase()) &&
    !committeeStaff.some((entry) =>
      entry.leader_id === person.id &&
      committeeMembershipStatus(entry.start_date, entry.end_date, today) === "current",
    ),
  );
  const activeCommitteeIds = new Set(committees.filter((row) => row.is_active).map((row) => row.id));
  const assignedHouseMemberIds = new Set(memberships
    .filter((row) => activeCommitteeIds.has(row.committee_id) &&
      committeeMembershipStatus(row.start_date, row.end_date, today) === "current")
    .map((row) => row.leader_id));
  const unassignedCount = members.filter((person) => !assignedHouseMemberIds.has(person.id)).length;
  const unassignedMembers = members.filter((person) =>
    !assignedHouseMemberIds.has(person.id) &&
    person.name.toLowerCase().includes(coverageSearch.trim().toLowerCase()),
  );

  if (!chamber) return null;

  const addMember = () => {
    const candidate = members.find((person) => person.id === selectedMember);
    if (!candidate || alreadyCurrent.has(candidate.id)) return;
    setMemberships((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        committee_id: committeeId,
        leader_id: candidate.id,
        position: selectedPosition,
        start_date: "",
        end_date: "",
        sort_order: Math.max(
          0,
          ...current.filter((row) => row.committee_id === committeeId && row.position === selectedPosition)
            .map((row) => row.sort_order),
        ) + 1,
        person: { name: candidate.name, slug: candidate.slug },
      },
    ]);
    setSelectedMember("");
    setError(null);
    setSuccess(null);
  };

  const addStaff = () => {
    const candidate = staffCandidates.find((person) => person.id === selectedStaff);
    if (!candidate) return;
    setStaff((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        committee_id: committeeId,
        leader_id: candidate.id,
        name: candidate.name,
        role_title: candidate.title || "Committee staff",
        email: "",
        start_date: "",
        end_date: "",
        sort_order: current.filter((row) => row.committee_id === committeeId).length + 1,
        person: { name: candidate.name, slug: candidate.slug },
      },
    ]);
    setSelectedStaff("");
    setError(null);
    setSuccess(null);
  };

  const moveMembership = (rowId: string, targetId: string) => {
    const row = memberships.find((item) => item.id === rowId);
    const target = committees.find((item) => item.id === targetId);
    if (!row || !target) return;
    const duplicate = memberships.some((item) =>
      item.committee_id === targetId && item.leader_id === row.leader_id &&
      committeeMembershipStatus(item.start_date, item.end_date, today) !== "former");
    if (duplicate) {
      setError(`${row.person?.name || "This member"} is already on ${target.name}. Remove the duplicate first.`);
      return;
    }
    setMemberships((current) => [
      ...current.filter((item) => item.id !== rowId),
      {
        ...row,
        id: crypto.randomUUID(),
        committee_id: targetId,
        sort_order: Math.max(0, ...current.filter((item) => item.committee_id === targetId && item.position === row.position).map((item) => item.sort_order)) + 1,
      },
    ]);
    setError(null);
    setSuccess(`Moved to ${target.name}. Save to apply the change to both committees.`);
  };

  const save = async () => {
    if (!dirtyCommitteeIds.length) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    const savedNames: string[] = [];
    // Targets are saved before the committee a member is moved out of, so nobody is lost on a partial failure.
    const ordered = [...dirtyCommitteeIds].sort((a, b) =>
      (a === committeeId ? 1 : 0) - (b === committeeId ? 1 : 0));
    try {
      for (const id of ordered) {
        const rowsM = memberships.filter((row) => row.committee_id === id);
        const rowsS = staff.filter((row) => row.committee_id === id);
        const response = await fetch(`/api/admin/institutions/${institutionId}/committee-assignments`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ committee_id: id, memberships: rowsM, staff: rowsS }),
        });
        const json = await response.json();
        if (!response.ok) throw new Error([json.error, json.hint].filter(Boolean).join(" "));
        setInitialSnapshots((current) => ({
          ...current,
          [id]: { memberships: membershipsSnapshot(rowsM), staff: staffSnapshot(rowsS) },
        }));
        savedNames.push(committees.find((item) => item.id === id)?.name || "Committee");
      }
      setSuccess(`Saved: ${savedNames.join(", ")}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save committee assignments.");
    } finally {
      setSaving(false);
    }
  };

  const updateMembership = (rowId: string, patch: Partial<Membership>) => {
    setMemberships((current) => current.map((row) => row.id === rowId ? { ...row, ...patch } : row));
    setSuccess(null);
  };
  const updateStaff = (rowId: string, patch: Partial<StaffEntry>) => {
    setStaff((current) => current.map((row) => row.id === rowId ? { ...row, ...patch } : row));
    setSuccess(null);
  };

  return (
    <section className="govuk-!-margin-top-8" aria-labelledby="institution-committee-assignments-heading">
      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
      <h2 className="govuk-heading-l" id="institution-committee-assignments-heading">
        {chamberLabel(chamber)} committee assignments
      </h2>
      <p className="govuk-body">
        Assign current MPs or Senators to one or more committees, and allow the National Assembly
        Speaker to hold committee leadership where appropriate. Set committee roles and service
        dates, and assign House staff to each committee’s administrative secretariat.
        Only people with current roles linked to this House institution are available. An empty
        end date means the person is still serving.
      </p>
      {!loading && members.length > 0 && (
        <>
          <p className="govuk-inset-text">
            {members.length} current House members · {members.length - unassignedCount} have at least
            one active committee assignment · {unassignedCount} have no active assignment.
          </p>
          {unassignedCount > 0 && (
            <details className="govuk-details govuk-!-margin-bottom-6">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Review members without an active assignment ({unassignedCount})</span>
              </summary>
              <div className="govuk-details__text">
                <label className="govuk-label" htmlFor="unassigned-member-search">Search unassigned members</label>
                <input className="govuk-input govuk-!-margin-bottom-3" id="unassigned-member-search" type="search" value={coverageSearch} onChange={(event) => setCoverageSearch(event.target.value)} />
                <ul className="govuk-list govuk-list--bullet">
                  {unassignedMembers.map((person) => (
                    <li key={person.id}>
                      {person.name}{" "}
                      <button
                        className="govuk-link"
                        type="button"
                        onClick={() => {
                          setMemberSearch(person.name);
                          setSelectedMember(person.id);
                          document.getElementById("house-member-search")?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                      >
                        Select to assign
                      </button>
                    </li>
                  ))}
                  {!unassignedMembers.length && <li>No unassigned members match this search.</li>}
                </ul>
              </div>
            </details>
          )}
        </>
      )}
      {error && <div className="govuk-error-summary" role="alert"><h3 className="govuk-error-summary__title">There is a problem</h3><p className="govuk-body">{error}</p></div>}
      {success && <p className="govuk-body" role="status">{success}</p>}
      {loading ? <p className="govuk-body">Loading committee assignments…</p> : !committees.length ? (
        <p className="govuk-inset-text">
          No {chamberLabel(chamber)} committees have been created yet. Create them in{" "}
          <Link className="govuk-link" href={adminPath("parliamentary-committees")}>Parliamentary committees</Link>.
        </p>
      ) : (
        <>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="institution-committee-select">Committee</label>
            <select
              className="govuk-select govuk-!-width-full"
              id="institution-committee-select"
              value={committeeId}
              onChange={(event) => {
                setCommitteeId(event.target.value);
                setError(null);
                setSuccess(null);
              }}
            >
              {committees.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.category} — {row.name}{row.is_active ? "" : " (retired)"}
                </option>
              ))}
            </select>
          </div>
          {committee && (
            <>
              <p className="govuk-hint">
                {committee.is_active ? "Active committee" : "Retired committee — existing history only"}
                {" · "}{committee.is_published ? "Public page published" : "Public page is a draft"}
              </p>
              {!committee.is_published && (
                <div className="govuk-warning-text">
                  <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                  <strong className="govuk-warning-text__text">
                    <span className="govuk-visually-hidden">Warning</span>
                    This committee is a draft, so its members are not shown on the public site. Publish it from{" "}
                    <Link className="govuk-link" href={adminPath(`parliamentary-committees/${committee.id}`)}>committee management</Link>.
                  </strong>
                </div>
              )}
              <section className="govuk-!-margin-bottom-7" aria-labelledby="house-committee-members-heading">
                <h3 className="govuk-heading-m" id="house-committee-members-heading">Leadership and members</h3>
                <div className={`govuk-grid-row govuk-!-margin-bottom-4 ${styles.addControls}`}>
                  <div className="govuk-grid-column-one-third govuk-form-group">
                    <label className="govuk-label" htmlFor="house-member-search">
                      Search current {chamber === "national_assembly" ? "MPs and Speaker" : "Senators"} designated to this House
                    </label>
                    <input className="govuk-input" id="house-member-search" value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Search by name" />
                    <label className="govuk-label govuk-!-margin-top-2" htmlFor="house-member-select">MP or Senator</label>
                    <select className="govuk-select govuk-!-width-full" id="house-member-select" value={selectedMember} onChange={(event) => setSelectedMember(event.target.value)} disabled={!committee.is_active}>
                      <option value="">{availableMembers.length ? "Select a member" : "No matching members available"}</option>
                      {availableMembers.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                    </select>
                  </div>
                  <div className="govuk-grid-column-one-quarter govuk-form-group">
                    <label className="govuk-label" htmlFor="house-member-position">Committee position</label>
                    <select className="govuk-select govuk-!-width-full" id="house-member-position" value={selectedPosition} onChange={(event) => setSelectedPosition(event.target.value as CommitteePosition)}>
                      {POSITION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="govuk-grid-column-one-quarter govuk-!-padding-top-6">
                    <button className="govuk-button govuk-button--secondary" type="button" disabled={!committee.is_active || !selectedMember} onClick={addMember}>Add member</button>
                  </div>
                </div>
                {!committeeMemberships.length ? <p className="govuk-inset-text">No member assignments recorded for this committee.</p> : (
                  <div className={`govuk-table__container ${styles.tableScroll}`} role="region" aria-label={`${committee.name} member assignments. Scroll horizontally to see all fields.`} tabIndex={0}>
                    <table className={`govuk-table ${styles.rosterTable}`}>
                      <thead className="govuk-table__head"><tr className="govuk-table__row"><th className="govuk-table__header" scope="col">Member</th><th className="govuk-table__header" scope="col">Position</th><th className="govuk-table__header" scope="col">Start date (required)</th><th className="govuk-table__header" scope="col">End date (optional)</th><th className="govuk-table__header" scope="col">Order within role</th><th className="govuk-table__header" scope="col">Move or remove</th></tr></thead>
                      <tbody className="govuk-table__body">
                        {committeeMemberships.map((row) => {
                          const status = committeeMembershipStatus(row.start_date, row.end_date, today);
                          const name = row.person?.name || members.find((person) => person.id === row.leader_id)?.name || "House member";
                          return <tr className="govuk-table__row" key={row.id}>
                            <th className="govuk-table__header" scope="row">
                              {row.person?.slug ? <Link className="govuk-link" href={`/government/people/${row.person.slug}`}>{name}</Link> : name}
                              <span className={`govuk-tag ${styles.memberStatus} ${status === "former" ? "govuk-tag--grey" : status === "upcoming" ? "govuk-tag--blue" : "govuk-tag--green"}`}>
                                {status === "current" ? "Serving" : status === "upcoming" ? "Upcoming" : "Former"}
                              </span>
                            </th>
                            <td className="govuk-table__cell"><select aria-label={`Committee position for ${name}`} className="govuk-select" value={row.position} onChange={(event) => updateMembership(row.id, { position: event.target.value as CommitteePosition })}>{POSITION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td>
                            <td className="govuk-table__cell"><input className="govuk-input" type="date" required aria-label={`Start date for ${name}`} value={row.start_date} onChange={(event) => updateMembership(row.id, { start_date: event.target.value })} /></td>
                            <td className="govuk-table__cell"><input className="govuk-input" type="date" aria-label={`End date for ${name}`} value={row.end_date} onChange={(event) => updateMembership(row.id, { end_date: event.target.value })} /></td>
                            <td className="govuk-table__cell"><input className="govuk-input govuk-input--width-3" type="number" min={1} aria-label={`Order for ${name}`} value={row.sort_order} onChange={(event) => updateMembership(row.id, { sort_order: Number(event.target.value) })} /></td>
                            <td className="govuk-table__cell">
                              <select className="govuk-select" aria-label={`Move ${name} to another committee`} value="" onChange={(event) => { if (event.target.value) moveMembership(row.id, event.target.value); }}>
                                <option value="">Move to?</option>
                                {committees.filter((item) => item.is_active && item.id !== committeeId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                              </select>
                              <br /><button className="govuk-link" type="button" onClick={() => setMemberships((current) => current.filter((item) => item.id !== row.id))}>Remove (added by mistake)</button>
                            </td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="govuk-!-margin-bottom-7" aria-labelledby="house-committee-secretariat-heading">
                <h3 className="govuk-heading-m" id="house-committee-secretariat-heading">Administrative secretariat</h3>
                <p className="govuk-body-s">Only current non-member roles linked to this House institution appear here. Select a person; their public House title is shown as their secretariat role.</p>
                <div className={`govuk-grid-row govuk-!-margin-bottom-4 ${styles.addControls}`}>
                  <div className="govuk-grid-column-one-third govuk-form-group">
                    <label className="govuk-label" htmlFor="house-staff-search">Search House staff</label>
                    <input className="govuk-input" id="house-staff-search" value={staffSearch} onChange={(event) => setStaffSearch(event.target.value)} placeholder="Search by name" />
                    <label className="govuk-label govuk-!-margin-top-2" htmlFor="house-staff-select">Staff member</label>
                    <select className="govuk-select govuk-!-width-full" id="house-staff-select" value={selectedStaff} onChange={(event) => setSelectedStaff(event.target.value)}>
                      <option value="">{availableStaff.length ? "Select House staff" : "No current House staff profiles found"}</option>
                      {availableStaff.map((person) => <option key={person.id} value={person.id}>{person.title ? `${person.name} ? ${person.title}` : person.name}</option>)}
                    </select>
                  </div>
                  <div className="govuk-grid-column-one-third govuk-form-group">
                    <p className="govuk-hint govuk-!-margin-top-6">The public title shown on their House profile is used automatically, for example ?Clerk of the National Assembly?.</p>
                  </div>
                  <div className="govuk-grid-column-one-quarter govuk-!-padding-top-6">
                      <button className="govuk-button govuk-button--secondary" type="button" disabled={!committee.is_active || !selectedStaff} onClick={addStaff}>Add secretariat staff</button>
                  </div>
                </div>
                {!committeeStaff.length ? <p className="govuk-inset-text">No secretariat assignments recorded for this committee.</p> : (
                  <div className={`govuk-table__container ${styles.tableScroll}`} role="region" aria-label={`${committee.name} secretariat assignments. Scroll horizontally to see all fields.`} tabIndex={0}>
                    <table className={`govuk-table ${styles.rosterTable}`}>
                      <thead className="govuk-table__head"><tr className="govuk-table__row"><th className="govuk-table__header" scope="col">House staff member</th><th className="govuk-table__header" scope="col">Public title</th><th className="govuk-table__header" scope="col">Start date (optional)</th><th className="govuk-table__header" scope="col">End date (optional)</th><th className="govuk-table__header" scope="col">Order</th><th className="govuk-table__header" scope="col"><span className="govuk-visually-hidden">Actions</span></th></tr></thead>
                      <tbody className="govuk-table__body">
                        {committeeStaff.map((row) => <tr className="govuk-table__row" key={row.id}>
                          <th className="govuk-table__header" scope="row">
                            {row.person?.slug ? <Link className="govuk-link" href={`/government/people/${row.person.slug}`}>{row.person.name || row.name}</Link> : row.person?.name || row.name}
                          </th>
                          <td className="govuk-table__cell">{row.role_title}</td>
                          <td className="govuk-table__cell"><input className="govuk-input" type="date" aria-label={`Start date for ${row.name}`} value={row.start_date} onChange={(event) => updateStaff(row.id, { start_date: event.target.value })} /></td>
                          <td className="govuk-table__cell"><input className="govuk-input" type="date" aria-label={`End date for ${row.name}`} value={row.end_date} onChange={(event) => updateStaff(row.id, { end_date: event.target.value })} /></td>
                          <td className="govuk-table__cell"><input className="govuk-input govuk-input--width-3" type="number" min={1} aria-label={`Display order for ${row.name}`} value={row.sort_order} onChange={(event) => updateStaff(row.id, { sort_order: Number(event.target.value) })} /></td>
                          <td className="govuk-table__cell"><button className="govuk-link" type="button" onClick={() => setStaff((current) => current.filter((item) => item.id !== row.id))}>Remove</button></td>
                        </tr>)}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              <div className={styles.actionBar}>
                <button className="govuk-button" type="button" disabled={saving || !hasPendingChanges} onClick={() => void save()}>
                  {saving ? "Saving assignments…" : "Save committee assignments"}
                </button>
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Members can serve on multiple committees. Saved dates preserve their service history.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
