"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProfileCareerEntry } from "@/types/types";
import {
  useGetUserCareerQuery,
  useUpdateMyCareerMutation,
} from "@/stores/user/userApi";
import { ProfileFeatureCard } from "@/components/profile/featureCard/ProfileFeatureCard";
import { CareerTimelinePreview } from "./CareerTimelinePreview";
import { ProfileCareerModal } from "./ProfileCareerModal";
import {
  mapCareerEntriesToPayload,
  sortCareerEntries,
} from "./career.utils";
import styles from "./ProfileCareerSection.module.scss";

type ProfileCareerSectionProps = {
  userId: string;
  isOwnProfile: boolean;
};

export function ProfileCareerSection({
  userId,
  isOwnProfile,
}: ProfileCareerSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftEntries, setDraftEntries] = useState<ProfileCareerEntry[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: careerEntries = [],
    isLoading,
    isError,
  } = useGetUserCareerQuery(userId, { skip: !userId });

  const [updateMyCareer, { isLoading: isSaving }] = useUpdateMyCareerMutation();

  const entries = useMemo(
    () => sortCareerEntries(careerEntries),
    [careerEntries]
  );

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }
    setDraftEntries(entries);
    setSaveError(null);
  }, [isModalOpen, entries]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (isSaving) {
      return;
    }
    setIsModalOpen(false);
    setSaveError(null);
  }, [isSaving]);

  const handleSave = useCallback(async () => {
    if (!isOwnProfile) {
      return;
    }

    setSaveError(null);

    try {
      await updateMyCareer({
        userId,
        payload: mapCareerEntriesToPayload(draftEntries),
      }).unwrap();
      setIsModalOpen(false);
    } catch {
      setSaveError("Не удалось сохранить карьеру. Попробуйте ещё раз.");
    }
  }, [draftEntries, isOwnProfile, updateMyCareer, userId]);

  const previewEntries = entries.slice(0, 2);
  const actionLabel = isOwnProfile ? "Редактировать" : "Подробнее";

  return (
    <>
      <ProfileFeatureCard
        title="О карьере"
        actionLabel={actionLabel}
        onClick={openModal}
      >
        {isLoading ? (
          <p className={styles["profile-career-section__status"]}>
            Загрузка карьеры…
          </p>
        ) : isError ? (
          <p className={styles["profile-career-section__status"]} role="alert">
            Не удалось загрузить карьеру.
          </p>
        ) : previewEntries.length > 0 ? (
          <CareerTimelinePreview entries={previewEntries} />
        ) : (
          <p className={styles["profile-career-section__status"]}>
            {isOwnProfile
              ? "Добавьте опыт работы, учёбу и курсы — они появятся в хронологии."
              : "Пользователь пока не заполнил карьерный путь."}
          </p>
        )}
      </ProfileFeatureCard>

      <ProfileCareerModal
        isOpen={isModalOpen}
        isOwnProfile={isOwnProfile}
        entries={isOwnProfile ? draftEntries : entries}
        onClose={closeModal}
        onChange={setDraftEntries}
        onSave={isOwnProfile ? handleSave : undefined}
        isSaving={isSaving}
        saveError={saveError}
      />
    </>
  );
}
