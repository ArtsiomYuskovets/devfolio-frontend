import type { SkillCategory } from "@/types/types";

const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  LANGUAGE: "Языки",
  FRAMEWORK: "Фреймворки",
  TOOL: "Инструменты",
  PLATFORM: "Платформы",
};

export function formatSkillCategoryLabel(
  category: string | null | undefined
): string {
  if (!category?.trim()) {
    return "";
  }

  const key = category.trim().toUpperCase() as SkillCategory;
  return SKILL_CATEGORY_LABELS[key] ?? category;
}
