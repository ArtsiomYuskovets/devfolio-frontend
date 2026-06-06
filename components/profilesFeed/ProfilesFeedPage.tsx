"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { useMyUserType } from "@/hooks/useMyUserType";
import { useGetUserFeedQuery } from "@/stores/user/userApi";
import { formatUserTypeLabel } from "@/lib/userType";
import styles from "./ProfilesFeedPage.module.scss";

const FEED_PAGE_SIZE = 10;

export function ProfilesFeedPage() {
  const { isRecruiter } = useMyUserType();
  const [page, setPage] = useState(0);
  const {
    data: profiles = [],
    isLoading,
    isError,
    error,
  } = useGetUserFeedQuery({
    page,
    size: FEED_PAGE_SIZE,
    sort: [],
  });

  const visibleProfiles = useMemo(() => {
    if (!isRecruiter) {
      return profiles;
    }
    return profiles.filter((profile) => profile.userType === "JOB_SEEKER");
  }, [profiles, isRecruiter]);

  const canGoPrev = page > 0;
  const canGoNext = profiles.length === FEED_PAGE_SIZE;

  return (
    <section className={styles["profiles-feed"]}>
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

      <div className={styles["profiles-feed__content"]}>
        {isLoading ? (
          <p className={styles["profiles-feed__status"]}>Загрузка профилей…</p>
        ) : isError ? (
          <p className={styles["profiles-feed__status"]} role="alert">
            Не удалось загрузить ленту профилей.
            {error && typeof error === "object" && "status" in error
              ? ` (${String((error as { status?: unknown }).status)})`
              : ""}
          </p>
        ) : visibleProfiles.length === 0 ? (
          <p className={styles["profiles-feed__status"]}>
            {isRecruiter ? "Пока нет кандидатов." : "Пока нет профилей."}
          </p>
        ) : (
          <>
            <section className={styles["profiles-feed__list"]}>
              {visibleProfiles.map((profile) => (
                <Link
                  key={profile.userId}
                  href={`/profile/${profile.userId}`}
                  className={styles["profiles-feed__card"]}
                >
                  <div className={styles["profiles-feed__avatar"]}>
                    {profile.avatarURL ? (
                      <img
                        src={profile.avatarURL}
                        alt={`${profile.nickname} avatar`}
                        className={styles["profiles-feed__avatar-img"]}
                      />
                    ) : null}
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
                disabled={!canGoPrev || isLoading}
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
                disabled={!canGoNext || isLoading}
              >
                Вперёд
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
