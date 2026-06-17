"use client";

import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import {
  useDeleteProjectImageMutation,
  useDeleteProjectPreviewImageMutation,
  useUploadPreviewImageMutation,
  useUploadProjectPhotoMutation,
} from "@/stores/projects/projectsApi";
import { buildProjectEditorPhotoSlots } from "@/lib/projectImage";
import { IMAGE_UPLOAD_HINT, validateImageFile } from "@/lib/formValidation";
import type { Project } from "@/types/types";
import editorStyles from "./ProjectTemplateEditor.module.scss";

const PHOTO_SLOT_COUNT = 5;

type ProjectTemplateEditorPhotosProps = {
  projectId: string;
  project: Project;
};

export function ProjectTemplateEditorPhotos({
  projectId,
  project,
}: ProjectTemplateEditorPhotosProps) {
  const slots = useMemo(
    () => buildProjectEditorPhotoSlots(project, PHOTO_SLOT_COUNT),
    [project]
  );

  const [uploadPreviewImage, { isLoading: isUploadingPreview }] =
    useUploadPreviewImageMutation();
  const [uploadProjectPhoto, { isLoading: isUploadingPhoto }] =
    useUploadProjectPhotoMutation();
  const [deleteProjectPreviewImage, { isLoading: isDeletingPreview }] =
    useDeleteProjectPreviewImageMutation();
  const [deleteProjectImage, { isLoading: isDeletingImage }] =
    useDeleteProjectImageMutation();

  const [busySlot, setBusySlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isBusy =
    isUploadingPreview ||
    isUploadingPhoto ||
    isDeletingPreview ||
    isDeletingImage ||
    busySlot !== null;

  const handleAdd = useCallback(
    async (index: number, event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) {
        return;
      }

      const fileValidation = validateImageFile(file);
      if (!fileValidation.isValid) {
        setError(fileValidation.error ?? "Некорректный файл");
        return;
      }

      setError(null);
      setBusySlot(index);

      try {
        if (index === 0) {
          await uploadPreviewImage({ projectId, image: file }).unwrap();
        } else {
          await uploadProjectPhoto({ projectId, photo: file }).unwrap();
        }
      } catch {
        setError("Не удалось загрузить фото");
      } finally {
        setBusySlot(null);
      }
    },
    [projectId, uploadPreviewImage, uploadProjectPhoto]
  );

  const handleRemove = useCallback(
    async (index: number) => {
      const slot = slots[index];
      if (!slot) {
        return;
      }

      setError(null);
      setBusySlot(index);

      try {
        if (slot.role === "preview") {
          await deleteProjectPreviewImage({ projectId }).unwrap();
        } else {
          await deleteProjectImage({
            projectId,
            imageUrl: slot.deleteUrl,
          }).unwrap();
        }
      } catch {
        setError("Не удалось удалить фото");
      } finally {
        setBusySlot(null);
      }
    },
    [
      deleteProjectImage,
      deleteProjectPreviewImage,
      projectId,
      slots,
    ]
  );

  return (
    <div className={editorStyles["project-template-editor__photos"]}>
      <h3 className={editorStyles["project-template-editor__photos-title"]}>
        Фотографии
      </h3>
      <p className={editorStyles["project-template-editor__photos-hint"]}>
        Первый слот — превью, остальные — галерея. {IMAGE_UPLOAD_HINT} Можно
        добавлять и удалять фото без сохранения текста проекта.
      </p>

      <div className={editorStyles["project-template-editor__photo-grid"]}>
        {slots.map((slot, index) => {
          const slotBusy = busySlot === index;
          const isPreviewSlot = index === 0;

          return (
            <div
              key={index}
              className={`${editorStyles["project-template-editor__photo-slot"]} ${
                slot
                  ? editorStyles["project-template-editor__photo-slot--filled"]
                  : ""
              } ${
                isPreviewSlot
                  ? editorStyles["project-template-editor__photo-slot--preview"]
                  : ""
              }`}
            >
              {slot ? (
                <>
                  <img
                    src={slot.displayUrl}
                    alt=""
                    className={editorStyles["project-template-editor__photo-preview"]}
                  />
                  <button
                    type="button"
                    className={editorStyles["project-template-editor__photo-remove"]}
                    onClick={() => void handleRemove(index)}
                    disabled={isBusy}
                    aria-label={`Удалить фото ${index + 1}`}
                  >
                    ×
                  </button>
                </>
              ) : (
                <label
                  className={editorStyles["project-template-editor__photo-add"]}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className={editorStyles["project-template-editor__photo-input"]}
                    onChange={(event) => void handleAdd(index, event)}
                    disabled={isBusy}
                  />
                  <span
                    className={editorStyles["project-template-editor__photo-add-icon"]}
                    aria-hidden
                  >
                    {slotBusy ? "…" : "+"}
                  </span>
                  <span className={editorStyles["project-template-editor__photo-add-text"]}>
                    {isPreviewSlot ? "Превью" : "Фото"}
                  </span>
                </label>
              )}
            </div>
          );
        })}
      </div>

      {error ? (
        <p
          className={editorStyles["project-template-editor__skills-error"]}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
