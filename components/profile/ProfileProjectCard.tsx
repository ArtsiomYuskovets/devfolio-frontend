"use client";

import { useEffect, useState } from "react";
import { ProjectFavoriteButton } from "@/components/projects/ProjectFavoriteButton";
import styles from "./ProfileProjectCard.module.scss";

type ProfileProjectCardProps = {
  title: string;
  description: string;
  likes: number;
  views: number;
  previewSrc?: string;
  showFavoriteButton?: boolean;
  projectId?: string;
  ownerUserId?: string;
};

export function ProfileProjectCard({
  title,
  description,
  likes,
  views,
  previewSrc,
  showFavoriteButton = true,
  projectId,
  ownerUserId,
}: ProfileProjectCardProps) {
  const [imgHidden, setImgHidden] = useState(false);

  useEffect(() => {
    setImgHidden(false);
  }, [previewSrc]);

  const showPhoto = Boolean(previewSrc) && !imgHidden;

  return (
    <article className={styles["profile-project-card"]}>
      <div
        className={`${styles["profile-project-card__media"]} ${
          showPhoto ? styles["profile-project-card__media--photo"] : ""
        }`}
      >
        {showPhoto && previewSrc ? (
          <img
            src={previewSrc}
            alt=""
            className={styles["profile-project-card__media-img"]}
            loading="lazy"
            decoding="async"
            onError={() => setImgHidden(true)}
          />
        ) : (
          <svg
            className={styles["profile-project-card__media-icon"]}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M13 21.5C13 18.4624 15.4624 16 18.5 16H45.5C48.5376 16 51 18.4624 51 21.5V42.5C51 45.5376 48.5376 48 45.5 48H18.5C15.4624 48 13 45.5376 13 42.5V21.5Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M24 16L27.5 12H36.5L40 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="2" />
            <circle cx="21" cy="24" r="2" fill="currentColor" />
          </svg>
        )}
      </div>

      <div className={styles["profile-project-card__content"]}>
        {showFavoriteButton && projectId ? (
          <ProjectFavoriteButton
            projectId={projectId}
            ownerUserId={ownerUserId}
            className={styles["profile-project-card__favorite"]}
            activeClassName={styles["profile-project-card__favorite--active"]}
            disabledClassName={styles["profile-project-card__favorite--disabled"]}
          />
        ) : showFavoriteButton ? (
          <span
            className={styles["profile-project-card__favorite"]}
            aria-hidden="true"
          >
            ☆
          </span>
        ) : (
          <span className={styles["profile-project-card__favorite"]} aria-hidden="true">
            ☆
          </span>
        )}

        <div className={styles["profile-project-card__title"]}>{title}</div>

        <div className={styles["profile-project-card__description"]}>
          {description}
        </div>

        <div className={styles["profile-project-card__meta"]}>
          <span className={styles["profile-project-card__stat"]}>
            <span className={styles["profile-project-card__stat-icon"]} aria-hidden>
              ♥
            </span>
            <span className={styles["profile-project-card__stat-value"]}>
              {likes}
            </span>
          </span>
          <span className={styles["profile-project-card__stat"]}>
            <span className={styles["profile-project-card__stat-icon"]} aria-hidden>
              👁
            </span>
            <span className={styles["profile-project-card__stat-value"]}>
              {views}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
