"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input/Input";
import styles from "./ProfilesFeedPage.module.scss";

type ProfilesFeedSearchProps = {
  applied: string;
  onApply: (search: string) => void;
};

export function ProfilesFeedSearch({
  applied,
  onApply,
}: ProfilesFeedSearchProps) {
  const [searchInput, setSearchInput] = useState(applied);

  useEffect(() => {
    setSearchInput(applied);
  }, [applied]);

  const applySearch = () => {
    onApply(searchInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applySearch();
    }
  };

  return (
    <section className={styles["profiles-feed__filters"]}>
      <div className={styles["profiles-feed__filters-row"]}>
        <div className={styles["profiles-feed__search"]}>
          <Input
            variant="outline-light"
            className={styles["profiles-feed__input"]}
            placeholder="Имя, фамилия или никнейм"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className={styles["profiles-feed__search-button"]}
            aria-label="Применить поиск"
            onClick={applySearch}
          >
            ⌕
          </button>
        </div>
      </div>
    </section>
  );
}
