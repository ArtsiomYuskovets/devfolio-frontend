"use client";

import type { SetStateAction } from "react";
import { memo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button/Button";
import type { ProfileCareerEntry } from "@/types/types";
import { CareerEntryEditorCard } from "./CareerEntryEditorCard";
import { CareerEntryTimelineCard } from "./CareerEntryTimelineCard";
import {
  createEmptyCareerEntry,
  normalizeCareerEntryDates,
} from "./career.utils";
import styles from "./ProfileCareerModal.module.scss";

type ProfileCareerModalProps = {
  isOpen: boolean;
  isOwnProfile: boolean;
  entries: ProfileCareerEntry[];
  onClose: () => void;
  onChange: (value: SetStateAction<ProfileCareerEntry[]>) => void;
  onSave?: () => void;
  isSaving?: boolean;
  saveError?: string | null;
};

function ProfileCareerModalComponent({
  isOpen,
  isOwnProfile,
  entries,
  onClose,
  onChange,
  onSave,
  isSaving = false,
  saveError = null,
}: ProfileCareerModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [isOpen]);

  const handleEntryChange = useCallback(
    (entryId: string, nextEntry: ProfileCareerEntry) => {
      onChange((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? normalizeCareerEntryDates(nextEntry) : entry
        )
      );
    },
    [onChange]
  );

  const handleAddEntry = useCallback(() => {
    onChange((prev) => [...prev, createEmptyCareerEntry()]);
  }, [onChange]);

  const handleRemoveEntry = useCallback(
    (entryId: string) => {
      onChange((prev) => prev.filter((entry) => entry.id !== entryId));
    },
    [onChange]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles["career-modal"]} role="dialog" aria-modal="true">
      <button
        type="button"
        className={styles["career-modal__backdrop"]}
        onClick={onClose}
        aria-label="Закрыть модальное окно"
      />

      <div className={styles["career-modal__panel"]}>
        <div className={styles["career-modal__hero"]}>
          <div className={styles["career-modal__hero-content"]}>
            <span className={styles["career-modal__eyebrow"]}>
              Гибридный таймлайн
            </span>
            <h2 className={styles["career-modal__title"]}>Карьера и развитие</h2>
            <p className={styles["career-modal__subtitle"]}>
              {isOwnProfile
                ? "Соберите в одном месте стажировки, работу, курсы и учебу."
                : "Единая хронология карьерного пути, учебы и профессионального развития пользователя."}
            </p>
          </div>

          <button
            type="button"
            className={styles["career-modal__close"]}
            onClick={onClose}
            aria-label="Закрыть модальное окно"
          >
            ×
          </button>
        </div>

        <div className={styles["career-modal__body"]}>
          <div className={styles["career-modal__content"]}>
            {isOwnProfile && (
              <div className={styles["career-modal__toolbar"]}>
                <Button
                  type="button"
                  variant="outline-dark"
                  size="normal"
                  onClick={handleAddEntry}
                  disabled={isSaving}
                >
                  + Добавить запись
                </Button>
                {onSave ? (
                  <Button
                    type="button"
                    variant="outline-dark"
                    size="normal"
                    onClick={onSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Сохранение…" : "Сохранить"}
                  </Button>
                ) : null}
              </div>
            )}

            {saveError ? (
              <p className={styles["career-modal__error"]} role="alert">
                {saveError}
              </p>
            ) : null}

            <div className={styles["career-modal__list"]}>
              {entries.map((entry) =>
                isOwnProfile ? (
                  <CareerEntryEditorCard
                    key={entry.id}
                    entry={entry}
                    onChange={handleEntryChange}
                    onRemove={handleRemoveEntry}
                  />
                ) : (
                  <CareerEntryTimelineCard key={entry.id} entry={entry} />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProfileCareerModal = memo(ProfileCareerModalComponent);
