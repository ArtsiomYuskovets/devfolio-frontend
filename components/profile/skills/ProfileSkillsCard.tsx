import { memo } from "react";
import styles from "./ProfileSkillsCard.module.scss";

type ProfileSkillsCardProps = {
  skills: string[];
};

function ProfileSkillsCardComponent({ skills }: ProfileSkillsCardProps) {
  if (skills.length === 0) {
    return (
      <p className={styles["profile-skills-card__empty"]}>
        Здесь позже появятся ключевые навыки, технологии и инструменты автора
        профиля.
      </p>
    );
  }

  return (
    <div className={styles["profile-skills-card"]}>
      {skills.map((skill) => (
        <span key={skill} className={styles["profile-skills-card__item"]}>
          {skill}
        </span>
      ))}
    </div>
  );
}

export const ProfileSkillsCard = memo(ProfileSkillsCardComponent);
