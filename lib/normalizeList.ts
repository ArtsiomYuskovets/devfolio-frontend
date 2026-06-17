export function normalizeListResponse<T>(response: unknown, depth = 0): T[] {
  if (depth > 5) {
    return [];
  }
  if (Array.isArray(response)) {
    return response as T[];
  }
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    const listKeys = ["content", "items", "skills", "results", "projects"] as const;
    for (const key of listKeys) {
      const nested = r[key];
      if (Array.isArray(nested)) {
        return nested as T[];
      }
    }
    for (const key of ["data", "body", "result", "payload"] as const) {
      const nested = r[key];
      if (nested && typeof nested === "object") {
        const items = normalizeListResponse<T>(nested, depth + 1);
        if (items.length > 0) {
          return items;
        }
      }
    }
  }
  return [];
}
