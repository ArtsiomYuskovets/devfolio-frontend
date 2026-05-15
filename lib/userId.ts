export function pickUserId(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const r = raw as Record<string, unknown>;
  const keys = ["userId", "id", "user_id"] as const;
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
    if (typeof v === "number" && Number.isFinite(v)) {
      return String(v);
    }
  }
  return null;
}
