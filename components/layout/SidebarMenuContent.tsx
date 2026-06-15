"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/Button";
import { ProfileAvatarImg } from "@/components/profile/ProfileAvatarImg";
import { WELCOME_PATH } from "@/lib/routes";
import { tokenService } from "@/lib/tokenService";
import { pickProfileUserId } from "@/lib/userId";
import { useAppDispatch } from "@/stores/auth/hooks";
import { useMyUserType } from "@/hooks/useMyUserType";
import { useGetMyProfileQuery } from "@/stores/user/userApi";
import styles from "@/components/profile/ProfileSidebarMenu.module.scss";

type NavItem = { label: string; href: string };

const seekerNavigationItems: NavItem[] = [
  { label: "Профиль", href: "/profile" },
  { label: "Лента проектов", href: "/projects" },
  { label: "Лента профилей", href: "/profiles" },
  { label: "Избранные проекты", href: "/projects/favorites" },
];

const recruiterNavigationItems: NavItem[] = [
  { label: "Профиль", href: "/profile" },
  { label: "Лента проектов", href: "/projects" },
  { label: "Кандидаты", href: "/profiles" },
  { label: "Сохранённое", href: "/projects/favorites" },
];

function isActiveHref(href: string, pathname: string): boolean {
  if (href === "/profile") {
    if (pathname.startsWith("/profile/edit")) {
      return false;
    }
    return pathname === "/profile" || /^\/profile\/[^/]+\/?$/.test(pathname);
  }
  if (href === "/projects") {
    return (
      pathname === "/projects" ||
      (pathname.startsWith("/project/") && !pathname.startsWith("/projects/"))
    );
  }
  if (href === "/projects/favorites") {
    return pathname === "/projects/favorites";
  }
  if (href === "/profiles") {
    return pathname === "/profiles";
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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isRecruiter, isLoading } = useMyUserType();
  const { data: myProfile } = useGetMyProfileQuery();
  const myUserId = myProfile
    ? pickProfileUserId(myProfile) ?? myProfile.userId
    : undefined;

  const navigationItems = useMemo(
    () => (isRecruiter ? recruiterNavigationItems : seekerNavigationItems),
    [isRecruiter]
  );

  const handleNav = () => {
    onNavigate?.();
  };

  const handleLogout = async () => {
    await tokenService.logout(dispatch);
    onNavigate?.();
    router.replace(WELCOME_PATH);
  };

  const isEditActive = pathname.startsWith("/profile/edit");

  return (
    <>
      <div className={styles["profile-menu__header"]}>
        <div className={styles["profile-menu__avatar"]}>
          <ProfileAvatarImg
            avatarURL={myProfile?.avatarURL}
            userId={myUserId}
            alt="Аватар профиля"
            className={styles["profile-menu__avatar-img"]}
          />
        </div>
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
      </div>

      <nav
        className={styles["profile-menu__nav"]}
        aria-label="Разделы приложения"
      >
        {!isLoading
          ? navigationItems.map((item) => (
              <Link
                key={item.href}
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
            ))
          : null}
      </nav>

      <div className={styles["profile-menu__footer"]}>
        <Button
          type="button"
          variant="outline-light"
          size="wide"
          onClick={() => void handleLogout()}
        >
          Выйти из профиля
        </Button>
      </div>
    </>
  );
}
