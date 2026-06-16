import type { UserProfileInfo } from "@/types/types";

export function isProfileComplete(
  profile: UserProfileInfo | null | undefined
): boolean {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.nickname?.trim() &&
      profile.firstName?.trim() &&
      profile.lastName?.trim()
  );
}

export function isProfileEditPath(pathname: string): boolean {
  return pathname === "/profile/edit" || pathname.startsWith("/profile/edit/");
}
