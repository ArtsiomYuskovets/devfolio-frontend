import { ProfilesFeedContent } from "./ProfilesFeedContent";
import { ProfilesFeedHeader } from "./ProfilesFeedHeader";
import styles from "./ProfilesFeedPage.module.scss";

export function ProfilesFeedPage() {
  return (
    <section className={styles["profiles-feed"]}>
      <ProfilesFeedHeader />
      <ProfilesFeedContent />
    </section>
  );
}
