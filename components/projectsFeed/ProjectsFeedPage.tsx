import Link from "next/link";
import { ProjectsFeedContent } from "./ProjectsFeedContent";
import styles from "./ProjectsFeedPage.module.scss";

export function ProjectsFeedPage() {
  return (
    <section className={styles["projects-feed"]}>
      <header className={styles["projects-feed__header"]}>
        <div className={styles["projects-feed__header-left"]}>
          <span className={styles["projects-feed__chip"]}>Лента проектов</span>
        </div>

        <Link href="/projects" className={styles["projects-feed__brand"]}>
          Devfolio
        </Link>
      </header>

      <ProjectsFeedContent />
    </section>
  );
}
