function readIdField(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) {
    return v.trim();
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    return String(v);
  }
  return null;
}

export function pickUserId(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const r = raw as Record<string, unknown>;
  const keys = ["userId", "id", "user_id", "ownerId", "owner_id"] as const;
  for (const k of keys) {
    const parsed = readIdField(r[k]);
    if (parsed) {
      return parsed;
    }
  }
  return null;
}

export function pickProfileUserId(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const r = raw as Record<string, unknown>;

  for (const k of ["userId", "user_id"] as const) {
    const parsed = readIdField(r[k]);
    if (parsed) {
      return parsed;
    }
  }

  const user = r.user;
  if (user && typeof user === "object") {
    const fromUser = pickUserId(user);
    if (fromUser) {
      return fromUser;
    }
  }

  return readIdField(r.id);
}
