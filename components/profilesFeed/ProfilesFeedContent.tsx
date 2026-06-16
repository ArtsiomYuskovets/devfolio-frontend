"use client";

import { useState } from "react";
import { ProfilesFeedList } from "./ProfilesFeedList";
import { ProfilesFeedSearch } from "./ProfilesFeedSearch";
import styles from "./ProfilesFeedPage.module.scss";

export function ProfilesFeedContent() {
  const [appliedSearch, setAppliedSearch] = useState("");

  return (
    <div className={styles["profiles-feed__content"]}>
      <ProfilesFeedSearch applied={appliedSearch} onApply={setAppliedSearch} />
      <ProfilesFeedList key={appliedSearch} search={appliedSearch} />
    </div>
  );
}
