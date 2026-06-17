import styles from "./WelcomePage.module.scss";

export function WelcomeCard() {
  return (
    <div className={styles["welcome__card"]}>
      <div className={styles["welcome__logo"]} aria-hidden />

      <div className={styles["welcome__card-title"]}>Реализуй себя с нами</div>

      <p className={styles["welcome__card-text"]}>
        Приветствуем на платформе для молодых специалистов. Здесь вы сможете
        найти новые решения и свежее видение для своих проектов.
      </p>

      <div className={styles["welcome__card-actions"]} />
    </div>
  );
}
