"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { ProfileAvatarImg } from "@/components/profile/ProfileAvatarImg";
import { useMyUserType } from "@/hooks/useMyUserType";
import { useGetUserFeedQuery } from "@/stores/user/userApi";
import { formatUserTypeLabel } from "@/lib/userType";
import styles from "./ProfilesFeedPage.module.scss";

const FEED_PAGE_SIZE = 10;

type ProfilesFeedListProps = {
  search: string;
};

export function ProfilesFeedList({ search }: ProfilesFeedListProps) {
  const { isRecruiter } = useMyUserType();
  const [page, setPage] = useState(0);

  const {
    data: profiles = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetUserFeedQuery({
    page,
    size: FEED_PAGE_SIZE,
    sort: [],
    search: search || undefined,
  });

  const visibleProfiles = useMemo(() => {
    if (!isRecruiter) {
      return profiles;
    }
    return profiles.filter((profile) => profile.userType === "JOB_SEEKER");
  }, [profiles, isRecruiter]);

  const canGoPrev = page > 0;
  const canGoNext = profiles.length === FEED_PAGE_SIZE;
  const isInitialLoading = isLoading && profiles.length === 0;

  if (isInitialLoading) {
    return (
      <p className={styles["profiles-feed__status"]}>Загрузка профилей…</p>
    );
  }

  if (isError && profiles.length === 0) {
    return (
      <p className={styles["profiles-feed__status"]} role="alert">
        Не удалось загрузить ленту профилей.
        {error && typeof error === "object" && "status" in error
          ? ` (${String((error as { status?: unknown }).status)})`
          : ""}
      </p>
    );
  }

  if (visibleProfiles.length === 0) {
    return (
      <p className={styles["profiles-feed__status"]}>
        {search.trim()
          ? "По запросу профилей не найдено."
          : isRecruiter
            ? "Пока нет кандидатов."
            : "Пока нет профилей."}
      </p>
    );
  }

  return (
    <>
      <section
        className={`${styles["profiles-feed__list"]} ${
          isFetching ? styles["profiles-feed__list--fetching"] : ""
        }`}
        aria-busy={isFetching}
      >
        {visibleProfiles.map((profile) => (
          <Link
            key={profile.userId}
            href={`/profile/${profile.userId}`}
            className={styles["profiles-feed__card"]}
          >
            <div className={styles["profiles-feed__avatar"]}>
              <ProfileAvatarImg
                avatarURL={profile.avatarURL}
                userId={profile.userId}
                alt={`${profile.nickname} avatar`}
                className={styles["profiles-feed__avatar-img"]}
              />
            </div>
            <div className={styles["profiles-feed__body"]}>
              <h3 className={styles["profiles-feed__name"]}>
                {profile.displayName || profile.nickname}
              </h3>
              <p className={styles["profiles-feed__nickname"]}>
                @{profile.nickname}
              </p>
              <p className={styles["profiles-feed__type"]}>
                {formatUserTypeLabel(profile.userType)}
              </p>
              <p className={styles["profiles-feed__bio"]}>
                {profile.bioSnippet ||
                  "Пользователь пока не добавил описание"}
              </p>
            </div>
          </Link>
        ))}
      </section>

      <div className={styles["profiles-feed__pagination"]}>
        <Button
          type="button"
          variant="outline-light"
          size="small"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={!canGoPrev || isFetching}
        >
          Назад
        </Button>
        <span className={styles["profiles-feed__page-label"]}>
          Страница {page + 1}
        </span>
        <Button
          type="button"
          variant="outline-light"
          size="small"
          onClick={() => setPage((p) => p + 1)}
          disabled={!canGoNext || isFetching}
        >
          Вперёд
        </Button>
      </div>
    </>
  );
}
