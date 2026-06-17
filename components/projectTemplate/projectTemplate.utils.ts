export function formatProjectDate(timestamp?: number | string) {
  if (timestamp === undefined || timestamp === null || timestamp === "") {
    return "не указано";
  }

  const date =
    typeof timestamp === "number"
      ? new Date(timestamp)
      : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "не указано";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export type ProjectViewSkill = {
  key: string;
  label: string;
  verified: boolean;
};
