"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProfileCareerSection } from "./career/ProfileCareerSection";
import { ProfileAvatarImg } from "./ProfileAvatarImg";
import { ProfileProjectsSection } from "./ProfileProjectsSection";
import { ImageLightbox } from "@/components/ui/image-lightbox/ImageLightbox";
import { useProfileAvatarSrc } from "@/hooks/useProfileAvatarSrc";
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
  const showCareerSection = !profileIsRecruiter;
  const showMainColumn =
    showProjectsSection || (showCareerSection && Boolean(profile.userId));
  const isCenteredLayout = isOwnProfile && profileIsRecruiter;
  const profileUserId = pickUserId(profile) ?? profile.userId;
  const showBioInMain = showMainColumn && !isCenteredLayout;
  const avatarSrc = useProfileAvatarSrc(profile.avatarURL, profileUserId);
  const [isAvatarLightboxOpen, setIsAvatarLightboxOpen] = useState(false);

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
    showMainColumn ? styles["profile-view__content--with-main"] : "",
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
            <button
              type="button"
              className={`${styles["profile-view__avatar"]} ${
                avatarSrc ? styles["profile-view__avatar--clickable"] : ""
              }`}
              onClick={() => avatarSrc && setIsAvatarLightboxOpen(true)}
              disabled={!avatarSrc}
              aria-label="Открыть фото профиля полностью"
            >
              <ProfileAvatarImg
                avatarURL={profile.avatarURL}
                userId={profileUserId}
                alt={`${profile.nickname || "Пользователь"} avatar`}
                className={styles["profile-view__avatar-img"]}
              />
            </button>
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
            <h2 className={styles["profile-view__links-title"]}>Ссылки</h2>
            <div className={styles["profile-view__links-list"]}>
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
          </div>

          {!showBioInMain ? (
            <div className={styles["profile-view__bio"]}>
              {profile.bio ||
                "Описание профиля появится здесь, когда пользователь заполнит блок о себе."}
            </div>
          ) : null}
        </aside>

        {showMainColumn ? (
          <div className={styles["profile-view__main"]}>
            {showCareerSection && profileUserId ? (
              <ProfileCareerSection
                userId={profileUserId}
                isOwnProfile={isOwnProfile}
              />
            ) : null}
            {showBioInMain ? (
              <div className={styles["profile-view__bio"]}>
                <h2 className={styles["profile-view__bio-title"]}>О себе</h2>
                <p className={styles["profile-view__bio-text"]}>
                  {profile.bio ||
                    "Описание профиля появится здесь, когда пользователь заполнит блок о себе."}
                </p>
              </div>
            ) : null}
            {showProjectsSection ? (
              <ProfileProjectsSection
                userId={profileUserId}
                isOwnProfile={isOwnProfile}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <ImageLightbox
        images={avatarSrc ? [avatarSrc] : []}
        isOpen={isAvatarLightboxOpen}
        onClose={() => setIsAvatarLightboxOpen(false)}
        alt={`${profile.nickname || "Пользователь"} avatar`}
      />
    </section>
  );
}
