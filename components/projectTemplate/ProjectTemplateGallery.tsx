"use client";

import { useCallback, useMemo, useState } from "react";
import { ImageLightbox } from "@/components/ui/image-lightbox/ImageLightbox";
import styles from "./ProjectTemplate.module.scss";

type ProjectTemplateGalleryProps = {
  images: string[];
};

function GalleryChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className={styles["project-template__arrow-icon"]}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={direction === "left" ? "M15 6L9 12L15 18" : "M9 6L15 12L9 18"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function ProjectTemplateGallery({ images }: ProjectTemplateGalleryProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(() => new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const visibleImages = useMemo(
    () => images.filter((url) => !brokenUrls.has(url)),
    [images, brokenUrls]
  );

  const safeSlide =
    visibleImages.length > 0
      ? Math.min(activeSlide, visibleImages.length - 1)
      : 0;

  const currentImage = visibleImages[safeSlide];

  const goPrev = useCallback(() => {
    if (visibleImages.length < 2) return;
    setActiveSlide((i) => (i <= 0 ? visibleImages.length - 1 : i - 1));
  }, [visibleImages.length]);

  const goNext = useCallback(() => {
    if (visibleImages.length < 2) return;
    setActiveSlide((i) => (i >= visibleImages.length - 1 ? 0 : i + 1));
  }, [visibleImages.length]);

  const markBroken = useCallback((url: string) => {
    setBrokenUrls((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }, []);

  const openLightbox = useCallback(() => {
    if (currentImage) {
      setLightboxOpen(true);
    }
  }, [currentImage]);

  return (
    <>
      <div className={styles["project-template__preview-wrap"]}>
        <div className={styles["project-template__preview-frame"]}>
          <button
            type="button"
            className={`${styles["project-template__preview"]} ${
              currentImage
                ? styles["project-template__preview--clickable"]
                : styles["project-template__preview--empty"]
            }`}
            onClick={openLightbox}
            disabled={!currentImage}
            aria-label="Открыть фото полностью"
          >
            {currentImage ? (
              <img
                src={currentImage}
                alt=""
                className={styles["project-template__preview-img"]}
                onError={() => markBroken(currentImage)}
              />
            ) : (
              <svg
                className={styles["project-template__preview-icon"]}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M13 21.5C13 18.4624 15.4624 16 18.5 16H45.5C48.5376 16 51 18.4624 51 21.5V42.5C51 45.5376 48.5376 48 45.5 48H18.5C15.4624 48 13 45.5376 13 42.5V21.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M24 16L27.5 12H36.5L40 16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="2" />
                <circle cx="21" cy="24" r="2" fill="currentColor" />
              </svg>
            )}
          </button>

          {visibleImages.length > 1 ? (
            <>
              <button
                type="button"
                className={`${styles["project-template__arrow"]} ${styles["project-template__arrow--prev"]}`}
                aria-label="Предыдущее фото"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrev();
                }}
              >
                <GalleryChevronIcon direction="left" />
              </button>

              <button
                type="button"
                className={`${styles["project-template__arrow"]} ${styles["project-template__arrow--next"]}`}
                aria-label="Следующее фото"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
              >
                <GalleryChevronIcon direction="right" />
              </button>
            </>
          ) : null}
        </div>
      </div>
      {visibleImages.length > 1 ? (
        <div className={styles["project-template__thumbs"]}>
          {visibleImages.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              className={`${styles["project-template__thumb"]} ${
                index === safeSlide
                  ? styles["project-template__thumb--active"]
                  : ""
              }`}
              onClick={() => setActiveSlide(index)}
              aria-label={`Фото ${index + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      ) : null}

      <ImageLightbox
        images={visibleImages}
        initialIndex={safeSlide}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt="Фото проекта"
      />
    </>
  );
}
