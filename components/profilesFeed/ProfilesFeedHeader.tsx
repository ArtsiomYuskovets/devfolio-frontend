"use client";

import Link from "next/link";
import { useMyUserType } from "@/hooks/useMyUserType";
import styles from "./ProfilesFeedPage.module.scss";

export function ProfilesFeedHeader() {
  const { isRecruiter } = useMyUserType();

  return (
    <header className={styles["profiles-feed__header"]}>
      <div className={styles["profiles-feed__header-left"]}>
        <span className={styles["profiles-feed__chip"]}>
          {isRecruiter ? "Кандидаты" : "Лента профилей"}
        </span>
      </div>
      <Link href="/projects" className={styles["profiles-feed__brand"]}>
        Devfolio
      </Link>
    </header>
  );
}
