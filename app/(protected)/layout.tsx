"use client";

import { useState } from "react";
import { useGetMyProfileQuery } from "@/stores/user/userApi";
import { useProtectedAuth } from "@/hooks/useProtectedAuth";
import { isProfileComplete } from "@/lib/profileCompletion";
import { ProfileCompletionGuard } from "@/components/profile/ProfileCompletionGuard";
import { MenuHamburgerButton } from "@/components/layout/MenuHamburgerButton";
import { ProfileSidebarMenu } from "@/components/profile/ProfileSidebarMenu";
import shellStyles from "@/components/layout/ProtectedShell.module.scss";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isReady } = useProtectedAuth();
  const { data: profile } = useGetMyProfileQuery(undefined, {
    skip: !isReady,
  });
  const showNavigation = isProfileComplete(profile);

  if (!isReady) {
    return null;
  }

  return (
    <ProfileCompletionGuard>
      <div className={shellStyles["protected-shell"]}>
        {showNavigation ? (
          <MenuHamburgerButton
            onOpen={() => setIsMenuOpen(true)}
            menuOpen={isMenuOpen}
          />
        ) : null}
        {showNavigation ? (
          <ProfileSidebarMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
          />
        ) : null}
        <div className={shellStyles["protected-shell__main"]}>{children}</div>
      </div>
    </ProfileCompletionGuard>
  );
}
