import type { Skill } from "@/types/types";
import { normalizeListResponse } from "@/lib/normalizeList";

function readString(v: unknown): string | undefined {
  if (typeof v !== "string") {
    return undefined;
  }
  const t = v.trim();
  return t ? t : undefined;
}

function readBool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") {
    return v;
  }
  if (v === 1 || v === "1" || v === "true") {
    return true;
  }
  if (v === 0 || v === "0" || v === "false") {
    return false;
  }
  return undefined;
}

export function normalizeSkillPayload(raw: unknown): Skill | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const envelope = raw as Record<string, unknown>;
  for (const key of ["data", "skill", "body", "result", "payload"] as const) {
    const nested = envelope[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const fromNested = normalizeSkillPayload(nested);
      if (fromNested) {
        return fromNested;
      }
    }
  }

  const r = raw as Record<string, unknown>;
  const id =
    readString(r.id) ??
    readString(r.skillId) ??
    readString(r.skill_id);
  const name =
    readString(r.name) ??
    readString(r.skillName) ??
    readString(r.title) ??
    id;

  if (!id || !name) {
    return null;
  }

  const confirmed =
    readBool(r.confirmed) ??
    readBool(r.verified) ??
    readBool(r.isConfirmed) ??
    readBool(r.is_confirmed) ??
    false;

  return {
    id,
    name,
    category: readString(r.category) ?? "",
    confirmed,
  };
}

export function normalizeSkillsListResponse(response: unknown): Skill[] {
  const items = normalizeListResponse<unknown>(response);
  const skills: Skill[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const skill = normalizeSkillPayload(item);
    if (skill && !seen.has(skill.id)) {
      seen.add(skill.id);
      skills.push(skill);
    }
  }

  return skills;
}
