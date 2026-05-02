const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Backend может вернуть UUID навыков или уже строки с названиями. */
export function areLikelySkillIds(values: string[]): boolean {
  return values.length > 0 && values.every((v) => UUID_RE.test(v));
}
