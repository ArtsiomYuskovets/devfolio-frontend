import { memo, type ReactNode } from "react";
import styles from "./ProfileFeatureCard.module.scss";

type ProfileFeatureCardProps = {
  title: string;
  children: ReactNode;
  actionLabel?: string;
  onClick?: () => void;
};

function ProfileFeatureCardComponent({
  title,
  children,
  actionLabel,
  onClick,
}: ProfileFeatureCardProps) {
  const Component = onClick ? "button" : "article";

  return (
    <Component
      type={onClick ? "button" : undefined}
      className={`${styles["profile-feature-card"]} ${
        onClick ? styles["profile-feature-card--interactive"] : ""
      }`}
      onClick={onClick}
    >
      <div className={styles["profile-feature-card__head"]}>
        <h3 className={styles["profile-feature-card__title"]}>{title}</h3>
        {actionLabel && (
          <span className={styles["profile-feature-card__link"]}>
            {actionLabel}
          </span>
        )}
      </div>
      <div className={styles["profile-feature-card__body"]}>{children}</div>
    </Component>
  );
}

export const ProfileFeatureCard = memo(ProfileFeatureCardComponent);
