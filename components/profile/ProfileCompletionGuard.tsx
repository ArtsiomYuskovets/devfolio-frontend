"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isProfileComplete, isProfileEditPath } from "@/lib/profileCompletion";
import { useGetMyProfileQuery } from "@/stores/user/userApi";

type ProfileCompletionGuardProps = {
  children: React.ReactNode;
};

export function ProfileCompletionGuard({ children }: ProfileCompletionGuardProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { data: profile, isLoading } = useGetMyProfileQuery();

  const onEditPage = isProfileEditPath(pathname);
  const profileComplete = isProfileComplete(profile);

  const isChecking = isLoading;

  useEffect(() => {
    if (isChecking || profileComplete || onEditPage) {
      return;
    }

    router.replace("/profile/edit");
  }, [isChecking, onEditPage, profileComplete, router]);

  if (isChecking) {
    return null;
  }

  if (!profileComplete && !onEditPage) {
    return null;
  }

  return <>{children}</>;
}
