"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/Button";
import styles from "./ProfileSidebarMenu.module.scss";

type ProfileSidebarMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navigationItems = [
  "Лента проектов",
  "Чаты",
  "Избранные проекты",
  "Просмотренные проекты",
];

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
        <div className={styles["profile-menu__header"]}>
          <div className={styles["profile-menu__avatar"]} />
          <button
            type="button"
            className={styles["profile-menu__close"]}
            onClick={onClose}
            aria-label="Закрыть меню"
          >
            ×
          </button>
        </div>

        <div className={styles["profile-menu__actions"]}>
          <Link href="/profile/edit" className={styles["profile-menu__link"]}>
            <Button type="button" variant="outline-light" size="wide">
              Редактировать профиль
            </Button>
          </Link>

          <Button type="button" variant="outline-light" size="wide">
            Настройки
          </Button>
        </div>

        <div className={styles["profile-menu__nav"]}>
          {navigationItems.map((item) => (
            <Button key={item} type="button" variant="outline-dark" size="wide">
              {item}
            </Button>
          ))}
        </div>
      </aside>
    </div>
  );
}
