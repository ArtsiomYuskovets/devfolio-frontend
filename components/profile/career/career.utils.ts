import type {
  CareerListApiPayload,
  ProfileCareerDate,
  ProfileCareerEntry,
  ProfileCareerEntryType,
} from "@/types/types";
import { mapCareerEntriesToApiPayload } from "@/lib/normalizeCareer";
import {
  CAREER_MONTH_OPTIONS,
  CAREER_TYPE_OPTIONS,
} from "./career.constants";

export function createCareerDate(month: number, year: number): ProfileCareerDate {
  return { month, year };
}

export function createCareerEntry(
  id: string,
  type: ProfileCareerEntryType,
  title: string,
  organization: string,
  description: string,
  startDate: ProfileCareerDate,
  endDate: ProfileCareerDate | null
): ProfileCareerEntry {
  return {
    id,
    type,
    title,
    organization,
    description,
    startDate,
    endDate,
  };
}

export function createEmptyCareerEntry(): ProfileCareerEntry {
  const currentYear = new Date().getFullYear();

  return createCareerEntry(
    `${Date.now()}`,
    "work",
    "",
    "",
    "",
    createCareerDate(1, currentYear),
    null
  );
}

export function getCareerTypeMeta(type: ProfileCareerEntryType) {
  return (
    CAREER_TYPE_OPTIONS.find((option) => option.value === type) ??
    CAREER_TYPE_OPTIONS[0]
  );
}

export function getMonthLabel(month: number) {
  return (
    CAREER_MONTH_OPTIONS.find((option) => option.value === month)?.label ?? "Янв"
  );
}

function getComparableDateValue(date: ProfileCareerDate) {
  return date.year * 12 + date.month;
}

export function normalizeCareerEntryDates(entry: ProfileCareerEntry) {
  if (!entry.endDate) {
    return entry;
  }

  if (
    getComparableDateValue(entry.startDate) >
    getComparableDateValue(entry.endDate)
  ) {
    return {
      ...entry,
      endDate: { ...entry.startDate },
    };
  }

  return entry;
}

export function sortCareerEntries(entries: ProfileCareerEntry[]) {
  return [...entries].sort((left, right) => {
    const leftDate = left.endDate
      ? getComparableDateValue(left.endDate)
      : Number.POSITIVE_INFINITY;
    const rightDate = right.endDate
      ? getComparableDateValue(right.endDate)
      : Number.POSITIVE_INFINITY;

    if (leftDate !== rightDate) {
      return rightDate - leftDate;
    }

    return (
      getComparableDateValue(right.startDate) -
      getComparableDateValue(left.startDate)
    );
  });
}

export function formatCareerDateRange(entry: ProfileCareerEntry) {
  const startLabel = `${getMonthLabel(entry.startDate.month)} ${entry.startDate.year}`;

  if (!entry.endDate) {
    return `${startLabel} - Настоящее время`;
  }

  return `${startLabel} - ${getMonthLabel(entry.endDate.month)} ${entry.endDate.year}`;
}

export function mapCareerEntriesToPayload(
  entries: ProfileCareerEntry[]
): CareerListApiPayload {
  return mapCareerEntriesToApiPayload(
    sortCareerEntries(entries).map((entry) => normalizeCareerEntryDates(entry))
  );
}

export function getDefaultCareerEntries(
  isOwnProfile: boolean
): ProfileCareerEntry[] {
  return isOwnProfile
    ? [
        createCareerEntry(
          "career-1",
          "work",
          "Frontend Developer",
          "Product Studio",
          "Разработка интерфейсов, дизайн-системы и продуктовых фич для командных проектов.",
          createCareerDate(3, 2024),
          null
        ),
        createCareerEntry(
          "career-2",
          "education",
          "UX/UI и продуктовый дизайн",
          "Онлайн-курс",
          "Изучение композиции, исследований, CJM и системного подхода к интерфейсам.",
          createCareerDate(9, 2023),
          createCareerDate(2, 2024)
        ),
      ]
    : [
        createCareerEntry(
          "career-1",
          "work",
          "Frontend Developer",
          "Digital Product Team",
          "Разработка клиентской части, работа с дизайн-системой и релизами продуктовых задач.",
          createCareerDate(4, 2023),
          null
        ),
        createCareerEntry(
          "career-2",
          "education",
          "Высшее образование",
          "Университет",
          "Подготовка по профильному направлению и участие в учебных проектных командах.",
          createCareerDate(9, 2019),
          createCareerDate(6, 2023)
        ),
      ];
}
