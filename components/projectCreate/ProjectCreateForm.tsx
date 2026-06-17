"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { TextareaField } from "@/components/ui/textarea-field/TextareaField";
import { pickProjectId } from "@/lib/projectId";
import {
  IMAGE_UPLOAD_HINT,
  validateImageFile,
  validateProjectForm,
} from "@/lib/formValidation";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUploadPreviewImageMutation,
  useUploadProjectPhotoMutation,
} from "@/stores/projects/projectsApi";
import styles from "./ProjectCreateForm.module.scss";

const PHOTO_SLOT_COUNT = 5;

type PhotoSlot = { file: File; previewUrl: string } | null;

function formatApiError(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (e.status === "FETCH_ERROR" && typeof e.error === "string") {
      return e.error;
    }
  }

  if (typeof err === "object" && err !== null && "status" in err) {
    const status = (err as { status?: number }).status;
    const data = (err as { data?: unknown }).data;

    let detail = "";
    if (typeof data === "string") {
      detail = data;
    } else if (data && typeof data === "object") {
      const o = data as Record<string, unknown>;
      if (typeof o.message === "string") {
        detail = o.message;
      } else if (typeof o.error === "string") {
        detail = o.error;
      } else if (Array.isArray(o.errors)) {
        detail = o.errors.map(String).join("; ");
      } else {
        try {
          detail = JSON.stringify(data);
        } catch {
          detail = "";
        }
      }
    }

    const prefix =
      typeof status === "number" ? `[${status}] ` : "";
    let msg = `${prefix}${detail || "Ошибка сервера"}`.trim();
    if (status === 403) {
      msg +=
        " Доступ запрещён на сервере: проверьте правила Spring Security для POST /api/projects, …/preview и …/images (роль пользователя), при необходимости CSRF для cookie-сессии.";
    }
    return msg;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Неизвестная ошибка";
}

export function ProjectCreateForm() {
  const router = useRouter();
  const [createProject] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [uploadPreviewImage] = useUploadPreviewImageMutation();
  const [uploadProjectPhoto] = useUploadProjectPhotoMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [projectPublic, setProjectPublic] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>(() =>
    Array.from({ length: PHOTO_SLOT_COUNT }, () => null)
  );

  const slotsRef = useRef(photoSlots);
  slotsRef.current = photoSlots;

  useEffect(() => {
    return () => {
      slotsRef.current.forEach((s) => {
        if (s?.previewUrl) {
          URL.revokeObjectURL(s.previewUrl);
        }
      });
    };
  }, []);

  const setPhotoAt = useCallback((index: number, file: File | null) => {
    setPhotoSlots((prev) => {
      const next = [...prev];
      const current = next[index];
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      if (!file) {
        next[index] = null;
        return next;
      }

      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setFieldErrors((prev) => ({
          ...prev,
          [`photo-${index}`]: validation.error ?? "Некорректный файл",
        }));
        return prev;
      }
      setFieldErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[`photo-${index}`];
        return nextErrors;
      });

      next[index] = { file, previewUrl: URL.createObjectURL(file) };
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateProjectForm({
        name,
        githubUrl,
      });
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setErrorMessage(null);
        return;
      }

      for (let i = 0; i < photoSlots.length; i++) {
        const slot = photoSlots[i];
        if (!slot?.file) {
          continue;
        }
        const photoValidation = validateImageFile(slot.file);
        if (!photoValidation.isValid) {
          setFieldErrors({
            [`photo-${i}`]:
              photoValidation.error ?? "Некорректный файл изображения",
          });
          setErrorMessage(null);
          return;
        }
      }

      setFieldErrors({});
      setErrorMessage(null);
      setIsSubmitting(true);

      try {
        const trimmedName = name.trim();
        const created = await createProject({
          name: trimmedName,
          description: description.trim(),
          shortDescription: shortDescription.trim(),
          githubUrl: githubUrl.trim(),
          projectPublic,
        }).unwrap();

        const id =
          pickProjectId(created) ?? created.projectId?.trim() ?? "";
        if (!id) {
          setErrorMessage("Сервер не вернул идентификатор проекта.");
          return;
        }

        const first = photoSlots[0];
        try {
          if (first?.file) {
            await uploadPreviewImage({
              projectId: id,
              image: first.file,
            }).unwrap();
          }
          for (let i = 1; i < PHOTO_SLOT_COUNT; i++) {
            const slot = photoSlots[i];
            if (slot?.file) {
              await uploadProjectPhoto({
                projectId: id,
                photo: slot.file,
              }).unwrap();
            }
          }
        } catch (uploadErr) {
          try {
            await deleteProject(id).unwrap();
            setErrorMessage(
              `Фото не загрузились; проект не сохранён. ${formatApiError(uploadErr)}`
            );
          } catch (delErr) {
            setErrorMessage(
              `Фото не загрузились, проект остался без нужных файлов. Не удалось удалить проект: ${formatApiError(delErr)}. Ошибка загрузки: ${formatApiError(uploadErr)}`
            );
          }
          return;
        }

        router.replace("/profile");
      } catch (err) {
        setErrorMessage(`Не удалось создать проект. ${formatApiError(err)}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      createProject,
      deleteProject,
      name,
      description,
      shortDescription,
      githubUrl,
      projectPublic,
      photoSlots,
      router,
      uploadPreviewImage,
      uploadProjectPhoto,
    ]
  );

  return (
    <form className={styles.page} onSubmit={handleSubmit} noValidate>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <h1 className={styles.title}>Новый проект</h1>
          <p className={styles.lead}>
            Первое фото — превью, ещё до четырёх — галерея. Проект появится в
            профиле только если текст сохранился и все выбранные фото успели
            загрузиться; при ошибке загрузки фото создание отменяется.
          </p>
          <p className={styles.requiredNote}>
            <span className={styles.requiredMark}>*</span> — обязательное поле
          </p>
        </header>

        <div className={styles.card}>
          <section className={styles.section} aria-labelledby="section-about">
            <h2 id="section-about" className={styles.sectionTitle}>
              О проекте
            </h2>
            <div className={styles.fields}>
              <Input
                variant="outline-light"
                label="Название"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }
                }}
                placeholder="Например: Devfolio API"
                requiredMark
                error={fieldErrors.name}
                autoComplete="off"
              />

              <TextareaField
                variant="darkSurface"
                label="Описание"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Полное описание проекта"
                rows={5}
              />

              <TextareaField
                variant="darkSurface"
                label="Краткое описание"
                name="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Одна–две строки для карточек и списков"
                rows={2}
              />

              <Input
                variant="outline-light"
                label="Ссылка на GitHub"
                requiredMark
                name="githubUrl"
                type="url"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value);
                  if (fieldErrors.githubUrl) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.githubUrl;
                      return next;
                    });
                  }
                }}
                placeholder="https://github.com/..."
                error={fieldErrors.githubUrl}
                autoComplete="off"
              />

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={projectPublic}
                  onChange={(e) => setProjectPublic(e.target.checked)}
                />
                Публичный проект
              </label>
            </div>
          </section>

          <section
            className={styles.section}
            aria-labelledby="section-photos"
          >
            <h2 id="section-photos" className={styles.sectionTitle}>
              Фотографии
            </h2>
            <p className={styles.sectionHint}>
              До пяти файлов: первый слот — превью, остальные — галерея.{" "}
              {IMAGE_UPLOAD_HINT} Пока не нажали «Создать проект», «×» только
              убирает файл со слота.
            </p>

            <div className={styles.photoGrid}>
              {photoSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`${styles.photoSlot} ${
                    slot ? styles["photoSlot--filled"] : ""
                  } ${index === 0 ? styles["photoSlot--previewRole"] : ""}`}
                >
                  {slot ? (
                    <>
                      <img
                        src={slot.previewUrl}
                        alt=""
                        className={styles.photoPreview}
                      />
                      <button
                        type="button"
                        className={styles.photoRemove}
                        onClick={() => setPhotoAt(index, null)}
                        aria-label={`Убрать фото из слота ${index + 1}`}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <label className={styles.photoAdd}>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.photoInput}
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          e.target.value = "";
                          if (f) {
                            setPhotoAt(index, f);
                          }
                        }}
                      />
                      <span className={styles.photoAddIcon} aria-hidden>
                        +
                      </span>
                      <span className={styles.photoAddText}>
                        {index === 0 ? "Превью" : "Фото"}
                      </span>
                    </label>
                  )}
                </div>
              ))}
            </div>
            {Object.entries(fieldErrors)
              .filter(([key]) => key.startsWith("photo-"))
              .map(([key, message]) => (
                <p key={key} className={styles.error} role="alert">
                  {message}
                </p>
              ))}
          </section>

          {errorMessage ? (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className={styles.actions}>
            <Button
              type="submit"
              variant="outline-light"
              size="normal"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Сохранение…" : "Создать проект"}
            </Button>
            <Button
              type="button"
              variant="outline-dark"
              size="normal"
              disabled={isSubmitting}
              onClick={() => router.back()}
            >
              Отмена
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
