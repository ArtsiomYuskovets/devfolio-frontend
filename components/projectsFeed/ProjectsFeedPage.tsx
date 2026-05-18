"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { ProfileProjectCard } from "@/components/profile/ProfileProjectCard";
import { useGetProjectsListQuery } from "@/stores/projects/projectsApi";
import { pickProjectId } from "@/lib/projectId";
import { projectCardDescription } from "@/lib/projectDisplay";
import { projectCardPreviewSrc } from "@/lib/projectImage";
import styles from "./ProjectsFeedPage.module.scss";

const FEED_PAGE_SIZE = 24;

export function ProjectsFeedPage() {
  const router = useRouter();
  const {
    data: projects = [],
    isLoading,
    isError,
    error,
  } = useGetProjectsListQuery({
    page: 0,
    size: FEED_PAGE_SIZE,
    sort: [],
  });

  return (
    <section className={styles["projects-feed"]}>
      <header className={styles["projects-feed__header"]}>
        <div className={styles["projects-feed__header-left"]}>
          <span className={styles["projects-feed__chip"]}>Лента проектов</span>
        </div>

        <Link href="/projects" className={styles["projects-feed__brand"]}>
          Devfolio
        </Link>
      </header>

      <div className={styles["projects-feed__content"]}>
        <section className={styles["projects-feed__filters"]}>
          <div className={styles["projects-feed__filters-row"]}>
          <div className={styles["projects-feed__actions"]}>
            <Button
              type="button"
              variant="outline-light"
              size="small"
              onClick={() => router.push("/projects/new")}
            >
              + Добавить проект
            </Button>
            <Button type="button" variant="outline-light" size="small">
              Фильтры
            </Button>
          </div>

            <div className={styles["projects-feed__search"]}>
              <Input
                variant="outline-light"
                className={styles["projects-feed__input"]}
                placeholder="Поиск"
                readOnly
              />
              <button
                type="button"
                className={styles["projects-feed__search-button"]}
                aria-label="Искать"
              >
                ⌕
              </button>
            </div>
          </div>

          
        </section>

        {isLoading ? (
          <p className={styles["projects-feed__status"]}>Загрузка проектов…</p>
        ) : isError ? (
          <p className={styles["projects-feed__status"]} role="alert">
            Не удалось загрузить ленту.
            {error && typeof error === "object" && "status" in error
              ? ` (${String((error as { status?: unknown }).status)})`
              : ""}
          </p>
        ) : projects.length === 0 ? (
          <p className={styles["projects-feed__status"]}>Пока нет проектов.</p>
        ) : (
          <section className={styles["projects-feed__list"]}>
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
                  className={styles["projects-feed__project-link"]}
                >
                  <ProfileProjectCard
                    title={project.name || "Без названия"}
                    description={projectCardDescription(project)}
                    likes={0}
                    views={0}
                    previewSrc={projectCardPreviewSrc(project)}
                    showFavoriteButton={false}
                  />
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </section>
  );
}
