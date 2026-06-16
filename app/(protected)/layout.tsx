"use client";

import { useState } from "react";
import { useGetMyProfileQuery } from "@/stores/user/userApi";
import { useProtectedAuth } from "@/hooks/useProtectedAuth";
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

  useGetMyProfileQuery(undefined, {
    skip: !isReady,
  });

  if (!isReady) {
    return null;
  }

  return (
    <div className={shellStyles["protected-shell"]}>
      <MenuHamburgerButton
        onOpen={() => setIsMenuOpen(true)}
        menuOpen={isMenuOpen}
      />
      <ProfileSidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <div className={shellStyles["protected-shell__main"]}>{children}</div>
    </div>
  );
}
