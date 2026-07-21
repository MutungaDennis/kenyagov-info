"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminPath } from "@/lib/admin-path";
import {
  displayNameWithTitles,
  formatTermRange,
  type AcademicQualification,
  type LeaderRoleLike,
} from "@/lib/leaders/display";
import {
  ENTRY_TYPES,
  fieldsForPosition,
} from "@/lib/leaders/role-fields";
import {
  FORMER_PROVINCES,
  geographicRequirementsForTerm,
} from "@/lib/leaders/kenya-geography";
import {
  LEADER_LEVELS,
  ROLE_STATUSES,
  SEAT_TYPES,
  normalizeLeaderLevel,
  normalizeRoleStatus,
  normalizeSeatType,
} from "@/lib/leaders/role-normalize";
import {
  NAME_TITLE_OPTIONS,
  NATIONAL_HONOUR_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS,
  formatNationalHonoursSuffix,
  parseNameTitles,
  parseNationalHonours,
  parseSocialLinks,
  type SocialLink,
} from "@/lib/leaders/titles-social";

type FormState = {
  first_name: string;
  other_names: string;
  surname: string;
  slug: string;
  title: string;
  current_party: string;
  current_constituency: string;
  current_county: string;
  current_organization: string;
  level: string;
  bio: string;
  image_url: string;
  contact_email: string;
  phone: string;
  official_website: string;
  is_active: boolean;
};

type RoleForm = {
  position_id: string;
  title: string;
  institution_id: string;
  organization: string;
  party_id: string;
  /** Free-text party name when creating / historical parties */
  party_name: string;
  county_id: string;
  /** Former province (pre-devolution) stored on leader_roles.county when no county_id */
  province: string;
  constituency_id: string;
  /** Free-text constituency (former seat not yet in catalogue) */
  constituency_name: string;
  ward_id: string;
  government_level_id: string;
  level: string;
  seat_type: string;
  term_start_date: string;
  term_end_date: string;
  status: string;
  entry_type: string;
  official_email: string;
  office_location: string;
  set_as_current: boolean;
};

type RefItem = {
  id: string | number;
  name?: string | null;
  title?: string | null;
  abbreviation?: string | null;
  code?: string | null;
  short_name?: string | null;
  level?: string | null;
  county_id?: string | number | null;
  constituency_id?: string | number | null;
  government_level?: string | null;
  institution_type?: string | null;
  is_active?: boolean | null;
  official_name?: string | null;
  slug?: string | null;
};

type Lookups = {
  parties: RefItem[];
  counties: RefItem[];
  constituencies: RefItem[];
  wards: RefItem[];
  institutions: RefItem[];
  levels: RefItem[];
  positions: RefItem[];
};

const emptyForm: FormState = {
  first_name: "",
  other_names: "",
  surname: "",
  slug: "",
  title: "",
  current_party: "",
  current_constituency: "",
  current_county: "",
  current_organization: "",
  level: "",
  bio: "",
  image_url: "",
  contact_email: "",
  phone: "",
  official_website: "",
  is_active: true,
};

const emptyRole: RoleForm = {
  position_id: "",
  title: "",
  institution_id: "",
  organization: "",
  party_id: "",
  party_name: "",
  county_id: "",
  province: "",
  constituency_id: "",
  constituency_name: "",
  ward_id: "",
  government_level_id: "",
  level: "national",
  seat_type: "Appointed",
  term_start_date: "",
  term_end_date: "",
  status: "Active",
  entry_type: "",
  official_email: "",
  office_location: "",
  set_as_current: true,
};

const emptyQual: AcademicQualification = {
  degree: "",
  field: "",
  institution: "",
  year: "",
  notes: "",
};

function idStr(v: unknown): string {
  if (v == null || v === "") return "";
  return String(v);
}

function matchIdByName(
  list: RefItem[],
  name?: string | null,
  extraKeys: Array<
    "name" | "title" | "abbreviation" | "short_name" | "code"
  > = [],
): string {
  if (!name?.trim()) return "";
  const n = name.trim().toLowerCase();
  const hit = list.find((item) => {
    const candidates = [
      item.name,
      item.title,
      ...extraKeys.map((k) => item[k as keyof RefItem] as string | null | undefined),
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase());
    return candidates.includes(n) || candidates.some((c) => c === n);
  });
  return hit ? String(hit.id) : "";
}

export default function EditOfficialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [roles, setRoles] = useState<
    Array<LeaderRoleLike & Record<string, unknown>>
  >([]);
  const [qualifications, setQualifications] = useState<AcademicQualification[]>(
    [],
  );
  const [nameTitles, setNameTitles] = useState<string[]>([]);
  const [nationalHonours, setNationalHonours] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [roleForm, setRoleForm] = useState<RoleForm>(emptyRole);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleSaving, setRoleSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  /** True after any personal-details edit until a successful save */
  const [personalDirty, setPersonalDirty] = useState(false);
  const [displayFullName, setDisplayFullName] = useState("");
  const [lookups, setLookups] = useState<Lookups>({
    parties: [],
    counties: [],
    constituencies: [],
    wards: [],
    institutions: [],
    levels: [],
    positions: [],
  });
  const [lookupsError, setLookupsError] = useState<string | null>(null);
  const [showNewPosition, setShowNewPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({
    title: "",
    code: "",
    level: "National",
    description: "",
  });
  const [positionSaving, setPositionSaving] = useState(false);
  const [showNewParty, setShowNewParty] = useState(false);
  const [newParty, setNewParty] = useState({ name: "", abbreviation: "" });
  const [partySaving, setPartySaving] = useState(false);
  const [showNewConstituency, setShowNewConstituency] = useState(false);
  const [newConstituency, setNewConstituency] = useState({
    name: "",
    county_id: "",
    is_active: false,
  });
  const [constSaving, setConstSaving] = useState(false);
  const [orgSearch, setOrgSearch] = useState("");
  const [orgResults, setOrgResults] = useState<RefItem[]>([]);
  const [orgSearching, setOrgSearching] = useState(false);
  const [orgSearchOpen, setOrgSearchOpen] = useState(false);
  /** Current-snapshot organisation search (full catalogue, not truncated dropdown) */
  const [snapOrgSearch, setSnapOrgSearch] = useState("");
  const [snapOrgResults, setSnapOrgResults] = useState<RefItem[]>([]);
  /** Full list loaded once for Current snapshot browse + client filter */
  const [snapOrgCatalogue, setSnapOrgCatalogue] = useState<RefItem[] | null>(
    null,
  );
  const [snapOrgSearching, setSnapOrgSearching] = useState(false);
  const [snapOrgSearchOpen, setSnapOrgSearchOpen] = useState(false);
  const [snapOrgSelectedId, setSnapOrgSelectedId] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const loadLookups = useCallback(async (countyId?: string, constituencyId?: string) => {
    try {
      const params = new URLSearchParams();
      if (countyId) params.set("county_id", countyId);
      if (constituencyId) params.set("constituency_id", constituencyId);
      const res = await fetch(
        `/api/admin/leaders/lookups?${params.toString()}`,
        { credentials: "include", cache: "no-store" },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load reference data");
      setLookups((prev) => ({
        parties: json.parties || prev.parties,
        counties: json.counties || prev.counties,
        constituencies: json.constituencies || prev.constituencies,
        wards: json.wards || prev.wards,
        institutions: json.institutions || prev.institutions,
        levels: json.levels || prev.levels,
        positions: json.positions || prev.positions,
      }));
      setLookupsError(null);
    } catch (e) {
      setLookupsError(
        e instanceof Error ? e.message : "Could not load reference lists",
      );
    }
  }, []);

  /** Load every institution (paged) for Current snapshot browse */
  const loadSnapOrgCatalogue = useCallback(async () => {
    if (snapOrgCatalogue && snapOrgCatalogue.length > 0) {
      return snapOrgCatalogue;
    }
    setSnapOrgSearching(true);
    try {
      const all: RefItem[] = [];
      const PAGE = 1000;
      let offset = 0;
      for (let i = 0; i < 20; i++) {
        const params = new URLSearchParams();
        params.set("only", "institutions");
        params.set("limit", String(PAGE));
        params.set("offset", String(offset));
        // Admin: include unpublished institutions too
        const res = await fetch(
          `/api/admin/leaders/lookups?${params.toString()}`,
          { credentials: "include", cache: "no-store" },
        );
        const json = await res.json();
        if (!res.ok) break;
        const batch = (json.institutions as RefItem[]) || [];
        all.push(...batch);
        const total =
          typeof json.institutions_total === "number"
            ? json.institutions_total
            : all.length;
        if (batch.length < PAGE || all.length >= total) break;
        offset += batch.length;
      }
      setSnapOrgCatalogue(all);
      return all;
    } catch {
      return snapOrgCatalogue || [];
    } finally {
      setSnapOrgSearching(false);
    }
  }, [snapOrgCatalogue]);

  /** Search institutions by name (full catalogue). */
  const searchInstitutions = useCallback(
    async (query: string, target: "role" | "snap" = "role") => {
      const q = query.trim();
      if (target === "snap") {
        const catalogue = await loadSnapOrgCatalogue();
        if (!q) {
          setSnapOrgResults(catalogue);
          return;
        }
        const lower = q.toLowerCase();
        setSnapOrgResults(
          catalogue.filter((i) => {
            const hay = [
              i.name,
              i.short_name,
              i.slug,
              i.institution_type,
              (i as { official_name?: string }).official_name,
            ]
              .filter(Boolean)
              .map((s) => String(s).toLowerCase());
            return hay.some((s) => s.includes(lower));
          }),
        );
        return;
      }

      // Role form: server search (higher limit)
      if (q.length < 1) {
        setOrgResults([]);
        return;
      }
      setOrgSearching(true);
      try {
        const params = new URLSearchParams();
        params.set("only", "institutions");
        params.set("q", q);
        params.set("limit", "300");
        const res = await fetch(
          `/api/admin/leaders/lookups?${params.toString()}`,
          { credentials: "include", cache: "no-store" },
        );
        const json = await res.json();
        if (res.ok) {
          setOrgResults((json.institutions as RefItem[]) || []);
        } else {
          setOrgResults([]);
        }
      } catch {
        setOrgResults([]);
      } finally {
        setOrgSearching(false);
      }
    },
    [loadSnapOrgCatalogue],
  );

  // Debounce organisation search (role form)
  useEffect(() => {
    if (!showRoleForm) return;
    const t = setTimeout(() => {
      if (orgSearch.trim().length >= 1) {
        searchInstitutions(orgSearch, "role");
      } else {
        setOrgResults([]);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [orgSearch, showRoleForm, searchInstitutions]);

  // Debounce organisation filter (current snapshot — uses full catalogue)
  useEffect(() => {
    if (!snapOrgSearchOpen) return;
    if (snapOrgSelectedId && snapOrgSearch === form.current_organization) {
      return;
    }
    const t = setTimeout(() => {
      void searchInstitutions(snapOrgSearch, "snap");
    }, 200);
    return () => clearTimeout(t);
  }, [
    snapOrgSearch,
    snapOrgSearchOpen,
    snapOrgSelectedId,
    form.current_organization,
    searchInstitutions,
  ]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  // Cascade: when county changes on role form, reload constituencies
  useEffect(() => {
    if (!showRoleForm) return;
    loadLookups(roleForm.county_id || undefined, roleForm.constituency_id || undefined);
  }, [roleForm.county_id, roleForm.constituency_id, showRoleForm, loadLookups]);

  const loadLeader = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leaders/${id}`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Not found");
      const d = json.data;
      setForm({
        first_name: d.first_name || "",
        other_names: d.other_names || "",
        surname: d.surname || "",
        slug: d.slug || "",
        title: d.title || "",
        current_party: d.current_party || "",
        current_constituency: d.current_constituency || "",
        current_county: d.current_county || "",
        current_organization: d.current_organization || "",
        level: d.level
          ? normalizeLeaderLevel(String(d.level), d.title)
          : "",
        bio: d.bio || "",
        image_url: d.image_url || "",
        contact_email: d.contact_email || "",
        phone: d.phone || "",
        official_website: d.official_website || "",
        is_active: d.is_active !== false,
      });
      setDisplayFullName(d.full_name || "");
      setNameTitles(parseNameTitles(d.name_titles ?? d.honorifics));
      setNationalHonours(
        parseNationalHonours(d.national_honours ?? d.awards),
      );
      setSocialLinks(parseSocialLinks(d.social_media));
      setSnapOrgSearch(d.current_organization || "");
      setSnapOrgSelectedId("");
      setSnapOrgResults([]);
      setSnapOrgSearchOpen(false);
      const roleList = Array.isArray(d.leader_roles) ? d.leader_roles : [];
      setRoles(
        [...roleList].sort((a, b) =>
          String(b.term_start_date || "").localeCompare(
            String(a.term_start_date || ""),
          ),
        ),
      );

      let quals: AcademicQualification[] = [];
      if (Array.isArray(d.academic_qualifications)) {
        quals = d.academic_qualifications;
      } else if (typeof d.academic_qualifications === "string") {
        try {
          const p = JSON.parse(d.academic_qualifications);
          if (Array.isArray(p)) quals = p;
        } catch {
          /* ignore */
        }
      } else if (typeof d.education === "string" && d.education.trim()) {
        try {
          const p = JSON.parse(d.education);
          if (Array.isArray(p)) quals = p;
          else
            quals = d.education
              .split(/\n/)
              .filter(Boolean)
              .map((line: string) => ({ degree: line.trim() }));
        } catch {
          quals = d.education
            .split(/\n/)
            .filter(Boolean)
            .map((line: string) => ({ degree: line.trim() }));
        }
      }
      const nextQuals = quals.length ? quals : [];
      setQualifications(nextQuals);
      setPersonalDirty(false);
      setSaved(false);
      setSuccessMessage(null);
      setWarnings([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLeader();
  }, [loadLeader]);

  const setField = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => {
      let nextVal: string | boolean = value;
      // leaders.level enum is national|county|ward (never "National")
      if (key === "level" && typeof value === "string") {
        nextVal = value ? normalizeLeaderLevel(value, prev.title) : "";
      }
      return { ...prev, [key]: nextVal };
    });
    setPersonalDirty(true);
    setSaved(false);
    setSuccessMessage(null);
    setError(null);
  };

  const markPersonalDirty = () => {
    setPersonalDirty(true);
    setSaved(false);
    setSuccessMessage(null);
    setError(null);
  };

  const positionLabel = (p: RefItem) =>
    p.title || p.name || p.code || String(p.id);

  const partyLabel = (p: RefItem) =>
    p.abbreviation
      ? `${p.name || p.abbreviation} (${p.abbreviation})`
      : p.name || String(p.id);

  const instLabel = (i: RefItem) =>
    i.short_name ? `${i.name} (${i.short_name})` : i.name || String(i.id);

  const visibility = useMemo(
    () => fieldsForPosition(roleForm.title || roleForm.position_id),
    [roleForm.title, roleForm.position_id],
  );

  const geoReqs = useMemo(
    () =>
      geographicRequirementsForTerm(
        {
          countyRequired: visibility.countyRequired,
          constituencyRequired: visibility.constituencyRequired,
        },
        roleForm.term_start_date,
      ),
    [
      visibility.countyRequired,
      visibility.constituencyRequired,
      roleForm.term_start_date,
    ],
  );

  const handlePositionSelect = (positionId: string) => {
    const pos = lookups.positions.find((p) => String(p.id) === positionId);
    const title = pos ? positionLabel(pos) : "";
    const level = normalizeLeaderLevel(
      pos?.level ? String(pos.level) : null,
      title,
    );
    const seat_type = normalizeSeatType(null, null, title);
    setRoleForm((prev) => ({
      ...prev,
      position_id: positionId,
      title: title || prev.title,
      level,
      seat_type,
      government_level_id: pos?.level
        ? matchIdByName(lookups.levels, String(pos.level))
        : prev.government_level_id,
    }));
  };

  const createNewPosition = async () => {
    const title = newPosition.title.trim();
    if (!title) {
      setError("Enter a position title to add (e.g. Chief of Staff)");
      return;
    }
    setPositionSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/positions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          code: newPosition.code.trim() || undefined,
          level: newPosition.level || "National",
          description: newPosition.description.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          [json.error, json.hint].filter(Boolean).join(" — ") ||
            "Failed to create position",
        );
      }
      const created = json.data as RefItem;
      // Refresh full position list + select new one
      await loadLookups(
        roleForm.county_id || undefined,
        roleForm.constituency_id || undefined,
      );
      setLookups((prev) => {
        const exists = prev.positions.some(
          (p) => String(p.id) === String(created.id),
        );
        const positions = exists
          ? prev.positions
          : [...prev.positions, created].sort((a, b) =>
              positionLabel(a).localeCompare(positionLabel(b)),
            );
        return { ...prev, positions };
      });
      handlePositionSelect(String(created.id));
      // Ensure title is the new position title even before lookups refresh
      setRoleForm((prev) => ({
        ...prev,
        position_id: String(created.id),
        title: created.title || created.name || title,
        level: normalizeLeaderLevel(
          created.level ? String(created.level) : newPosition.level,
          title,
        ),
        seat_type: normalizeSeatType(null, null, title),
      }));
      setNewPosition({ title: "", code: "", level: "National", description: "" });
      setShowNewPosition(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create position");
    } finally {
      setPositionSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!personalDirty) {
      setError(null);
      setSuccessMessage("No changes to save — edit a field first.");
      return;
    }
    if (!form.first_name.trim() || !form.surname.trim()) {
      setError("First name and surname are required.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    setSuccessMessage(null);
    setWarnings([]);
    try {
      // level must be enum national|county|ward (never "National")
      const levelNorm = form.level.trim()
        ? normalizeLeaderLevel(form.level, form.title)
        : null;

      const payload: Record<string, unknown> = {
        first_name: form.first_name.trim(),
        other_names: form.other_names.trim() || null,
        surname: form.surname.trim(),
        slug: form.slug.trim() || null,
        title: form.title.trim() || null,
        current_party: form.current_party.trim() || null,
        current_constituency: form.current_constituency.trim() || null,
        current_county: form.current_county.trim() || null,
        current_organization: form.current_organization.trim() || null,
        level: levelNorm,
        bio: form.bio.trim() || null,
        image_url: form.image_url.trim() || null,
        contact_email: form.contact_email.trim() || null,
        phone: form.phone.trim() || null,
        official_website: form.official_website.trim() || null,
        is_active: form.is_active,
        name_titles: nameTitles,
        national_honours: nationalHonours,
        social_media: socialLinks.filter((l) => l.platform && l.url.trim()),
        academic_qualifications: qualifications
          .filter((q) => q.degree || q.institution)
          .map((q) => ({
            degree: q.degree || undefined,
            field: q.field || undefined,
            institution: q.institution || undefined,
            year: q.year || undefined,
            notes: q.notes || undefined,
          })),
      };

      const res = await fetch(`/api/admin/leaders/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let json: Record<string, unknown> = {};
      try {
        json = await res.json();
      } catch {
        throw new Error(
          res.ok
            ? "Saved but response was not JSON"
            : `Save failed (HTTP ${res.status})`,
        );
      }
      if (!res.ok) {
        throw new Error(
          [json.error, json.hint].filter(Boolean).join(" — ") ||
            `Update failed (HTTP ${res.status})`,
        );
      }

      // Reload from DB so UI matches server and dirty flag clears cleanly
      setPersonalDirty(false);
      setSaved(true);
      setSuccessMessage(
        form.is_active
          ? "Personal details saved successfully (including organisation snapshot)."
          : "Personal details saved. Profile is inactive (not listed publicly).",
      );
      if (Array.isArray(json.warnings) && json.warnings.length) {
        setWarnings(json.warnings.map(String));
      }
      if (Array.isArray(json.dropped) && (json.dropped as string[]).length) {
        setWarnings((w) => [
          ...w,
          `Saved without optional columns: ${(json.dropped as string[]).join(", ")}.`,
        ]);
      }
      // Refresh form from server (keeps personalDirty false)
      await loadLeader();
      setPersonalDirty(false);
      setSaved(true);
      setSuccessMessage(
        form.is_active
          ? "Personal details saved successfully (including organisation snapshot)."
          : "Personal details saved. Profile is inactive (not listed publicly).",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
      setSuccessMessage(null);
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  const openNewRole = () => {
    setEditingRoleId(null);
    setRoleForm(emptyRole);
    setOrgSearch("");
    setOrgResults([]);
    setOrgSearchOpen(false);
    setShowRoleForm(true);
  };

  const openEditRole = (role: LeaderRoleLike & Record<string, unknown>) => {
    setEditingRoleId(role.id || null);
    const title = role.title || "";
    const roleLevel = (role as { level?: string }).level || "";
    const roleSeat = (role as { seat_type?: string }).seat_type || "";
    setRoleForm({
      position_id:
        idStr(role.position_id) ||
        matchIdByName(lookups.positions, title, ["title", "code"]),
      title,
      institution_id:
        idStr(role.institution_id) ||
        matchIdByName(lookups.institutions, role.organization, [
          "short_name",
          "name",
        ]),
      organization: role.organization || "",
      party_id:
        idStr(role.party_id) ||
        matchIdByName(lookups.parties, role.party, [
          "abbreviation",
          "code",
          "name",
        ]),
      party_name: "",
      county_id:
        idStr(role.county_id) ||
        matchIdByName(lookups.counties, role.county, ["code", "name"]),
      province: "",
      constituency_id:
        idStr(role.constituency_id) ||
        matchIdByName(lookups.constituencies, role.constituency, [
          "code",
          "name",
        ]),
      constituency_name: "",
      ward_id:
        idStr(role.ward_id) ||
        matchIdByName(lookups.wards, role.ward, ["code", "name"]),
      government_level_id:
        idStr(role.government_level_id) ||
        matchIdByName(lookups.levels, roleLevel, ["code", "name"]),
      level: normalizeLeaderLevel(roleLevel, title),
      seat_type: normalizeSeatType(roleSeat, role.entry_type, title),
      term_start_date: role.term_start_date
        ? String(role.term_start_date).slice(0, 10)
        : "",
      term_end_date: role.term_end_date
        ? String(role.term_end_date).slice(0, 10)
        : "",
      status: normalizeRoleStatus(role.status, role.term_end_date),
      entry_type: role.entry_type || "",
      official_email: role.official_email || "",
      office_location: role.office_location || "",
      set_as_current:
        !role.term_end_date ||
        String(role.status || "").toLowerCase() === "active",
    });
    // After setRoleForm base, fill free-text fallbacks for unmatched refs
    setRoleForm((prev) => {
      const partyId = prev.party_id;
      const countyId = prev.county_id;
      const constId = prev.constituency_id;
      const countyText = role.county || "";
      const isProvince =
        !countyId &&
        FORMER_PROVINCES.some(
          (p) => p.toLowerCase() === String(countyText).toLowerCase(),
        );
      return {
        ...prev,
        party_name: !partyId && role.party ? String(role.party) : "",
        province: isProvince ? String(countyText) : "",
        constituency_name:
          !constId && role.constituency ? String(role.constituency) : "",
      };
    });
    setOrgSearch(role.organization || "");
    setOrgResults([]);
    setOrgSearchOpen(false);
    setShowNewParty(false);
    setShowNewConstituency(false);
    setShowRoleForm(true);
  };

  const createParty = async (): Promise<string | null> => {
    const name = newParty.name.trim();
    if (!name) {
      setError("Enter a party name to add");
      return null;
    }
    setPartySaving(true);
    try {
      const res = await fetch("/api/admin/parties", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          abbreviation: newParty.abbreviation.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create party");
      }
      const created = json.data as RefItem;
      setLookups((prev) => {
        const exists = prev.parties.some(
          (p) => String(p.id) === String(created.id),
        );
        const parties = exists
          ? prev.parties
          : [...prev.parties, created].sort((a, b) =>
              partyLabel(a).localeCompare(partyLabel(b)),
            );
        return { ...prev, parties };
      });
      setRoleForm((prev) => ({
        ...prev,
        party_id: String(created.id),
        party_name: "",
      }));
      setNewParty({ name: "", abbreviation: "" });
      setShowNewParty(false);
      return String(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create party");
      return null;
    } finally {
      setPartySaving(false);
    }
  };

  const createConstituency = async (): Promise<string | null> => {
    const name = newConstituency.name.trim();
    if (!name) {
      setError("Enter a constituency name (e.g. Eldoret North)");
      return null;
    }
    const county_id =
      newConstituency.county_id.trim() || roleForm.county_id.trim();
    if (!county_id) {
      setError(
        "Select the modern county that covers this former seat (e.g. Uasin Gishu for Eldoret North). The database requires a county link.",
      );
      return null;
    }
    setConstSaving(true);
    try {
      const res = await fetch("/api/admin/constituencies", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          county_id,
          is_active: newConstituency.is_active,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          [json.error, json.hint].filter(Boolean).join(" — ") ||
            "Failed to create constituency",
        );
      }
      const created = json.data as RefItem;
      setLookups((prev) => {
        const exists = prev.constituencies.some(
          (c) => String(c.id) === String(created.id),
        );
        const constituencies = exists
          ? prev.constituencies
          : [...prev.constituencies, created].sort((a, b) =>
              String(a.name || "").localeCompare(String(b.name || "")),
            );
        return { ...prev, constituencies };
      });
      setRoleForm((prev) => ({
        ...prev,
        constituency_id: String(created.id),
        constituency_name: "",
        county_id: prev.county_id || String(created.county_id || county_id),
      }));
      setNewConstituency({ name: "", county_id: "", is_active: false });
      setShowNewConstituency(false);
      return String(created.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create constituency",
      );
      return null;
    } finally {
      setConstSaving(false);
    }
  };

  const saveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.title.trim() && !roleForm.position_id) {
      setError("Select a position from the list (or enter a title)");
      return;
    }
    const vis = fieldsForPosition(roleForm.title);
    const geo = geographicRequirementsForTerm(
      {
        countyRequired: vis.countyRequired,
        constituencyRequired: vis.constituencyRequired,
      },
      roleForm.term_start_date,
    );

    let partyId = roleForm.party_id;
    if (vis.partyRequired && !partyId && !roleForm.party_name.trim()) {
      setError(
        "Party is required — select one or use “Add party” to create it in the database.",
      );
      return;
    }
    // Create party on the fly if free-text name provided without id
    if (!partyId && roleForm.party_name.trim() && vis.showParty) {
      setNewParty({
        name: roleForm.party_name.trim(),
        abbreviation: "",
      });
      // inline create
      setPartySaving(true);
      try {
        const res = await fetch("/api/admin/parties", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: roleForm.party_name.trim() }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create party");
        partyId = String(json.data.id);
        setLookups((prev) => {
          const created = json.data as RefItem;
          const exists = prev.parties.some(
            (p) => String(p.id) === String(created.id),
          );
          return {
            ...prev,
            parties: exists
              ? prev.parties
              : [...prev.parties, created].sort((a, b) =>
                  partyLabel(a).localeCompare(partyLabel(b)),
                ),
          };
        });
        setRoleForm((prev) => ({
          ...prev,
          party_id: partyId,
          party_name: "",
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create party");
        setPartySaving(false);
        return;
      }
      setPartySaving(false);
    }

    const hasConst =
      Boolean(roleForm.constituency_id) ||
      Boolean(roleForm.constituency_name.trim());
    if (geo.constituencyRequired && !hasConst) {
      setError(
        "Constituency is required — select one, add a former constituency, or type the historical seat name.",
      );
      return;
    }
    if (
      geo.countyRequired &&
      !roleForm.county_id &&
      !roleForm.province
    ) {
      setError("County is required for this position (post-2013 seats).");
      return;
    }
    if (vis.organizationRequired && !roleForm.institution_id && !roleForm.organization) {
      setError("Organisation is required for this type of position");
      return;
    }
    if (!roleForm.term_start_date) {
      setError("Start date is required so we can track when this position began");
      return;
    }

    setRoleSaving(true);
    setError(null);
    try {
      // Free-text geography for pre-devolution / former seats
      const partyText =
        roleForm.party_name.trim() ||
        (partyId
          ? partyLabel(
              lookups.parties.find((p) => String(p.id) === partyId) || {
                id: partyId,
                name: "",
              },
            )
          : null);
      const countyText = roleForm.county_id
        ? lookups.counties.find((c) => String(c.id) === roleForm.county_id)
            ?.name || null
        : roleForm.province.trim() || null;
      const constText =
        roleForm.constituency_name.trim() ||
        (roleForm.constituency_id
          ? lookups.constituencies.find(
              (c) => String(c.id) === roleForm.constituency_id,
            )?.name || null
          : null);

      const body: Record<string, unknown> = {
        // position_id from positions table is integer — API resolves title only
        position_id: roleForm.position_id || null,
        title: roleForm.title.trim(),
        institution_id: roleForm.institution_id || null,
        organization: roleForm.organization.trim() || null,
        party_id: vis.showParty ? partyId || null : null,
        party: vis.showParty ? partyText : null,
        county_id: roleForm.county_id || null,
        county: countyText,
        constituency_id: roleForm.constituency_id || null,
        constituency: constText,
        ward_id: vis.showWard ? roleForm.ward_id || null : null,
        // level must be DB enum: national | county | ward
        level: normalizeLeaderLevel(roleForm.level, roleForm.title),
        seat_type: normalizeSeatType(
          roleForm.seat_type,
          roleForm.entry_type,
          roleForm.title,
        ),
        term_start_date: roleForm.term_start_date || null,
        term_end_date: roleForm.term_end_date || null,
        // status: Active | Former | Suspended (not "Ended")
        status: normalizeRoleStatus(
          roleForm.status,
          roleForm.term_end_date || null,
        ),
        entry_type: roleForm.entry_type.trim() || null,
        official_email: roleForm.official_email.trim() || null,
        office_location: roleForm.office_location.trim() || null,
        set_as_current: roleForm.set_as_current,
      };

      // Clear inapplicable fields for consistency
      if (!vis.showParty) {
        body.party_id = null;
        body.party = null;
      }
      if (!vis.showConstituency && !roleForm.constituency_name) {
        body.constituency_id = null;
        if (!constText) body.constituency = null;
      }
      if (!vis.showWard) body.ward_id = null;
      if (
        !vis.showCounty &&
        !geo.showProvince &&
        !roleForm.county_id &&
        !roleForm.province
      ) {
        body.county_id = null;
        if (!countyText) body.county = null;
      }

      const url = editingRoleId
        ? `/api/admin/leaders/${id}/roles/${editingRoleId}`
        : `/api/admin/leaders/${id}/roles`;
      const res = await fetch(url, {
        method: editingRoleId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          [json.error, json.hint].filter(Boolean).join(" — ") ||
            "Failed to save position",
        );
      }

      const wasEdit = Boolean(editingRoleId);
      setShowRoleForm(false);
      setEditingRoleId(null);
      setRoleForm(emptyRole);
      await loadLeader();
      setSaved(true);
      setSuccessMessage(
        wasEdit
          ? "Position updated successfully."
          : "Position saved successfully.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save position");
      setSuccessMessage(null);
    } finally {
      setRoleSaving(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    if (
      !confirm(
        "Remove this position record? Historical tracking will lose this entry.",
      )
    ) {
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/admin/leaders/${id}/roles/${roleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      await loadLeader();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete position");
    }
  };

  const updateQual = (
    index: number,
    key: keyof AcademicQualification,
    value: string,
  ) => {
    setQualifications((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
    markPersonalDirty();
  };

  // Snapshot field helpers: pick from DB then store denormalized name on leaders row
  const snapshotPartyId = matchIdByName(
    lookups.parties,
    form.current_party,
    ["abbreviation", "code", "name"],
  );
  const snapshotCountyId = matchIdByName(lookups.counties, form.current_county, [
    "code",
    "name",
  ]);
  const snapshotConstId = matchIdByName(
    lookups.constituencies,
    form.current_constituency,
    ["code", "name"],
  );
  const snapshotPositionId = matchIdByName(lookups.positions, form.title, [
    "title",
    "code",
  ]);

  if (loading) {
    return (
      <div className="govuk-width-container">
        <p className="govuk-body">Loading official…</p>
      </div>
    );
  }

  const computedName = [form.first_name, form.other_names, form.surname]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="govuk-width-container">
      <Link href={adminPath("officials")} className="govuk-back-link">
        Back to officials
      </Link>

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Edit official</h1>
        <p className="govuk-body">
          Correct personal details and record every position with{" "}
          <strong>from–to dates</strong>. Party, county, constituency, level and
          organisation are chosen from the database so names stay consistent.
          Leave party blank for non-political offices (judiciary, principal
          secretaries, etc.).
        </p>
        {(displayFullName || computedName) && (
          <p className="govuk-body">
            <strong>Public name:</strong>{" "}
            {displayNameWithTitles({
              first_name: form.first_name,
              other_names: form.other_names,
              surname: form.surname,
              full_name: displayFullName,
              name_titles: nameTitles,
              national_honours: nationalHonours,
            })}
            {form.slug && (
              <>
                {" "}
                · URL:{" "}
                <code>/government/people/{form.slug}</code>
              </>
            )}
          </p>
        )}

        {lookupsError && (
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              Reference lists: {lookupsError}. Dropdowns may be empty until
              parties, counties, institutions and positions are available in
              Supabase.
            </strong>
          </div>
        )}

        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">Save failed</h2>
            <p className="govuk-body">{error}</p>
          </div>
        )}

        {(saved || successMessage) && (
          <div
            className="govuk-notification-banner govuk-notification-banner--success"
            role="status"
          >
            <div className="govuk-notification-banner__header">
              <h2 className="govuk-notification-banner__title">Success</h2>
            </div>
            <div className="govuk-notification-banner__content">
              <p className="govuk-notification-banner__heading">
                {successMessage || "Saved"}
              </p>
              <p className="govuk-body">
                Changes are in the database.{" "}
                {form.slug && (
                  <Link
                    href={`/government/people/${form.slug}`}
                    className="govuk-link"
                    target="_blank"
                  >
                    View public profile
                  </Link>
                )}
              </p>
            </div>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning</span>
              {warnings.join(" ")}
            </strong>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h2 className="govuk-heading-m">Name</h2>
          <fieldset className="govuk-fieldset govuk-!-margin-bottom-4">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
              Titles / honorifics (optional)
            </legend>
            <div className="govuk-hint">
              Select all that apply (e.g. Hon. and Prof.). Shown on the public
              page before the name. Not included in the URL slug.
            </div>
            <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))",
                  gap: "0.25rem 1rem",
                }}
              >
                {NAME_TITLE_OPTIONS.map((opt) => {
                  const checked = nameTitles.includes(opt.value);
                  return (
                    <div className="govuk-checkboxes__item" key={opt.value}>
                      <input
                        className="govuk-checkboxes__input"
                        id={`title-${opt.value}`}
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setNameTitles((prev) =>
                            checked
                              ? prev.filter((t) => t !== opt.value)
                              : [...prev, opt.value],
                          );
                          markPersonalDirty();
                        }}
                      />
                      <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor={`title-${opt.value}`}
                      >
                        {opt.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            {nameTitles.length > 0 && (
              <p className="govuk-body-s govuk-!-margin-top-2">
                Titles before name:{" "}
                <strong>
                  {nameTitles.join(" ")} {computedName || "…"}
                </strong>
              </p>
            )}
          </fieldset>

          <fieldset className="govuk-fieldset govuk-!-margin-bottom-4">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
              National honours &amp; awards (optional)
            </legend>
            <div className="govuk-hint">
              Kenyan orders and decorations appear{" "}
              <strong>after</strong> the name (e.g. Hon. Jane Doe, E.G.H.,
              O.G.W.). Select all that apply, highest first is automatic.
            </div>
            <div
              className="govuk-checkboxes govuk-checkboxes--small"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))",
                gap: "0.25rem 1rem",
              }}
            >
              {NATIONAL_HONOUR_OPTIONS.map((opt) => {
                const checked = nationalHonours.includes(opt.value);
                return (
                  <div className="govuk-checkboxes__item" key={opt.value}>
                    <input
                      className="govuk-checkboxes__input"
                      id={`honour-${opt.value}`}
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setNationalHonours((prev) =>
                          checked
                            ? prev.filter((h) => h !== opt.value)
                            : [...prev, opt.value],
                        );
                        markPersonalDirty();
                      }}
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor={`honour-${opt.value}`}
                    >
                      {opt.label}
                    </label>
                  </div>
                );
              })}
            </div>
            {nationalHonours.length > 0 && (
              <p className="govuk-body-s govuk-!-margin-top-2">
                Full public name:{" "}
                <strong>
                  {[nameTitles.join(" "), computedName || "…"]
                    .filter(Boolean)
                    .join(" ")}
                  , {formatNationalHonoursSuffix(nationalHonours)}
                </strong>
              </p>
            )}
          </fieldset>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="first_name">
                  First name *
                </label>
                <input
                  id="first_name"
                  className="govuk-input"
                  value={form.first_name}
                  onChange={(e) => setField("first_name", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="other_names">
                  Other names
                </label>
                <input
                  id="other_names"
                  className="govuk-input"
                  value={form.other_names}
                  onChange={(e) => setField("other_names", e.target.value)}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="surname">
                  Surname *
                </label>
                <input
                  id="surname"
                  className="govuk-input"
                  value={form.surname}
                  onChange={(e) => setField("surname", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="slug">
              URL slug *
            </label>
            <div className="govuk-hint">
              No titles — e.g. shakila-abdalla-mohamed (not
              hon-shakila-abdalla-mohamed)
            </div>
            <input
              id="slug"
              className="govuk-input"
              value={form.slug}
              onChange={(e) => setField("slug", e.target.value)}
              required
            />
          </div>

          <h2 className="govuk-heading-m">Current snapshot</h2>
          <p className="govuk-hint">
            Quick fields for list pages. Prefer saving an Active position below
            with dates — that can refresh these automatically. Values come from
            the same reference tables.
          </p>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="snap_position">
              Current title / position
            </label>
            <select
              id="snap_position"
              className="govuk-select"
              value={snapshotPositionId}
              onChange={(e) => {
                const pos = lookups.positions.find(
                  (p) => String(p.id) === e.target.value,
                );
                setField("title", pos ? positionLabel(pos) : "");
                if (pos?.level) setField("level", String(pos.level));
              }}
            >
              <option value="">— Select position —</option>
              {lookups.positions.map((p) => (
                <option key={String(p.id)} value={String(p.id)}>
                  {positionLabel(p)}
                  {p.level ? ` (${p.level})` : ""}
                </option>
              ))}
            </select>
            {form.title && !snapshotPositionId && (
              <p className="govuk-hint">
                Current text (not in list): {form.title}
              </p>
            )}
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="snap_party">
                  Party
                </label>
                <select
                  id="snap_party"
                  className="govuk-select"
                  value={snapshotPartyId}
                  onChange={(e) => {
                    const p = lookups.parties.find(
                      (x) => String(x.id) === e.target.value,
                    );
                    setField(
                      "current_party",
                      p
                        ? p.abbreviation || p.name || ""
                        : "",
                    );
                  }}
                >
                  <option value="">— Not applicable / none —</option>
                  {lookups.parties.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>
                      {partyLabel(p)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="snap_level">
                  Level
                </label>
                <select
                  id="snap_level"
                  className="govuk-select"
                  value={
                    form.level
                      ? normalizeLeaderLevel(form.level, form.title)
                      : ""
                  }
                  onChange={(e) => {
                    // DB enum is lowercase national|county|ward only
                    setField("level", e.target.value);
                  }}
                >
                  <option value="">— Select level —</option>
                  {LEADER_LEVELS.map((lv) => (
                    <option key={lv} value={lv}>
                      {lv.charAt(0).toUpperCase() + lv.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="snap_county">
                  County
                </label>
                <select
                  id="snap_county"
                  className="govuk-select"
                  value={snapshotCountyId}
                  onChange={(e) => {
                    const c = lookups.counties.find(
                      (x) => String(x.id) === e.target.value,
                    );
                    setField("current_county", c?.name || "");
                    // Reload constituencies for that county
                    if (e.target.value) loadLookups(e.target.value);
                  }}
                >
                  <option value="">— Not applicable / none —</option>
                  {lookups.counties.map((c) => (
                    <option key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="snap_const">
                  Constituency
                </label>
                <select
                  id="snap_const"
                  className="govuk-select"
                  value={snapshotConstId}
                  onChange={(e) => {
                    const c = lookups.constituencies.find(
                      (x) => String(x.id) === e.target.value,
                    );
                    setField("current_constituency", c?.name || "");
                    if (c?.county_id) {
                      const county = lookups.counties.find(
                        (x) => String(x.id) === String(c.county_id),
                      );
                      if (county?.name) setField("current_county", county.name);
                    }
                  }}
                >
                  <option value="">— Not applicable / none —</option>
                  {lookups.constituencies
                    .filter(
                      (c) =>
                        !snapshotCountyId ||
                        String(c.county_id) === snapshotCountyId,
                    )
                    .map((c) => (
                      <option key={String(c.id)} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="snap_org_search">
              Organisation
            </label>
            <div className="govuk-hint">
              Focus the field to load every institution, or type to filter. All
              bodies in the catalogue are available (not a short dropdown).
            </div>
            <input
              id="snap_org_search"
              className="govuk-input"
              type="search"
              autoComplete="off"
              placeholder="Click or type to list all organisations…"
              value={snapOrgSearch}
              onChange={(e) => {
                const v = e.target.value;
                setSnapOrgSearch(v);
                setSnapOrgSearchOpen(true);
                setSnapOrgSelectedId("");
                setField("current_organization", v);
              }}
              onFocus={() => {
                setSnapOrgSearchOpen(true);
                void loadSnapOrgCatalogue().then((all) => {
                  if (!snapOrgSearch.trim()) setSnapOrgResults(all);
                });
              }}
            />
            {snapOrgSearching && (
              <p className="govuk-hint govuk-!-margin-top-1">
                Loading institutions…
              </p>
            )}
            {snapOrgSearchOpen && snapOrgResults.length > 0 && (
              <ul
                className="govuk-list"
                style={{
                  maxHeight: 320,
                  overflowY: "auto",
                  border: "1px solid #b1b4b6",
                  background: "#fff",
                  marginTop: 4,
                  padding: 0,
                }}
                role="listbox"
              >
                <li
                  className="govuk-hint"
                  style={{ padding: "6px 12px", margin: 0 }}
                >
                  Showing {snapOrgResults.length.toLocaleString()}
                  {snapOrgCatalogue
                    ? ` of ${snapOrgCatalogue.length.toLocaleString()}`
                    : ""}{" "}
                  institution
                  {snapOrgResults.length === 1 ? "" : "s"}
                  {snapOrgSearch.trim() ? " matching your search" : ""}
                </li>
                {snapOrgResults.map((i) => (
                  <li key={String(i.id)} style={{ margin: 0 }}>
                    <button
                      type="button"
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        border: "none",
                        borderBottom: "1px solid #f3f2f1",
                        background: "transparent",
                        cursor: "pointer",
                        font: "inherit",
                      }}
                      onClick={() => {
                        const name = i.name || i.short_name || "";
                        setSnapOrgSelectedId(String(i.id));
                        setSnapOrgSearch(name);
                        setSnapOrgSearchOpen(false);
                        setSnapOrgResults([]);
                        setField("current_organization", name);
                        if (i.government_level) {
                          setField(
                            "level",
                            normalizeLeaderLevel(
                              String(i.government_level),
                              form.title,
                            ),
                          );
                        }
                      }}
                    >
                      <strong>{i.name}</strong>
                      {i.short_name ? (
                        <span className="govuk-hint"> ({i.short_name})</span>
                      ) : null}
                      {i.institution_type ? (
                        <div className="govuk-hint govuk-!-margin-bottom-0">
                          {i.institution_type}
                          {i.is_active === false ? " · unpublished" : ""}
                        </div>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {snapOrgSearchOpen &&
              !snapOrgSearching &&
              snapOrgResults.length === 0 &&
              !snapOrgSelectedId && (
                <p className="govuk-hint govuk-!-margin-top-1">
                  {snapOrgSearch.trim()
                    ? "No catalogue match. Free text is still saved — create the institution under Admin → Institutions to link it later."
                    : "No institutions loaded. Check admin API access or refresh the page."}
                </p>
              )}
            {(form.current_organization || snapOrgSelectedId) && (
              <p className="govuk-body-s govuk-!-margin-top-2">
                <strong>Selected:</strong>{" "}
                {form.current_organization || snapOrgSearch || "—"}{" "}
                <button
                  type="button"
                  className="govuk-link"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    font: "inherit",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => {
                    setSnapOrgSelectedId("");
                    setSnapOrgSearch("");
                    setSnapOrgResults([]);
                    setField("current_organization", "");
                  }}
                >
                  Clear
                </button>
              </p>
            )}
          </div>

          <h2 className="govuk-heading-m">Biography</h2>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="bio">
              Biography
            </label>
            <textarea
              id="bio"
              className="govuk-textarea"
              rows={6}
              value={form.bio}
              onChange={(e) => setField("bio", e.target.value)}
            />
          </div>

          <h2 className="govuk-heading-m">Academic qualifications</h2>
          {qualifications.map((q, i) => (
            <div
              key={i}
              className="govuk-!-margin-bottom-4"
              style={{
                border: "1px solid #b1b4b6",
                padding: 12,
                background: "#f3f2f1",
              }}
            >
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor={`deg-${i}`}>
                      Degree / award
                    </label>
                    <input
                      id={`deg-${i}`}
                      className="govuk-input"
                      value={q.degree || ""}
                      onChange={(e) => updateQual(i, "degree", e.target.value)}
                    />
                  </div>
                </div>
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor={`field-${i}`}>
                      Field of study
                    </label>
                    <input
                      id={`field-${i}`}
                      className="govuk-input"
                      value={q.field || ""}
                      onChange={(e) => updateQual(i, "field", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor={`inst-${i}`}>
                      Institution
                    </label>
                    <input
                      id={`inst-${i}`}
                      className="govuk-input"
                      value={q.institution || ""}
                      onChange={(e) =>
                        updateQual(i, "institution", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor={`year-${i}`}>
                      Year
                    </label>
                    <input
                      id={`year-${i}`}
                      className="govuk-input"
                      value={q.year != null ? String(q.year) : ""}
                      onChange={(e) => updateQual(i, "year", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={() => {
                  setQualifications((prev) => prev.filter((_, j) => j !== i));
                  markPersonalDirty();
                }}
              >
                Remove qualification
              </button>
            </div>
          ))}
          <button
            type="button"
            className="govuk-button govuk-button--secondary govuk-!-margin-bottom-6"
            onClick={() => {
              setQualifications((prev) => [...prev, { ...emptyQual }]);
              markPersonalDirty();
            }}
          >
            Add qualification
          </button>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="image">
              Image URL
            </label>
            <input
              id="image"
              className="govuk-input"
              value={form.image_url}
              onChange={(e) => setField("image_url", e.target.value)}
            />
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="govuk-input"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setField("contact_email", e.target.value)}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  className="govuk-input"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="web">
                  Official website
                </label>
                <input
                  id="web"
                  className="govuk-input"
                  value={form.official_website}
                  onChange={(e) => setField("official_website", e.target.value)}
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          <h2 className="govuk-heading-m">Social media</h2>
          <p className="govuk-hint">
            Choose the platform, then paste the full profile URL (keeps links
            consistent on the public page).
          </p>
          {socialLinks.map((link, i) => (
            <div
              key={i}
              className="govuk-grid-row govuk-!-margin-bottom-2"
              style={{ alignItems: "end" }}
            >
              <div className="govuk-grid-column-one-third">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor={`soc-plat-${i}`}>
                    Platform
                  </label>
                  <select
                    id={`soc-plat-${i}`}
                    className="govuk-select"
                    value={link.platform}
                    onChange={(e) => {
                      setSocialLinks((prev) => {
                        const next = [...prev];
                        next[i] = { ...next[i], platform: e.target.value };
                        return next;
                      });
                      markPersonalDirty();
                    }}
                  >
                    <option value="">— Select —</option>
                    {SOCIAL_PLATFORM_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor={`soc-url-${i}`}>
                    Profile URL
                  </label>
                  <input
                    id={`soc-url-${i}`}
                    className="govuk-input"
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      setSocialLinks((prev) => {
                        const next = [...prev];
                        next[i] = { ...next[i], url: e.target.value };
                        return next;
                      });
                      markPersonalDirty();
                    }}
                    placeholder="https://x.com/…"
                  />
                </div>
              </div>
              <div className="govuk-grid-column-one-sixth">
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={() => {
                    setSocialLinks((prev) => prev.filter((_, j) => j !== i));
                    markPersonalDirty();
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="govuk-button govuk-button--secondary govuk-!-margin-bottom-6"
            onClick={() => {
              setSocialLinks((prev) => [...prev, { platform: "x", url: "" }]);
              markPersonalDirty();
            }}
          >
            Add social link
          </button>

          <div className="govuk-checkboxes govuk-!-margin-bottom-4">
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id="active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setField("is_active", e.target.checked)}
              />
              <label
                className="govuk-label govuk-checkboxes__label"
                htmlFor="active"
              >
                Active in directory
              </label>
            </div>
          </div>

          <div className="govuk-button-group">
            <button
              type="submit"
              className="govuk-button"
              disabled={saving || !personalDirty}
              aria-disabled={saving || !personalDirty}
            >
              {saving ? "Saving…" : "Save personal details"}
            </button>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => router.push(adminPath("officials"))}
            >
              Cancel
            </button>
            {form.slug && (
              <Link
                href={`/government/people/${form.slug}`}
                className="govuk-link"
                target="_blank"
              >
                Public profile
              </Link>
            )}
          </div>
          {!personalDirty && !saving && (
            <p className="govuk-hint">
              No unsaved changes. Edit a field (e.g. Organisation) to enable
              Save.
            </p>
          )}
          {personalDirty && !saving && (
            <p className="govuk-hint">You have unsaved changes.</p>
          )}
        </form>

        <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />

        <h2 className="govuk-heading-l">Positions held (time-bound)</h2>
        <p className="govuk-body">
          Each row is one office for a period — including the organisation
          attachment. Leave <strong>end date</strong> blank while still serving;
          that is how we determine the most current position. Example: end “MP”
          in 2024 and add “Cabinet Secretary” from 2024 with the ministry as
          organisation.
        </p>

        <button
          type="button"
          className="govuk-button govuk-!-margin-bottom-4"
          onClick={openNewRole}
        >
          Add position
        </button>

        {showRoleForm && (
          <form
            onSubmit={saveRole}
            className="govuk-!-margin-bottom-6"
            style={{
              border: "1px solid #b1b4b6",
              padding: 16,
              background: "#f3f2f1",
            }}
          >
            <h3 className="govuk-heading-m">
              {editingRoleId ? "Edit position" : "New position"}
            </h3>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="role_position">
                Position (from database)
              </label>
              <select
                id="role_position"
                className="govuk-select"
                value={roleForm.position_id}
                onChange={(e) => handlePositionSelect(e.target.value)}
              >
                <option value="">— Select existing position —</option>
                {lookups.positions.map((p) => (
                  <option key={String(p.id)} value={String(p.id)}>
                    {positionLabel(p)}
                    {p.level ? ` · ${p.level}` : ""}
                  </option>
                ))}
              </select>
              <div className="govuk-hint">
                {lookups.positions.length} positions loaded. If the office is
                missing (e.g. Chief of Staff, Head of Finance), add it below —
                it is saved to the database for reuse.
              </div>
              <button
                type="button"
                className="govuk-button govuk-button--secondary govuk-!-margin-top-2"
                onClick={() => {
                  setShowNewPosition((v) => !v);
                  if (!newPosition.title && roleForm.title) {
                    setNewPosition((p) => ({ ...p, title: roleForm.title }));
                  }
                }}
              >
                {showNewPosition
                  ? "Cancel new position"
                  : "Add new position to database"}
              </button>
            </div>

            {showNewPosition && (
              <div
                className="govuk-!-margin-bottom-4"
                style={{
                  border: "1px solid #0b0c0c",
                  padding: 12,
                  background: "#fff",
                }}
              >
                <h4 className="govuk-heading-s">Create position catalogue entry</h4>
                <p className="govuk-body-s">
                  Example offices: Chief of Staff; Principal Administrative
                  Secretary; Secretary, IBEC; Head of Finance; Head, ICT —
                  whatever the institution needs.
                </p>
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="new_pos_title">
                    Position title *
                  </label>
                  <input
                    id="new_pos_title"
                    className="govuk-input"
                    value={newPosition.title}
                    onChange={(e) =>
                      setNewPosition({ ...newPosition, title: e.target.value })
                    }
                    placeholder="e.g. Chief of Staff"
                  />
                </div>
                <div className="govuk-grid-row">
                  <div className="govuk-grid-column-one-half">
                    <div className="govuk-form-group">
                      <label className="govuk-label" htmlFor="new_pos_level">
                        Level
                      </label>
                      <select
                        id="new_pos_level"
                        className="govuk-select"
                        value={newPosition.level}
                        onChange={(e) =>
                          setNewPosition({
                            ...newPosition,
                            level: e.target.value,
                          })
                        }
                      >
                        <option value="National">National</option>
                        <option value="County">County</option>
                        <option value="Independent">Independent</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="govuk-grid-column-one-half">
                    <div className="govuk-form-group">
                      <label className="govuk-label" htmlFor="new_pos_code">
                        Code (optional)
                      </label>
                      <input
                        id="new_pos_code"
                        className="govuk-input"
                        value={newPosition.code}
                        onChange={(e) =>
                          setNewPosition({
                            ...newPosition,
                            code: e.target.value,
                          })
                        }
                        placeholder="Auto from title if blank"
                      />
                    </div>
                  </div>
                </div>
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="new_pos_desc">
                    Description (optional)
                  </label>
                  <input
                    id="new_pos_desc"
                    className="govuk-input"
                    value={newPosition.description}
                    onChange={(e) =>
                      setNewPosition({
                        ...newPosition,
                        description: e.target.value,
                      })
                    }
                    placeholder="e.g. Office of the Deputy President"
                  />
                </div>
                <button
                  type="button"
                  className="govuk-button"
                  disabled={positionSaving}
                  onClick={createNewPosition}
                >
                  {positionSaving
                    ? "Saving position…"
                    : "Save position & use for this role"}
                </button>
              </div>
            )}

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="role_title">
                Title shown publicly *
              </label>
              <div className="govuk-hint">
                Filled from the catalogue when you select or create a position.
                You can still fine-tune the wording.
              </div>
              <input
                id="role_title"
                className="govuk-input"
                value={roleForm.title}
                onChange={(e) =>
                  setRoleForm({ ...roleForm, title: e.target.value })
                }
                required
              />
            </div>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="role_start">
                    From (start date) *
                  </label>
                  <input
                    id="role_start"
                    className="govuk-input"
                    type="date"
                    value={roleForm.term_start_date}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        term_start_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="role_end">
                    To (end date)
                  </label>
                  <div className="govuk-hint">
                    Leave blank if this is still the current post
                  </div>
                  <input
                    id="role_end"
                    className="govuk-input"
                    type="date"
                    value={roleForm.term_end_date}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        term_end_date: e.target.value,
                        status: e.target.value ? "Former" : "Active",
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-quarter">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="role_level">
                    Level *
                  </label>
                  <div className="govuk-hint">national / county / ward</div>
                  <select
                    id="role_level"
                    className="govuk-select"
                    value={roleForm.level}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, level: e.target.value })
                    }
                    required
                  >
                    {LEADER_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="govuk-grid-column-one-quarter">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="role_seat">
                    Seat type *
                  </label>
                  <select
                    id="role_seat"
                    className="govuk-select"
                    value={roleForm.seat_type}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        seat_type: e.target.value,
                        entry_type: e.target.value,
                      })
                    }
                    required
                  >
                    {SEAT_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="govuk-grid-column-one-quarter">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="role_status">
                    Status *
                  </label>
                  <select
                    id="role_status"
                    className="govuk-select"
                    value={roleForm.status}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, status: e.target.value })
                    }
                  >
                    {ROLE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="govuk-grid-column-one-quarter">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="role_entry">
                    Entry note
                  </label>
                  <select
                    id="role_entry"
                    className="govuk-select"
                    value={roleForm.entry_type}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        entry_type: e.target.value,
                        seat_type: normalizeSeatType(
                          e.target.value,
                          e.target.value,
                          roleForm.title,
                        ),
                      })
                    }
                  >
                    <option value="">— Optional —</option>
                    {ENTRY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {visibility.showOrganization && (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="org_search">
                  Organisation / institution
                  {visibility.organizationRequired ? " *" : ""}
                </label>
                <div className="govuk-hint">
                  Time-bound with the dates above (e.g. Ministry of Health while
                  CS). Type to search the full institutions list — the catalogue
                  is large, so search works better than a long dropdown.
                </div>
                <input
                  id="org_search"
                  className="govuk-input"
                  type="search"
                  autoComplete="off"
                  placeholder="Search e.g. Deputy President, Health, Kisii…"
                  value={orgSearch}
                  onChange={(e) => {
                    const v = e.target.value;
                    setOrgSearch(v);
                    setOrgSearchOpen(true);
                    // Typing replaces selection: free text until a catalogue row is picked
                    setRoleForm((prev) => ({
                      ...prev,
                      institution_id: "",
                      organization: v,
                    }));
                  }}
                  onFocus={() => setOrgSearchOpen(true)}
                  required={
                    visibility.organizationRequired &&
                    !roleForm.institution_id &&
                    !roleForm.organization
                  }
                />
                {orgSearching && (
                  <p className="govuk-hint govuk-!-margin-top-1">Searching…</p>
                )}
                {orgSearchOpen && orgResults.length > 0 && (
                  <ul
                    className="govuk-list"
                    style={{
                      maxHeight: 220,
                      overflowY: "auto",
                      border: "1px solid #b1b4b6",
                      background: "#fff",
                      marginTop: 4,
                      padding: 0,
                    }}
                    role="listbox"
                  >
                    {orgResults.map((i) => (
                      <li key={String(i.id)} style={{ margin: 0 }}>
                        <button
                          type="button"
                          className="govuk-link"
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 12px",
                            border: "none",
                            borderBottom: "1px solid #f3f2f1",
                            background: "transparent",
                            cursor: "pointer",
                            font: "inherit",
                          }}
                          onClick={() => {
                            const name = i.name || i.short_name || "";
                            setRoleForm((prev) => ({
                              ...prev,
                              institution_id: String(i.id),
                              organization: name,
                            }));
                            setOrgSearch(instLabel(i));
                            setOrgSearchOpen(false);
                            setOrgResults([]);
                          }}
                        >
                          <strong>{i.name}</strong>
                          {i.short_name ? (
                            <span className="govuk-hint govuk-!-margin-bottom-0">
                              {" "}
                              ({i.short_name})
                            </span>
                          ) : null}
                          {i.institution_type || i.government_level ? (
                            <div className="govuk-hint govuk-!-margin-bottom-0">
                              {[i.institution_type, i.government_level]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {orgSearchOpen &&
                  orgSearch.trim().length >= 1 &&
                  !orgSearching &&
                  orgResults.length === 0 && (
                    <p className="govuk-hint govuk-!-margin-top-1">
                      No institution matches “{orgSearch.trim()}”. You can still
                      save the typed name, or create the institution under
                      Admin → Institutions.
                    </p>
                  )}
                {roleForm.organization && (
                  <p className="govuk-body-s govuk-!-margin-top-2">
                    <strong>Selected:</strong> {roleForm.organization}
                    {roleForm.institution_id ? (
                      <span className="govuk-hint"> (linked to catalogue)</span>
                    ) : (
                      <span className="govuk-hint"> (free text)</span>
                    )}{" "}
                    <button
                      type="button"
                      className="govuk-link"
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        font: "inherit",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={() => {
                        setRoleForm((prev) => ({
                          ...prev,
                          institution_id: "",
                          organization: "",
                        }));
                        setOrgSearch("");
                        setOrgResults([]);
                      }}
                    >
                      Clear
                    </button>
                  </p>
                )}
              </div>
            )}

            {visibility.showParty && (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="role_party">
                  Political party
                  {visibility.partyRequired ? " *" : " (optional)"}
                </label>
                <div className="govuk-hint">
                  Select from the catalogue, or add a party that is missing so it
                  can be reused for other officials.
                </div>
                <select
                  id="role_party"
                  className="govuk-select"
                  value={roleForm.party_id}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      party_id: e.target.value,
                      party_name: "",
                    })
                  }
                  required={
                    visibility.partyRequired &&
                    !roleForm.party_name.trim() &&
                    !showNewParty
                  }
                >
                  <option value="">— Not applicable / none —</option>
                  {lookups.parties.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>
                      {partyLabel(p)}
                    </option>
                  ))}
                </select>
                {!roleForm.party_id && (
                  <div className="govuk-form-group govuk-!-margin-top-2">
                    <label className="govuk-label" htmlFor="role_party_name">
                      Or type party name (will be saved to the database)
                    </label>
                    <input
                      id="role_party_name"
                      className="govuk-input"
                      value={roleForm.party_name}
                      onChange={(e) =>
                        setRoleForm({
                          ...roleForm,
                          party_name: e.target.value,
                          party_id: "",
                        })
                      }
                      placeholder="e.g. Kenya African National Union"
                    />
                  </div>
                )}
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary govuk-!-margin-top-2"
                  onClick={() => setShowNewParty((v) => !v)}
                >
                  {showNewParty ? "Hide add party" : "Add party to catalogue"}
                </button>
                {showNewParty && (
                  <div
                    className="govuk-!-margin-top-2 govuk-!-padding-3"
                    style={{
                      border: "1px solid #b1b4b6",
                      background: "#f3f2f1",
                    }}
                  >
                    <div className="govuk-form-group">
                      <label className="govuk-label" htmlFor="new_party_name">
                        Party full name *
                      </label>
                      <input
                        id="new_party_name"
                        className="govuk-input"
                        value={newParty.name}
                        onChange={(e) =>
                          setNewParty({ ...newParty, name: e.target.value })
                        }
                        placeholder="e.g. United Democratic Alliance"
                      />
                    </div>
                    <div className="govuk-form-group">
                      <label className="govuk-label" htmlFor="new_party_abbr">
                        Abbreviation
                      </label>
                      <input
                        id="new_party_abbr"
                        className="govuk-input"
                        value={newParty.abbreviation}
                        onChange={(e) =>
                          setNewParty({
                            ...newParty,
                            abbreviation: e.target.value,
                          })
                        }
                        placeholder="e.g. UDA"
                      />
                    </div>
                    <button
                      type="button"
                      className="govuk-button"
                      disabled={partySaving}
                      onClick={() => void createParty()}
                    >
                      {partySaving ? "Saving party…" : "Save party & select"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {geoReqs.preDevolution && (
              <div className="govuk-inset-text">
                Term starts before March 2013 — counties did not exist yet. You
                can leave County empty and pick a former province instead.
                Constituencies may be historical (abolished or split).
              </div>
            )}

            {geoReqs.showProvince && (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="role_province">
                  Former province (pre-devolution)
                </label>
                <div className="govuk-hint">
                  The eight provinces used before the 2010 Constitution / 2013
                  county governments.
                </div>
                <select
                  id="role_province"
                  className="govuk-select"
                  value={roleForm.province}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      province: e.target.value,
                      county_id: "",
                    })
                  }
                >
                  <option value="">— Optional province —</option>
                  {FORMER_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {visibility.showCounty && (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="role_county">
                  County
                  {geoReqs.countyRequired ? " *" : " (optional)"}
                </label>
                <div className="govuk-hint">
                  {geoReqs.preDevolution
                    ? "Optional for terms before 2013. For former constituencies, pick the modern county that covers the area when adding a seat."
                    : "Required for most county-based seats after devolution (2013)."}
                </div>
                <select
                  id="role_county"
                  className="govuk-select"
                  value={roleForm.county_id}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      county_id: e.target.value,
                      province: "",
                      constituency_id: "",
                      ward_id: "",
                    })
                  }
                  required={geoReqs.countyRequired}
                >
                  <option value="">— Select county —</option>
                  {lookups.counties.map((c) => (
                    <option key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {visibility.showConstituency && (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="role_const">
                  Constituency
                  {geoReqs.constituencyRequired ? " *" : ""}
                </label>
                <div className="govuk-hint">
                  Includes former/abolished seats when present in the catalogue.
                  Example: Eldoret North was split into Turbo and Soy — add it as
                  a former constituency if missing.
                </div>
                <select
                  id="role_const"
                  className="govuk-select"
                  value={roleForm.constituency_id}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      constituency_id: e.target.value,
                      constituency_name: "",
                      ward_id: "",
                    })
                  }
                  required={
                    geoReqs.constituencyRequired &&
                    !roleForm.constituency_name.trim()
                  }
                >
                  <option value="">— Select constituency —</option>
                  {lookups.constituencies
                    .filter(
                      (c) =>
                        !roleForm.county_id ||
                        String(c.county_id) === roleForm.county_id,
                    )
                    .map((c) => (
                      <option key={String(c.id)} value={String(c.id)}>
                        {c.name}
                        {c.is_active === false ? " (former)" : ""}
                      </option>
                    ))}
                </select>
                {!roleForm.constituency_id && (
                  <div className="govuk-form-group govuk-!-margin-top-2">
                    <label className="govuk-label" htmlFor="role_const_name">
                      Or type historical constituency name
                    </label>
                    <input
                      id="role_const_name"
                      className="govuk-input"
                      value={roleForm.constituency_name}
                      onChange={(e) =>
                        setRoleForm({
                          ...roleForm,
                          constituency_name: e.target.value,
                          constituency_id: "",
                        })
                      }
                      placeholder="e.g. Eldoret North"
                    />
                  </div>
                )}
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary govuk-!-margin-top-2"
                  onClick={() => {
                    setShowNewConstituency((v) => !v);
                    setNewConstituency((prev) => ({
                      ...prev,
                      county_id: prev.county_id || roleForm.county_id,
                      name: prev.name || roleForm.constituency_name,
                      is_active: false,
                    }));
                  }}
                >
                  {showNewConstituency
                    ? "Hide add constituency"
                    : "Add former / new constituency to catalogue"}
                </button>
                {showNewConstituency && (
                  <div
                    className="govuk-!-margin-top-2 govuk-!-padding-3"
                    style={{
                      border: "1px solid #b1b4b6",
                      background: "#f3f2f1",
                    }}
                  >
                    <p className="govuk-hint">
                      Saved into <code>constituencies</code> for reuse. Link to
                      the modern county that covers the area (required by the
                      database).
                    </p>
                    <div className="govuk-form-group">
                      <label className="govuk-label" htmlFor="new_const_name">
                        Constituency name *
                      </label>
                      <input
                        id="new_const_name"
                        className="govuk-input"
                        value={newConstituency.name}
                        onChange={(e) =>
                          setNewConstituency({
                            ...newConstituency,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g. Eldoret North"
                      />
                    </div>
                    <div className="govuk-form-group">
                      <label className="govuk-label" htmlFor="new_const_county">
                        Modern county covering this area *
                      </label>
                      <select
                        id="new_const_county"
                        className="govuk-select"
                        value={
                          newConstituency.county_id || roleForm.county_id
                        }
                        onChange={(e) =>
                          setNewConstituency({
                            ...newConstituency,
                            county_id: e.target.value,
                          })
                        }
                      >
                        <option value="">— Select county —</option>
                        {lookups.counties.map((c) => (
                          <option key={String(c.id)} value={String(c.id)}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="govuk-checkboxes">
                      <div className="govuk-checkboxes__item">
                        <input
                          className="govuk-checkboxes__input"
                          id="new_const_active"
                          type="checkbox"
                          checked={newConstituency.is_active}
                          onChange={(e) =>
                            setNewConstituency({
                              ...newConstituency,
                              is_active: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="govuk-label govuk-checkboxes__label"
                          htmlFor="new_const_active"
                        >
                          Currently active IEBC seat (leave unchecked for
                          abolished / former seats)
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="govuk-button govuk-!-margin-top-2"
                      disabled={constSaving}
                      onClick={() => void createConstituency()}
                    >
                      {constSaving
                        ? "Saving…"
                        : "Save constituency & select"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {visibility.showWard && (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="role_ward">
                  Ward
                </label>
                <select
                  id="role_ward"
                  className="govuk-select"
                  value={roleForm.ward_id}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, ward_id: e.target.value })
                  }
                >
                  <option value="">— Optional —</option>
                  {lookups.wards
                    .filter(
                      (w) =>
                        !roleForm.constituency_id ||
                        String(w.constituency_id) === roleForm.constituency_id,
                    )
                    .map((w) => (
                      <option key={String(w.id)} value={String(w.id)}>
                        {w.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="role_email">
                    Official email for this role
                  </label>
                  <input
                    id="role_email"
                    className="govuk-input"
                    type="email"
                    value={roleForm.official_email}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        official_email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="role_office">
                    Office location
                  </label>
                  <input
                    id="role_office"
                    className="govuk-input"
                    value={roleForm.office_location}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        office_location: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="govuk-checkboxes govuk-!-margin-bottom-4">
              <div className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id="set_current"
                  type="checkbox"
                  checked={roleForm.set_as_current}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      set_as_current: e.target.checked,
                    })
                  }
                />
                <label
                  className="govuk-label govuk-checkboxes__label"
                  htmlFor="set_current"
                >
                  Use as current public position (updates snapshot title, party,
                  seat, organisation, level)
                </label>
              </div>
            </div>

            <div className="govuk-button-group">
              <button
                type="submit"
                className="govuk-button"
                disabled={roleSaving}
              >
                {roleSaving ? "Saving…" : "Save position"}
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={() => {
                  setShowRoleForm(false);
                  setEditingRoleId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {roles.length === 0 ? (
          <p className="govuk-inset-text">
            No positions recorded yet. Add at least one with a start date so the
            public profile can show current or last held office.
          </p>
        ) : (
          <div className="govuk-table-wrapper">
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="col">
                    Position
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Organisation / place
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Term
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Status
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {roles.map((role) => (
                  <tr key={role.id} className="govuk-table__row">
                    <td className="govuk-table__cell">
                      <strong>{role.title || "—"}</strong>
                      {role.party && (
                        <div className="govuk-hint govuk-!-margin-bottom-0">
                          {role.party}
                        </div>
                      )}
                    </td>
                    <td className="govuk-table__cell">
                      {[role.organization, role.constituency, role.county]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>
                    <td className="govuk-table__cell">
                      {formatTermRange(
                        role.term_start_date,
                        role.term_end_date,
                      ) || "—"}
                    </td>
                    <td className="govuk-table__cell">
                      <span
                        className={`govuk-tag ${
                          String(role.status || "").toLowerCase() ===
                            "active" || !role.term_end_date
                            ? "govuk-tag--green"
                            : "govuk-tag--grey"
                        }`}
                      >
                        {role.status ||
                          (role.term_end_date ? "Ended" : "Active")}
                      </span>
                    </td>
                    <td className="govuk-table__cell">
                      <button
                        type="button"
                        className="govuk-link"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          font: "inherit",
                          textDecoration: "underline",
                          color: "#1d70b8",
                        }}
                        onClick={() => openEditRole(role)}
                      >
                        Edit
                      </button>
                      {" · "}
                      <button
                        type="button"
                        className="govuk-link"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          font: "inherit",
                          textDecoration: "underline",
                          color: "#d4351c",
                        }}
                        onClick={() => role.id && deleteRole(role.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
