"use client";

import { SidebarMenuContent } from "@/components/layout/SidebarMenuContent";
import styles from "./ProfileSidebarMenu.module.scss";

type ProfileSidebarMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProfileSidebarMenu({
  isOpen,
  onClose,
}: ProfileSidebarMenuProps) {
  return (
    <div
      className={`${styles["profile-menu"]} ${
        isOpen ? styles["profile-menu--open"] : ""
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={styles["profile-menu__backdrop"]}
        onClick={onClose}
        aria-label="Закрыть меню"
      />

      <aside className={styles["profile-menu__panel"]}>
        <SidebarMenuContent
          showClose
          onClose={onClose}
          onNavigate={onClose}
        />
      </aside>
    </div>
  );
}
