import type { ProjectSkillAttachment } from "@/types/types";
import { normalizeListResponse } from "@/lib/normalizeList";

export type ProjectSkillView = {
  skillId: string;
  name: string;
  category?: string;
  verified: boolean;
};

function readSkillId(o: Record<string, unknown>): string {
  if (typeof o.skillId === "string" && o.skillId.trim()) {
    return o.skillId.trim();
  }
  if (typeof o.skill_id === "string" && o.skill_id.trim()) {
    return o.skill_id.trim();
  }

  const skill = o.skill;
  if (skill && typeof skill === "object" && skill !== null) {
    const s = skill as Record<string, unknown>;
    if (typeof s.id === "string" && s.id.trim()) {
      return s.id.trim();
    }
    if (typeof s.skillId === "string" && s.skillId.trim()) {
      return s.skillId.trim();
    }
  }

  if (typeof o.id === "string" && o.id.trim()) {
    return o.id.trim();
  }

  return "";
}

function readSkillName(o: Record<string, unknown>): string | undefined {
  if (typeof o.name === "string" && o.name.trim()) {
    return o.name.trim();
  }
  if (typeof o.skillName === "string" && o.skillName.trim()) {
    return o.skillName.trim();
  }

  const skill = o.skill;
  if (skill && typeof skill === "object" && skill !== null) {
    const s = skill as Record<string, unknown>;
    if (typeof s.name === "string" && s.name.trim()) {
      return s.name.trim();
    }
  }

  return undefined;
}

function readSkillCategory(o: Record<string, unknown>): string | undefined {
  const skill = o.skill;
  if (skill && typeof skill === "object" && skill !== null) {
    const s = skill as Record<string, unknown>;
    if (typeof s.category === "string" && s.category.trim()) {
      return s.category.trim();
    }
  }
  if (typeof o.category === "string" && o.category.trim()) {
    return o.category.trim();
  }
  return undefined;
}

function readVerified(o: Record<string, unknown>): boolean {
  const keys = [
    "verified",
    "confirmed",
    "isVerified",
    "is_verified",
    "isConfirmed",
    "is_confirmed",
  ] as const;

  for (const key of keys) {
    const v = o[key];
    if (v === true || v === 1 || v === "1" || v === "true") {
      return true;
    }
    if (v === false || v === 0 || v === "0" || v === "false") {
      return false;
    }
  }

  const skill = o.skill;
  if (skill && typeof skill === "object" && skill !== null) {
    return readVerified(skill as Record<string, unknown>);
  }

  return false;
}

export function normalizeProjectSkillsResponse(
  response: unknown
): ProjectSkillAttachment[] {
  const views = normalizeProjectSkillViews(response);
  return views.map((v) => ({ skillId: v.skillId, verified: v.verified }));
}

export function normalizeProjectSkillViews(response: unknown): ProjectSkillView[] {
  const raw = normalizeListResponse<unknown>(response);
  const result: ProjectSkillView[] = [];

  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      result.push({
        skillId: item.trim(),
        name: item.trim(),
        verified: false,
      });
      continue;
    }

    if (!item || typeof item !== "object") {
      continue;
    }

    const o = item as Record<string, unknown>;
    const skillId = readSkillId(o);
    if (!skillId) {
      continue;
    }

    result.push({
      skillId,
      name: readSkillName(o) ?? skillId,
      category: readSkillCategory(o),
      verified: readVerified(o),
    });
  }

  return result;
}

export function resolveSkillDisplayName(
  view: ProjectSkillView,
  catalogName?: string
): string {
  if (view.name && view.name !== view.skillId) {
    return view.name;
  }
  if (catalogName?.trim()) {
    return catalogName.trim();
  }
  return view.skillId;
}
