"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button/Button";
import styles from "@/components/profile/ProfileSidebarMenu.module.scss";

const navigationItems: { label: string; href?: string }[] = [
  { label: "Главная", href: "/dashboard" },
  { label: "Профиль", href: "/profile" },
  { label: "Лента проектов", href: "/projects" },
  { label: "Чаты" },
  { label: "Избранные проекты" },
  { label: "Просмотренные проекты" },
];

function isActiveHref(href: string, pathname: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (href === "/profile") {
    if (
      pathname.startsWith("/profile/edit") ||
      pathname.startsWith("/profile/settings")
    ) {
      return false;
    }
    return pathname === "/profile" || /^\/profile\/[^/]+\/?$/.test(pathname);
  }
  if (href === "/projects") {
    return pathname === "/projects" || pathname.startsWith("/project/");
  }
  return false;
}

export type SidebarMenuContentProps = {
  /** Закрыть оверлей после перехода по ссылке */
  onNavigate?: () => void;
  /** Показать кнопку закрытия (оверлей) */
  showClose?: boolean;
  onClose?: () => void;
};

export function SidebarMenuContent({
  onNavigate,
  showClose = false,
  onClose,
}: SidebarMenuContentProps) {
  const pathname = usePathname() ?? "";

  const handleNav = () => {
    onNavigate?.();
  };

  const isEditActive = pathname.startsWith("/profile/edit");
  const isSettingsActive = pathname.startsWith("/profile/settings");

  return (
    <>
      <div className={styles["profile-menu__header"]}>
        <div className={styles["profile-menu__avatar"]} />
        {showClose ? (
          <button
            type="button"
            className={styles["profile-menu__close"]}
            onClick={onClose}
            aria-label="Закрыть меню"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className={styles["profile-menu__actions"]}>
        <Link
          href="/profile/edit"
          className={`${styles["profile-menu__link"]} ${
            isEditActive ? styles["profile-menu__link--active"] : ""
          }`}
          onClick={handleNav}
          aria-current={isEditActive ? "page" : undefined}
        >
          <Button type="button" variant="outline-light" size="wide">
            Редактировать профиль
          </Button>
        </Link>

        <Link
          href="/profile/settings"
          className={`${styles["profile-menu__link"]} ${
            isSettingsActive ? styles["profile-menu__link--active"] : ""
          }`}
          onClick={handleNav}
          aria-current={isSettingsActive ? "page" : undefined}
        >
          <Button type="button" variant="outline-light" size="wide">
            Настройки
          </Button>
        </Link>
      </div>

      <nav
        className={styles["profile-menu__nav"]}
        aria-label="Разделы приложения"
      >
        {navigationItems.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles["profile-menu__link"]} ${
                isActiveHref(item.href, pathname)
                  ? styles["profile-menu__link--active"]
                  : ""
              }`}
              onClick={handleNav}
              aria-current={
                isActiveHref(item.href, pathname) ? "page" : undefined
              }
            >
              <Button type="button" variant="outline-dark" size="wide">
                {item.label}
              </Button>
            </Link>
          ) : (
            <Button
              key={item.label}
              type="button"
              variant="outline-dark"
              size="wide"
            >
              {item.label}
            </Button>
          )
        )}
      </nav>
    </>
  );
}
