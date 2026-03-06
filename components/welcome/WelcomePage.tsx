"use client";

import { Button } from "@/components/ui/button/Button";
import styles from "./WelcomePage.module.scss";
import { WelcomeCard } from "./WelcomeCard";
import { useRouter } from "next/navigation";

export function WelcomePage() {
  const router = useRouter();

  const handleRegistration = () => {
    sessionStorage.setItem("fromWelcome", "false");
    router.push("/auth");
  };

  const handleLogin = () => {
    sessionStorage.setItem("fromWelcome", "true");
    router.push("/auth");
  };

  return (
    <main className={styles.welcome}>
      <section className={styles["welcome__left"]}>
        <WelcomeCard />
      </section>

      <section className={styles["welcome__right"]}>
        <div className={styles["welcome__right-inner"]}>
          <h1 className={styles["welcome__title"]}>ДОБРО ПОЖАЛОВАТЬ</h1>

          <div className={styles["welcome__buttons"]}>
            <Button variant="outline-dark" size="normal" onClick={handleRegistration}>
              РЕГИСТРАЦИЯ
            </Button>
            <Button variant="outline-dark" size="normal" onClick={handleLogin}>
              ВХОД
            </Button>
          </div>

          <div className={styles["welcome__footer-icons"]}>
            <span className={styles["welcome__footer-icon"]} />
            <span className={styles["welcome__footer-icon"]} />
            <span className={styles["welcome__footer-icon"]} />
            <span className={styles["welcome__footer-icon"]} />
          </div>
        </div>
      </section>
    </main>
  );
}

