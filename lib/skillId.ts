const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isLikelySkillId(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function pickSkillId(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim();
  }
  if (!raw || typeof raw !== "object") {
    return "";
  }
  const record = raw as Record<string, unknown>;
  const keys = ["id", "skillId", "skill_id"] as const;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

export function normalizeSkillIdList(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const id = value.trim();
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    result.push(id);
  }
  return result;
}
