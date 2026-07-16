/**
 * Contribution order helpers for Hansard admin.
 */

/** Sort by order ascending (does not mutate). */
export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/** Force contiguous orders 1…n in current sort order. */
export function renumberContiguous<T extends { order: number }>(items: T[]): T[] {
  return sortByOrder(items).map((item, i) => ({ ...item, order: i + 1 }));
}

/**
 * Insert item at target order (1-based). Existing items at order >= target shift up.
 * Then renumber to contiguous 1…n.
 */
export function insertAtOrder<T extends { order: number }>(
  items: T[],
  newItem: T,
  targetOrder: number,
): T[] {
  const max = items.length + 1;
  const target = Math.max(1, Math.min(Math.floor(targetOrder) || max, max));

  const shifted = items.map((item) =>
    item.order >= target ? { ...item, order: item.order + 1 } : item,
  );

  return renumberContiguous([...shifted, { ...newItem, order: target }]);
}

/** Next order when appending at end. */
export function nextAppendOrder(items: { order: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((c) => c.order)) + 1;
}

/** Move item at visual index up/down after sorting by order. */
export function moveBySortedIndex<T extends { order: number }>(
  items: T[],
  sortedIndex: number,
  direction: "up" | "down",
): T[] {
  const sorted = sortByOrder(items);
  const newIndex = direction === "up" ? sortedIndex - 1 : sortedIndex + 1;
  if (newIndex < 0 || newIndex >= sorted.length) return renumberContiguous(sorted);

  const next = [...sorted];
  [next[sortedIndex], next[newIndex]] = [next[newIndex], next[sortedIndex]];
  return renumberContiguous(next);
}

export function deleteAtSortedIndex<T extends { order: number }>(
  items: T[],
  sortedIndex: number,
): T[] {
  const sorted = sortByOrder(items);
  return renumberContiguous(sorted.filter((_, i) => i !== sortedIndex));
}
