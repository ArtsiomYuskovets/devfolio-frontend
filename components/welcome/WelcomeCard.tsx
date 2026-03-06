import { Button } from "@/components/ui/button/Button";
import styles from "./WelcomePage.module.scss";

export function WelcomeCard() {
    return (
        <div className={styles["welcome__card"]}>
            <div className={styles["welcome__logo"]}></div>

           <div className={styles["welcome__card-title"]}>
                РЕАЛИЗУЙ СЕБЯ С НАМИ
            </div>

            <p className={styles["welcome__card-text"]}>
                Приветствуем на платформе для молодых специалистов. Здесь вы
                сможете найти новые решения и свежее видение для своих проектов.
            </p>

            <div className={styles["welcome__card-actions"]}>
                <Button variant="primary-transparent" size="large">
                    ПРО НАС
                </Button>
            </div>
        </div>
    )
}