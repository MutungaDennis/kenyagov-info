import { isInstitutionHistorical } from "./fields";

export type HistoricalLink = { id: string; slug: string; name: string; status?: string | null };
type HistoryRecord = HistoricalLink & {
  is_active?: boolean | null;
  former_names?: string[] | null;
  predecessor_institution_id?: string | null;
  successor_institution_id?: string | null;
  name_history?: { name: string; end_date: string | null }[] | null;
};

/** Publication and lifecycle are independent. Never surface an unpublished predecessor. */
export function enrichInstitutionHistory<T extends HistoryRecord>(records: T[]) {
  const published = records.filter(record => record.is_active !== false);
  const byId = new Map(published.map(record => [record.id, record]));
  const predecessors = new Map<string, T[]>();
  for (const record of published) {
    if (record.successor_institution_id && record.successor_institution_id !== record.id) {
      predecessors.set(record.successor_institution_id, [...(predecessors.get(record.successor_institution_id) || []), record]);
    }
  }
  return published.map(record => {
    const candidates = [...(predecessors.get(record.id) || [])];
    const predecessor = byId.get(record.predecessor_institution_id || "");
    if (predecessor && predecessor.id !== record.id) candidates.push(predecessor);
    const previousInstitutions = [...new Map(candidates.filter(previous => isInstitutionHistorical(previous.status)).map(previous => [previous.id, previous])).values()]
      .map(({ id, slug, name, status }) => ({ id, slug, name, status }));
    const former_names = [...new Set([...(record.former_names || []), ...(record.name_history || []).filter(item => item.end_date || item.name !== record.name).map(item => item.name)])]
      .filter(name => name && name !== record.name);
    return { ...record, former_names, previousInstitutions, historySearchNames: previousInstitutions.map(previous => previous.name) };
  });
}
