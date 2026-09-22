export type ServiceGroup = "current" | "former" | "other";
export type InstitutionService = {
  id: string;
  personId: string;
  name: string;
  href: string | null;
  image: string | null;
  title: string;
  start: string | null;
  end: string | null;
  status: string | null;
  priority: number | null;
};

export function serviceGroup(service: Pick<InstitutionService, "start" | "end" | "status">, historical: boolean, today: string): ServiceGroup {
  const status = (service.status || "").toLowerCase();
  if (historical || (service.end && service.end < today) || ["former", "ended", "inactive", "deceased", "retired"].includes(status)) return "former";
  if ((service.start && service.start > today) || status === "suspended" || !["active", "current", "serving"].includes(status)) return "other";
  return "current";
}

export function safePortrait(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try { const url = new URL(value); return url.protocol === "https:" ? url.href : null; } catch { return null; }
}

export function groupInstitutionPeople(services: InstitutionService[], historical: boolean, today: string) {
  const groups: Record<ServiceGroup, Map<string, InstitutionService[]>> = { current: new Map(), former: new Map(), other: new Map() };
  const seen = new Set<string>();
  for (const service of services) {
    const key = [service.personId, service.title.toLowerCase(), service.start, service.end, service.status].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    const group = groups[serviceGroup(service, historical, today)];
    group.set(service.personId, [...(group.get(service.personId) || []), service]);
  }
  const sort = (group: ServiceGroup) => [...groups[group].values()].map(roles => roles.sort((a, b) => (b.start || "").localeCompare(a.start || "")))
    .sort((a, b) => group === "former"
      ? (b[0].end || b[0].start || "").localeCompare(a[0].end || a[0].start || "") || a[0].name.localeCompare(b[0].name)
      : Math.min(...a.map(role => role.priority ?? 9999)) - Math.min(...b.map(role => role.priority ?? 9999)) || a[0].name.localeCompare(b[0].name));
  return { current: sort("current"), former: sort("former"), other: sort("other") };
}
