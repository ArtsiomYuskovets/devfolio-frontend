"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/Button";
import { ProfileProjectCard } from "./ProfileProjectCard";
import { useGetUsersProjectsQuery } from "@/stores/projects/projectsApi";
import { pickProjectId } from "@/lib/projectId";
import { projectCardDescription } from "@/lib/projectDisplay";
import { projectCardPreviewSrc } from "@/lib/projectImage";
import styles from "./ProfileProjectsSection.module.scss";

type ProfileProjectsSectionProps = {
  userId: string;
  isOwnProfile: boolean;
};

const PROFILE_PROJECTS_PAGE_SIZE = 6;

export function ProfileProjectsSection({
  userId,
  isOwnProfile,
}: ProfileProjectsSectionProps) {
  const router = useRouter();
  const {
    data: projects = [],
    isLoading,
    isError,
    error,
  } = useGetUsersProjectsQuery(
    {
      userId,
      page: 0,
      size: PROFILE_PROJECTS_PAGE_SIZE,
    },
    { skip: !userId }
  );
  const hasProjects = projects.length > 0;

  return (
    <section className={styles["profile-projects"]}>
      <div className={styles["profile-projects__actions"]}>
        {isOwnProfile ? (
          <>
            <Button
              type="button"
              variant="outline-dark"
              size="normal"
              onClick={() => router.push("/projects/new")}
            >
              + Добавить проект
            </Button>
            <Button type="button" variant="outline-dark" size="normal">
              Редактировать текущие
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline-dark" size="large">
              Написать исполнителю
            </Button>
            <Button type="button" variant="outline-dark" size="large">
              Подписаться
            </Button>
          </>
        )}
      </div>

      {hasProjects ? (
        <div className={styles["profile-projects__list"]}>
          {projects.map((project) => {
            const id =
              pickProjectId(project) ?? project.projectId?.trim() ?? "";
            if (!id) {
              return null;
            }
            return (
              <Link
                key={id}
                href={`/project/${id}`}
                className={styles["profile-projects__card-link"]}
              >
                <ProfileProjectCard
                  title={project.name || "Без названия"}
                  description={projectCardDescription(project)}
                  likes={0}
                  views={0}
                  previewSrc={projectCardPreviewSrc(project)}
                />
              </Link>
            );
          })}
        </div>
      ) : isLoading ? (
        <p className={styles["profile-projects__status"]}>Загрузка проектов…</p>
      ) : isError ? (
        <p className={styles["profile-projects__status"]} role="alert">
          Не удалось загрузить проекты.
          {error && typeof error === "object" && "status" in error
            ? ` (${String((error as { status?: unknown }).status)})`
            : ""}
        </p>
      ) : (
        <p className={styles["profile-projects__status"]}>Пока нет проектов.</p>
      )}
    </section>
  );
}
