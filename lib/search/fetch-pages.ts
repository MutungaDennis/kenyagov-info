/** Fetch complete small directories without silently accepting PostgREST's row cap. */
export async function fetchDirectoryPages<T>(request: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const rows: T[] = [];
  const size = 1000;
  for (let page = 0; page < 50; page++) {
    const result = await request(page * size, (page + 1) * size - 1);
    if (result.error) return { data: [] as T[], error: result.error };
    rows.push(...(result.data || []));
    if (!result.data || result.data.length < size) return { data: rows, error: null };
  }
  return { data: [] as T[], error: { message: "This directory is too large to load in full. Please use site search." } };
}
