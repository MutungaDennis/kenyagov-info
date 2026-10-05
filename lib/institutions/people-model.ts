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
  levelId?: string | null;
  levelOrder?: number | null;
  personOrder?: number | null;
};

export function serviceGroup(service: Pick<InstitutionService, "start" | "end" | "status">, historical: boolean, today: string): ServiceGroup {
  const status = (service.status || "").toLowerCase();
  if (historical || (service.end && service.end < today) || ["former", "ended", "inactive", "deceased", "retired"].includes(status)) return "former";
  if ((service.start && service.start > today) || status === "suspended" || !["active", "current", "serving"].includes(status)) return "other";
  return "current";
}

export function isCurrentInstitutionService(
  service: Pick<InstitutionService, "start" | "end" | "status">,
  today: string,
) {
  return serviceGroup(service, false, today) === "current";
}

export function safePortrait(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try { const url = new URL(value); return url.protocol === "https:" ? url.href : null; } catch { return null; }
}

export type InstitutionPeopleLevel = {
  id: string;
  name: string;
  sort_order: number;
  parent_level_id?: string | null;
};

export function orderInstitutionPeopleLevels(levels: InstitutionPeopleLevel[]) {
  const sorted = levels.slice().sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  );
  return sorted.flatMap((level) => {
    if (level.parent_level_id) return [];
    return [
      level,
      ...sorted.filter((child) => child.parent_level_id === level.id),
    ];
  });
}

export function groupInstitutionPeople(
  services: InstitutionService[],
  historical: boolean,
  today: string,
  levels: InstitutionPeopleLevel[] = [],
) {
  const groups: Record<ServiceGroup, Map<string, InstitutionService[]>> = { current: new Map(), former: new Map(), other: new Map() };
  const seen = new Set<string>();
  for (const service of services) {
    const key = [service.personId, service.title.toLowerCase(), service.start, service.end, service.status].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    const group = groups[serviceGroup(service, historical, today)];
    group.set(service.personId, [...(group.get(service.personId) || []), service]);
  }
  const sortedLevels = levels.slice().sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  );
  const levelsById = new Map(sortedLevels.map((level) => [level.id, level]));
  const orderedLevels = orderInstitutionPeopleLevels(sortedLevels);
  const levelOrderById = new Map(
    orderedLevels.map((level, index) => [level.id, index + 1]),
  );
  const sortRoles = (roles: InstitutionService[]) =>
    roles.sort(
      (a, b) =>
        (a.levelOrder ?? levelOrderById.get(a.levelId || "") ?? Number.MAX_SAFE_INTEGER) -
          (b.levelOrder ?? levelOrderById.get(b.levelId || "") ?? Number.MAX_SAFE_INTEGER) ||
        (a.personOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.personOrder ?? Number.MAX_SAFE_INTEGER) ||
        (a.priority ?? Number.MAX_SAFE_INTEGER) -
          (b.priority ?? Number.MAX_SAFE_INTEGER) ||
        (b.start || "").localeCompare(a.start || ""),
    );
  const sortedPeople = (group: ServiceGroup) =>
    [...groups[group].values()]
      .map((roles) => sortRoles(roles))
      .sort((a, b) => {
        if (group === "former") {
          return (
            (b[0].end || b[0].start || "").localeCompare(a[0].end || a[0].start || "") ||
            a[0].name.localeCompare(b[0].name)
          );
        }
        return (
          (a[0].levelOrder ?? levelOrderById.get(a[0].levelId || "") ?? Number.MAX_SAFE_INTEGER) -
            (b[0].levelOrder ?? levelOrderById.get(b[0].levelId || "") ?? Number.MAX_SAFE_INTEGER) ||
          (a[0].personOrder ?? Number.MAX_SAFE_INTEGER) -
            (b[0].personOrder ?? Number.MAX_SAFE_INTEGER) ||
          (a[0].priority ?? Number.MAX_SAFE_INTEGER) -
            (b[0].priority ?? Number.MAX_SAFE_INTEGER) ||
          a[0].name.localeCompare(b[0].name)
        );
      });

  const current = sortedPeople("current");
  const currentByLevel = sortedLevels
    .filter((level) => !level.parent_level_id)
    .map((level) => {
      const subcategories = sortedLevels
        .filter((candidate) => candidate.parent_level_id === level.id)
        .map((subcategory) => ({
          id: subcategory.id,
          name: subcategory.name,
          people: current.filter(
            (roles) => roles[0].levelId === subcategory.id,
          ),
        }))
        .filter((subcategory) => subcategory.people.length > 0);
      return {
        id: level.id,
        name: level.name,
        people: current.filter((roles) => roles[0].levelId === level.id),
        subcategories,
      };
    })
    .filter((level) => level.people.length > 0 || level.subcategories.length > 0);
  const unassignedCurrent = current.filter(
    (roles) => !levelsById.has(roles[0].levelId || ""),
  );
  if (unassignedCurrent.length > 0 && levels.length > 0) {
    currentByLevel.push({
      id: "unassigned",
      name: "Other current roles",
      people: unassignedCurrent,
      subcategories: [],
    });
  }

  return {
    current,
    currentByLevel,
    former: sortedPeople("former"),
    other: sortedPeople("other"),
  };
}
