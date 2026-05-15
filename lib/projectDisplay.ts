import type { Project } from "@/types/types";

export function projectCardDescription(project: Project): string {
  const short = project.shortDescription?.trim();
  if (short) {
    return short;
  }
  const full = project.description?.trim() ?? "";
  if (full.length <= 180) {
    return full;
  }
  return `${full.slice(0, 177)}…`;
}
