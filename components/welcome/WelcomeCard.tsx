import { Button } from "@/components/ui/button/Button";
import styles from "./WelcomePage.module.scss";

type WelcomeCardProps = {
  onAboutClick?: () => void;
};

export function WelcomeCard({ onAboutClick }: WelcomeCardProps) {
  return (
    <div className={styles["welcome__card"]}>
      <div className={styles["welcome__logo"]} aria-hidden />

      <div className={styles["welcome__card-title"]}>Реализуй себя с нами</div>

      <p className={styles["welcome__card-text"]}>
        Приветствуем на платформе для молодых специалистов. Здесь вы сможете
        найти новые решения и свежее видение для своих проектов.
      </p>

      <div className={styles["welcome__card-actions"]}>
        <Button
          type="button"
          variant="primary-transparent"
          size="large"
          onClick={onAboutClick}
        >
          Про нас
        </Button>
      </div>
    </div>
  );
}
