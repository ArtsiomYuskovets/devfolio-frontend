import type { ProjectViewSkill } from "./projectTemplate.utils";
import styles from "./ProjectTemplate.module.scss";

type ProjectTemplateSkillsProps = {
  skills: ProjectViewSkill[];
  isLoading: boolean;
};

export function ProjectTemplateSkills({
  skills,
  isLoading,
}: ProjectTemplateSkillsProps) {
  return (
    <article
      className={`${styles["project-template__panel"]} ${styles["project-template__panel--skills"]}`}
    >
      <h2 className={styles["project-template__panel-title"]}>Навыки</h2>
      {isLoading ? (
        <p className={styles["project-template__panel-text"]}>Загрузка навыков…</p>
      ) : skills.length > 0 ? (
        <div className={styles["project-template__skills"]}>
          {skills.map((skill) => (
            <span
              key={skill.key}
              className={`${styles["project-template__skill"]} ${
                skill.verified
                  ? styles["project-template__skill--verified"]
                  : styles["project-template__skill--unverified"]
              }`}
            >
              {skill.label}
            </span>
          ))}
        </div>
      ) : (
        <p className={styles["project-template__panel-text"]}>
          Навыки для проекта пока не добавлены.
        </p>
      )}
    </article>
  );
}
