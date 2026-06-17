export const MAX_PROFILE_LINKS = 5;

export type ProfileLinkItem = {
  id: string;
  key: string;
  value: string;
  isDraft?: boolean;
};

export type ProfileLinkView = {
  id: string;
  label: string;
  url: string;
};

function createLinkId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyProfileLinkItem(isDraft = false): ProfileLinkItem {
  return { id: createLinkId(), key: "", value: "", isDraft };
}

export function profileLinksRecordToItems(
  links: Record<string, string> = {}
): ProfileLinkItem[] {
  return Object.entries(links)
    .filter(([key, value]) => key.trim() && value.trim())
    .map(([key, value]) => ({
      id: createLinkId(),
      key,
      value,
    }));
}

export function profileLinkItemsToRecord(
  items: ProfileLinkItem[]
): Record<string, string> {
  return Object.fromEntries(
    items
      .filter(({ key, value }) => key.trim() && value.trim())
      .map(({ key, value }) => [key.trim(), value.trim()])
  );
}

export function countCompleteProfileLinks(items: ProfileLinkItem[]): number {
  return items.filter((item) => item.key.trim() && item.value.trim()).length;
}

export function getVisibleProfileLinkItems(
  items: ProfileLinkItem[]
): ProfileLinkItem[] {
  return items.filter(
    (item) => (item.key.trim() && item.value.trim()) || item.isDraft
  );
}

export function profileLinksRecordToViews(
  links: Record<string, string> = {}
): ProfileLinkView[] {
  return Object.entries(links)
    .filter(([label, url]) => label.trim() && url.trim())
    .map(([label, url]) => ({
      id: `${label}-${url}`,
      label: label.trim(),
      url: url.trim(),
    }));
}

export function updateProfileLinkItem(
  items: ProfileLinkItem[],
  id: string,
  patch: Partial<Pick<ProfileLinkItem, "key" | "value">>
): ProfileLinkItem[] {
  return items.map((item) => {
    if (item.id !== id) {
      return item;
    }

    const next: ProfileLinkItem = { ...item, ...patch };
    if (next.key.trim() && next.value.trim()) {
      delete next.isDraft;
    }
    return next;
  });
}
