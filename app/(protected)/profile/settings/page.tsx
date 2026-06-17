import styles from "./settings.module.scss";

export default function ProfileSettingsPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Настройки</h1>
      </header>
      <p className={styles.lead}>
        Здесь будут настройки аккаунта.
      </p>
    </main>
  );
}
