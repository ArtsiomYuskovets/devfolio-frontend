"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./ImageLightbox.module.scss";

type ImageLightboxProps = {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
};

export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  alt = "Изображение",
}: ImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft" && images.length > 1) {
        setActiveIndex((index) =>
          index <= 0 ? images.length - 1 : index - 1
        );
      }
      if (event.key === "ArrowRight" && images.length > 1) {
        setActiveIndex((index) =>
          index >= images.length - 1 ? 0 : index + 1
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, images.length, onClose]);

  const goPrev = useCallback(() => {
    if (images.length < 2) {
      return;
    }
    setActiveIndex((index) => (index <= 0 ? images.length - 1 : index - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    if (images.length < 2) {
      return;
    }
    setActiveIndex((index) => (index >= images.length - 1 ? 0 : index + 1));
  }, [images.length]);

  if (!isOpen || images.length === 0) {
    return null;
  }

  const safeIndex = Math.min(activeIndex, images.length - 1);
  const currentImage = images[safeIndex];

  return (
    <div className={styles["image-lightbox"]} role="dialog" aria-modal="true">
      <button
        type="button"
        className={styles["image-lightbox__backdrop"]}
        onClick={onClose}
        aria-label="Закрыть"
      />

      <button
        type="button"
        className={styles["image-lightbox__close"]}
        onClick={onClose}
        aria-label="Закрыть"
      >
        ×
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            className={`${styles["image-lightbox__nav"]} ${styles["image-lightbox__nav--prev"]}`}
            onClick={goPrev}
            aria-label="Предыдущее фото"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles["image-lightbox__nav"]} ${styles["image-lightbox__nav--next"]}`}
            onClick={goNext}
            aria-label="Следующее фото"
          >
            ›
          </button>
        </>
      ) : null}

      <div className={styles["image-lightbox__stage"]}>
        <img
          src={currentImage}
          alt={alt}
          className={styles["image-lightbox__img"]}
        />
      </div>

      {images.length > 1 ? (
        <p className={styles["image-lightbox__counter"]}>
          {safeIndex + 1} / {images.length}
        </p>
      ) : null}
    </div>
  );
}
