import { Button } from "@/components/ui/button/Button";
import { ProfileProjectCard } from "./ProfileProjectCard";
import styles from "./ProfileProjectsSection.module.scss";

type ProfileProjectsSectionProps = {
  isOwnProfile: boolean;
};

const placeholderProjects = [
  {
    title: "Имя проекта",
    description: "Описание проекта...",
    likes: 22,
    views: 22,
  },
  {
    title: "Имя проекта",
    description: "Описание проекта...",
    likes: 22,
    views: 22,
  },
];

export function ProfileProjectsSection({
  isOwnProfile,
}: ProfileProjectsSectionProps) {
  return (
    <section className={styles["profile-projects"]}>
      <div className={styles["profile-projects__actions"]}>
        {isOwnProfile ? (
          <>
            <Button type="button" variant="outline-dark" size="normal">
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

      <div className={styles["profile-projects__list"]}>
        {placeholderProjects.map((project, index) => (
          <ProfileProjectCard
            key={`${project.title}-${index}`}
            title={project.title}
            description={project.description}
            likes={project.likes}
            views={project.views}
          />
        ))}
      </div>
    </section>
  );
}
