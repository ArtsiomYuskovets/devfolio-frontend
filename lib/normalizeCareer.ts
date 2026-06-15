import type {
  CareerDateResponse,
  CareerEntryApiPayload,
  CareerEntryResponse,
  CareerEntryTypeApi,
  CareerListApiPayload,
  ProfileCareerEntry,
  ProfileCareerEntryType,
} from "@/types/types";

function getComparableDateValue(date: CareerDateResponse) {
  return date.year * 12 + date.month;
}

function normalizeCareerEntryDates(
  entry: ProfileCareerEntry
): ProfileCareerEntry {
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

export function toApiCareerType(
  type: ProfileCareerEntryType
): CareerEntryTypeApi {
  return type === "education" ? "EDUCATION" : "WORK";
}

export function fromApiCareerType(raw: unknown): ProfileCareerEntryType {
  const value = String(raw ?? "")
    .trim()
    .toUpperCase();

  if (value === "EDUCATION") {
    return "education";
  }

  return "work";
}

function normalizeCareerDate(raw: unknown): CareerDateResponse | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const month = Number(record.month);
  const year = Number(record.year);

  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(year)
  ) {
    return null;
  }

  return { month, year };
}

function toProfileCareerEntry(
  raw: unknown,
  fallbackId: string
): ProfileCareerEntry | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as CareerEntryResponse & Record<string, unknown>;
  const startDate = normalizeCareerDate(record.startDate);
  if (!startDate) {
    return null;
  }

  const endDateRaw = record.endDate;
  const endDate =
    endDateRaw === null || endDateRaw === undefined
      ? null
      : normalizeCareerDate(endDateRaw);

  const id =
    (typeof record.id === "string" && record.id.trim()) || fallbackId;

  return normalizeCareerEntryDates({
    id,
    type: fromApiCareerType(record.type),
    title: typeof record.title === "string" ? record.title : "",
    organization:
      typeof record.organization === "string" ? record.organization : "",
    description:
      typeof record.description === "string" ? record.description : "",
    startDate,
    endDate,
  });
}

function normalizeCareerEntries(items: unknown[]): ProfileCareerEntry[] {
  return items
    .map((item, index) => toProfileCareerEntry(item, `career-${index}`))
    .filter((item): item is ProfileCareerEntry => item !== null);
}

export function normalizeCareerResponse(response: unknown): ProfileCareerEntry[] {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return normalizeCareerEntries(response);
  }

  if (typeof response !== "object") {
    return [];
  }

  const record = response as Record<string, unknown>;
  const items = record.items;

  if (!Array.isArray(items)) {
    return [];
  }

  return normalizeCareerEntries(items);
}

export function mapCareerEntriesToApiPayload(
  entries: ProfileCareerEntry[]
): CareerListApiPayload {
  return {
    items: entries.map((entry) => {
      const normalized = normalizeCareerEntryDates(entry);
      const payload: CareerEntryApiPayload = {
        type: toApiCareerType(normalized.type),
        title: normalized.title.trim(),
        organization: normalized.organization.trim(),
        description: normalized.description.trim(),
        startDate: { ...normalized.startDate },
      };

      if (normalized.endDate) {
        payload.endDate = { ...normalized.endDate };
      }

      return payload;
    }),
  };
}
