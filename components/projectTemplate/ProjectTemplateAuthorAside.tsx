import Link from "next/link";
import { Button } from "@/components/ui/button/Button";
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
  return (
    <aside className={styles["project-template__author"]}>
      <div
        className={styles["project-template__avatar"]}
        style={
          authorProfile?.avatarURL
            ? {
                backgroundImage: `url(${authorProfile.avatarURL})`,
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
      <div className={styles["project-template__author-actions"]}>
        <Button type="button" variant="outline-dark" size="normal">
          Написать исполнителю
        </Button>
        <Button type="button" variant="outline-dark" size="normal">
          Подписаться
        </Button>
      </div>
    </aside>
  );
}
