"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ProfileProjectsSection } from "./ProfileProjectsSection";
import type { UserProfileInfo } from "@/types/types";
import { pickUserId } from "@/lib/userId";
import { formatUserTypeLabel, isRecruiter } from "@/lib/userType";
import styles from "./ProfilePage.module.scss";

type ProfilePageProps = {
  profile: UserProfileInfo;
  isOwnProfile: boolean;
};

export function ProfilePage({ profile, isOwnProfile }: ProfilePageProps) {
  const profileIsRecruiter = isRecruiter(profile.userType);
  const showProjectsSection = !(isOwnProfile && profileIsRecruiter);
  const isCenteredLayout = isOwnProfile && profileIsRecruiter;

  const profileLinks = useMemo(() => {
    const linkValues = Object.values(profile.links ?? {}).filter(Boolean);

    if (linkValues.length > 0) {
      return linkValues.slice(0, 3);
    }

    return [
      "https://ссылка-на-соцсети",
      "https://ссылка-на-портфолио",
      "https://ссылка-на-проект",
    ];
  }, [profile.links]);

  const contentClassName = [
    styles["profile-view__content"],
    isCenteredLayout ? styles["profile-view__content--centered"] : "",
    showProjectsSection ? styles["profile-view__content--with-main"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={`${styles["profile-view"]} ${
        isCenteredLayout ? styles["profile-view--recruiter-own"] : ""
      }`}
    >
      <header className={styles["profile-view__hero"]}>
        <Link href="/projects" className={styles["profile-view__brand"]}>
          Devfolio
        </Link>
      </header>

      <div className={contentClassName}>
        <aside className={styles["profile-view__sidebar"]}>
          <div className={styles["profile-view__avatar-wrap"]}>
            <div className={styles["profile-view__avatar"]}>
              {profile.avatarURL ? (
                <img
                  src={profile.avatarURL}
                  alt={`${profile.nickname || "Пользователь"} avatar`}
                  className={styles["profile-view__avatar-img"]}
                />
              ) : null}
            </div>
          </div>

          <p className={styles["profile-view__nickname"]}>
            @{profile.nickname || "nickname"}
          </p>

          <h1 className={styles["profile-view__name"]}>
            {profile.firstName || "Имя"} {profile.lastName || "Фамилия"}
          </h1>

          <span className={styles["profile-view__type-badge"]}>
            {formatUserTypeLabel(profile.userType)}
          </span>

          <div className={styles["profile-view__links-box"]}>
            {profileLinks.map((link) => (
              <a
                key={link}
                className={styles["profile-view__link-text"]}
                href={link}
                target="_blank"
                rel="noreferrer"
              >
                {link}
              </a>
            ))}
          </div>

          <div className={styles["profile-view__bio"]}>
            {profile.bio ||
              "Описание профиля появится здесь, когда пользователь заполнит блок о себе."}
          </div>
        </aside>

        {showProjectsSection ? (
          <div className={styles["profile-view__main"]}>
            <ProfileProjectsSection
              userId={pickUserId(profile) ?? profile.userId}
              isOwnProfile={isOwnProfile}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
