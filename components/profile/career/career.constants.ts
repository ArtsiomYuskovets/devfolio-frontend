import type { ProfileCareerEntryType } from "@/types/types";

export const CAREER_TYPE_OPTIONS: Array<{
  value: ProfileCareerEntryType;
  label: string;
  icon: string;
}> = [
  { value: "work", label: "Работа", icon: "💼" },
  { value: "education", label: "Курсы и учеба", icon: "🎓" },
];

export const CAREER_MONTH_OPTIONS = [
  { value: 1, label: "Янв" },
  { value: 2, label: "Фев" },
  { value: 3, label: "Мар" },
  { value: 4, label: "Апр" },
  { value: 5, label: "Май" },
  { value: 6, label: "Июн" },
  { value: 7, label: "Июл" },
  { value: 8, label: "Авг" },
  { value: 9, label: "Сен" },
  { value: 10, label: "Окт" },
  { value: 11, label: "Ноя" },
  { value: 12, label: "Дек" },
] as const;

const currentYear = new Date().getFullYear();

export const CAREER_YEAR_OPTIONS = Array.from(
  { length: currentYear - 1980 + 3 },
  (_, index) => currentYear + 2 - index
);
