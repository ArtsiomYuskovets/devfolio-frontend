"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/Button";
import { AUTH_PATH } from "@/lib/routes";
import { useAppSelector } from "@/stores/auth/hooks";
import styles from "./WelcomePage.module.scss";
import { WelcomeCard } from "./WelcomeCard";

const WELCOME_FEATURES = [
  "Публикуйте проекты и показывайте реальные навыки",
  "Ищите идеи в ленте проектов или кандидатов в ленте профилей",
  "Сохраняйте интересное в избранное и возвращайтесь к нему позже",
] as const;

export function WelcomePage() {
  const router = useRouter();
  const featuresRef = useRef<HTMLElement>(null);
  const { accessToken, accessTokenExpiresAt } = useAppSelector((state) => state.auth);

  const isAuthenticated =
    !!accessToken &&
    !!accessTokenExpiresAt &&
    Date.now() < accessTokenExpiresAt;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/profile");
    }
  }, [isAuthenticated, router]);

  const handleRegistration = () => {
    sessionStorage.setItem("fromWelcome", "false");
    router.push(AUTH_PATH);
  };

  const handleLogin = () => {
    sessionStorage.setItem("fromWelcome", "true");
    router.push(AUTH_PATH);
  };

  const handleAbout = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className={styles.welcome}>
      <section className={styles["welcome__left"]}>
        <WelcomeCard onAboutClick={handleAbout} />
      </section>

      <section className={styles["welcome__right"]}>
        <div className={styles["welcome__right-inner"]}>
          <div className={styles["welcome__hero"]}>
            <p className={styles["welcome__brand"]}>Devfolio</p>
            <h1 className={styles["welcome__title"]}>Добро пожаловать</h1>
            <p className={styles["welcome__subtitle"]}>
              Платформа портфолио для молодых специалистов и рекрутёров:
              проекты, профили и верификация навыков в одном месте.
            </p>
          </div>

          <div className={styles["welcome__buttons"]}>
            <Button variant="outline-dark" size="normal" onClick={handleRegistration}>
              Регистрация
            </Button>
            <Button variant="outline-dark" size="normal" onClick={handleLogin}>
              Вход
            </Button>
          </div>

          <section
            ref={featuresRef}
            className={styles["welcome__features"]}
            aria-label="Возможности платформы"
          >
            <h2 className={styles["welcome__features-title"]}>Что внутри</h2>
            <ul className={styles["welcome__features-list"]}>
              {WELCOME_FEATURES.map((feature) => (
                <li key={feature} className={styles["welcome__features-item"]}>
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
