"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FavoriteProjectItem } from "./FavoriteProjectItem";
import { pickProjectId } from "@/lib/projectId";
import { useMyUserType } from "@/hooks/useMyUserType";
import { useGetFavoritesProjectsQuery } from "@/stores/projects/projectsApi";
import styles from "../projectsFeed/ProjectsFeedPage.module.scss";

export function FavoriteProjectsPage() {
  const { isRecruiter } = useMyUserType();
  const {
    data: favorites = [],
    isLoading,
    isError,
    error,
  } = useGetFavoritesProjectsQuery();

  const entries = useMemo(
    () =>
      favorites
        .map((project) => {
          const id = pickProjectId(project) ?? project.projectId?.trim();
          return id ? ([id, project] as const) : null;
        })
        .filter((entry): entry is [string, (typeof favorites)[number]] =>
          Boolean(entry)
        ),
    [favorites]
  );

  return (
    <section className={styles["projects-feed"]}>
      <header className={styles["projects-feed__header"]}>
        <div className={styles["projects-feed__header-left"]}>
          <span className={styles["projects-feed__chip"]}>
            {isRecruiter ? "Сохранённое" : "Избранные проекты"}
          </span>
        </div>
        <Link href="/projects" className={styles["projects-feed__brand"]}>
          Devfolio
        </Link>
      </header>

      <div className={styles["projects-feed__content"]}>
        {isLoading ? (
          <p className={styles["projects-feed__status"]}>Загрузка избранного…</p>
        ) : isError ? (
          <p className={styles["projects-feed__status"]} role="alert">
            Не удалось загрузить избранное.
            {error && typeof error === "object" && "status" in error
              ? ` (${String((error as { status?: unknown }).status)})`
              : ""}
          </p>
        ) : entries.length === 0 ? (
          <p className={styles["projects-feed__status"]}>
            В избранном пока нет проектов. Откройте ленту или страницу проекта и
            нажмите ☆.
          </p>
        ) : (
          <section className={styles["projects-feed__list"]}>
            {entries.map(([projectId, project]) => (
              <FavoriteProjectItem
                key={projectId}
                projectId={projectId}
                initialProject={project}
              />
            ))}
          </section>
        )}
      </div>
    </section>
  );
}
