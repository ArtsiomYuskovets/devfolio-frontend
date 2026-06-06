import { isLikelySkillId } from "@/lib/skillId";

/** Backend может вернуть UUID навыков или уже строки с названиями. */
export function areLikelySkillIds(values: string[]): boolean {
  return values.length > 0 && values.every((value) => isLikelySkillId(value));
}
