export function normalizeListResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    const nested = r.content ?? r.items ?? r.data ?? r.skills;
    if (Array.isArray(nested)) {
      return nested as T[];
    }
  }
  return [];
}
