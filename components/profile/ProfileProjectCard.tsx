import styles from "./ProfileProjectCard.module.scss";

type ProfileProjectCardProps = {
  title: string;
  description: string;
  likes: number;
  views: number;
  showFavoriteButton?: boolean;
};

export function ProfileProjectCard({
  title,
  description,
  likes,
  views,
  showFavoriteButton = true,
}: ProfileProjectCardProps) {
  return (
    <article className={styles["profile-project-card"]}>
      <div className={styles["profile-project-card__media"]}>
        <svg
          className={styles["profile-project-card__media-icon"]}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M13 21.5C13 18.4624 15.4624 16 18.5 16H45.5C48.5376 16 51 18.4624 51 21.5V42.5C51 45.5376 48.5376 48 45.5 48H18.5C15.4624 48 13 45.5376 13 42.5V21.5Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M24 16L27.5 12H36.5L40 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="2" />
          <circle cx="21" cy="24" r="2" fill="currentColor" />
        </svg>
      </div>

      <div className={styles["profile-project-card__content"]}>
        {showFavoriteButton ? (
          <button
            type="button"
            className={styles["profile-project-card__favorite"]}
            aria-label="Добавить в избранное"
          >
            ☆
          </button>
        ) : (
          <span className={styles["profile-project-card__favorite"]} aria-hidden="true">
            ☆
          </span>
        )}

        <div className={styles["profile-project-card__title"]}>{title}</div>

        <div className={styles["profile-project-card__description"]}>
          {description}
        </div>

        <div className={styles["profile-project-card__meta"]}>
          <span>Аналитика</span>
          <span>{likes} ♥</span>
          <span>{views} 👁</span>
        </div>
      </div>
    </article>
  );
}
