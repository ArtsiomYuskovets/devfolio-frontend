"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ProfileProjectsSection } from "./ProfileProjectsSection";
import { ProfileCareerModal } from "./career/ProfileCareerModal";
import { CareerTimelinePreview } from "./career/CareerTimelinePreview";
import {
  getDefaultCareerEntries,
  sortCareerEntries,
} from "./career/career.utils";
import { ProfileFeatureCard } from "./featureCard/ProfileFeatureCard";
import { ProfileSkillsCard } from "./skills/ProfileSkillsCard";
import type { ProfileCareerEntry, UserProfileInfo } from "@/types/types";
import { pickUserId } from "@/lib/userId";
import styles from "./ProfilePage.module.scss";

type ProfilePageProps = {
  profile: UserProfileInfo;
  isOwnProfile: boolean;
};

export function ProfilePage({ profile, isOwnProfile }: ProfilePageProps) {
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [careerEntries, setCareerEntries] = useState<ProfileCareerEntry[]>(
    profile.careerTimeline?.length
      ? profile.careerTimeline
      : getDefaultCareerEntries(isOwnProfile)
  );

  const profileLinks = useMemo(() => {
    const linkValues = Object.values(profile.links ?? {}).filter(Boolean);

    if (linkValues.length > 0) {
      return linkValues.slice(0, 3);
    }

    return [
      "https://ссылка-на-соцсети",
      "https://ссылка-на-портфолио",
      "https://ссылка-на-проект",
    ];
  }, [profile.links]);

  const skills = useMemo(() => profile.skills.filter(Boolean), [profile.skills]);
  const sortedCareerEntries = useMemo(
    () => sortCareerEntries(careerEntries),
    [careerEntries]
  );

  const handleCareerModalOpen = useCallback(
    () => setIsCareerModalOpen(true),
    []
  );
  const handleCareerModalClose = useCallback(
    () => {
      setCareerEntries((currentEntries) => sortCareerEntries(currentEntries));
      setIsCareerModalOpen(false);
    },
    []
  );

  return (
    <>
      <section className={styles["profile-view"]}>
        <header className={styles["profile-view__hero"]}>
          <Link href="/projects" className={styles["profile-view__brand"]}>
            Devfolio
          </Link>
        </header>

        <div className={styles["profile-view__content"]}>
          <aside className={styles["profile-view__sidebar"]}>
            <div className={styles["profile-view__avatar-wrap"]}>
              <div className={styles["profile-view__avatar"]} />
            </div>

            <p className={styles["profile-view__nickname"]}>
              @{profile.nickname || "nickname"}
            </p>

            <h1 className={styles["profile-view__name"]}>
              {profile.firstName || "Имя"} {profile.lastName || "Фамилия"}
            </h1>

            <div className={styles["profile-view__stats"]}>
              <div className={styles["profile-view__stat"]}>1 подписчик</div>
              <div className={styles["profile-view__stat"]}>7 подписок</div>
            </div>

            <div className={styles["profile-view__links-box"]}>
              {profileLinks.map((link) => (
                <p key={link} className={styles["profile-view__link-text"]}>
                  {link}
                </p>
              ))}
            </div>

            <div className={styles["profile-view__bio"]}>
              {profile.bio || "Описание профиля появится здесь, когда пользователь заполнит блок о себе."}
            </div>
          </aside>

          <div className={styles["profile-view__main"]}>
            <section className={styles["profile-view__features"]}>
              <ProfileFeatureCard
                title="Карьера и развитие"
                actionLabel="Открыть"
                onClick={handleCareerModalOpen}
              >
                <CareerTimelinePreview entries={sortedCareerEntries} />
              </ProfileFeatureCard>

              <ProfileFeatureCard title="Навыки">
                <ProfileSkillsCard skills={skills} />
              </ProfileFeatureCard>
            </section>

            <ProfileProjectsSection
              userId={pickUserId(profile) ?? profile.userId}
              isOwnProfile={isOwnProfile}
            />
          </div>
        </div>
      </section>

      <ProfileCareerModal
        isOpen={isCareerModalOpen}
        isOwnProfile={isOwnProfile}
        entries={careerEntries}
        onClose={handleCareerModalClose}
        onChange={setCareerEntries}
      />
    </>
  );
}
