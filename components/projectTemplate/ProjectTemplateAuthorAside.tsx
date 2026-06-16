"use client";

import Link from "next/link";
import { useProfileAvatarSrc } from "@/hooks/useProfileAvatarSrc";import { pickUserId } from "@/lib/userId";
import type { UserProfileInfo } from "@/types/types";
import styles from "./ProjectTemplate.module.scss";

type ProjectTemplateAuthorAsideProps = {
  authorName: string;
  authorProfile?: UserProfileInfo;
  authorProfileHref?: string;
};

export function ProjectTemplateAuthorAside({
  authorName,
  authorProfile,
  authorProfileHref,
}: ProjectTemplateAuthorAsideProps) {
  const authorUserId = authorProfile
    ? pickUserId(authorProfile) ?? authorProfile.userId
    : undefined;
  const avatarSrc = useProfileAvatarSrc(
    authorProfile?.avatarURL,
    authorUserId
  );

  return (
    <aside className={styles["project-template__author"]}>
      <div
        className={styles["project-template__avatar"]}
        style={
          avatarSrc
            ? {
                backgroundImage: `url(${avatarSrc})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      />
      <h2 className={styles["project-template__author-name"]}>{authorName}</h2>
      {authorProfileHref ? (
        <Link
          href={authorProfileHref}
          className={styles["project-template__author-link"]}
        >
          Открыть профиль
        </Link>
      ) : null}
    </aside>  );
}
