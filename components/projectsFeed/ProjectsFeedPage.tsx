"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { ProfileProjectCard } from "@/components/profile/ProfileProjectCard";
import styles from "./ProjectsFeedPage.module.scss";

type FeedProjectTemplate = {
  id: string;
  title: string;
  description: string;
  likes: number;
  views: number;
};

const projectsTemplates: FeedProjectTemplate[] = [
  {
    id: "project-1",
    title: "Найти backend-разработчика",
    description: "Ищу backend-разработчика для pet-проекта с авторизацией и API.",
    likes: 8,
    views: 52,
  },
  {
    id: "project-2",
    title: "Лендинг для стартапа",
    description: "Нужен дизайнер + frontend для сборки адаптивного лендинга.",
    likes: 5,
    views: 31,
  },
  {
    id: "project-3",
    title: "Мобильное MVP",
    description: "Собираем команду на React Native для запуска MVP за 2 месяца.",
    likes: 14,
    views: 77,
  },
  {
    id: "project-4",
    title: "Админка CRM",
    description: "Требуется разработчик на Next.js и RTK Query для внутренней CRM.",
    likes: 10,
    views: 43,
  },
  {
    id: "project-5",
    title: "Телеграм-бот аналитики",
    description: "Разработка бота и интеграция с внешним API и BI-дашбордом.",
    likes: 6,
    views: 29,
  },
  {
    id: "project-6",
    title: "Платформа для фриланса",
    description: "Ищу fullstack разработчика для сервиса с чатами и платежами.",
    likes: 17,
    views: 90,
  },
];

export function ProjectsFeedPage() {
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
            <div className={styles["projects-feed__switcher"]}>
              <button type="button" aria-label="Предыдущий">
                ‹
              </button>
              <button type="button" aria-label="Следующий">
                ›
              </button>
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

          <div className={styles["projects-feed__actions"]}>
            <Button type="button" variant="outline-light" size="small">
              + Добавить проект
            </Button>
            <Button type="button" variant="outline-light" size="small">
              Фильтры
            </Button>
          </div>
        </section>

        <section className={styles["projects-feed__list"]}>
          {projectsTemplates.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className={styles["projects-feed__project-link"]}
            >
              <ProfileProjectCard
                title={project.title}
                description={project.description}
                likes={project.likes}
                views={project.views}
                showFavoriteButton={false}
              />
            </Link>
          ))}
        </section>
      </div>
    </section>
  );
}
