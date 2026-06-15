export const PROJECT_LIST_SORT_OPTIONS = [
  { value: "NEWEST", label: "Сначала новые" },
  { value: "OLDEST", label: "Сначала старые" },
  { value: "MOST_VIEWED", label: "Больше просмотров" },
  { value: "MOST_LIKED", label: "Больше лайков" },
] as const;

export type ProjectListSort = (typeof PROJECT_LIST_SORT_OPTIONS)[number]["value"];

export const DEFAULT_PROJECT_LIST_SORT: ProjectListSort = "NEWEST";

export function isProjectListSort(value: string): value is ProjectListSort {
  return PROJECT_LIST_SORT_OPTIONS.some((option) => option.value === value);
}
