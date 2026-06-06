export function extractApiErrorMessage(
  error: unknown,
  fallback = "Произошла ошибка"
): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const record = error as Record<string, unknown>;
  const data = record.data;

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (data && typeof data === "object") {
    const payload = data as Record<string, unknown>;
    for (const key of ["message", "error", "detail", "title"] as const) {
      const value = payload[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }

  return fallback;
}
