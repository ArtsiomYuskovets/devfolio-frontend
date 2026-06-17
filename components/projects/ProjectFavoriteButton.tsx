"use client";

import { useCallback } from "react";
import { useProjectFavorite } from "./useProjectFavorite";

type ProjectFavoriteButtonProps = {
  projectId: string;
  ownerUserId?: string;
  className?: string;
  activeClassName?: string;
  disabledClassName?: string;
};

export function ProjectFavoriteButton({
  projectId,
  ownerUserId,
  className = "",
  activeClassName = "",
  disabledClassName = "",
}: ProjectFavoriteButtonProps) {
  const { isFavorite, isOwnProject, isBusy, toggle, canFavorite } =
    useProjectFavorite(projectId, ownerUserId);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      void toggle();
    },
    [toggle]
  );

  if (isOwnProject) {
    return (
      <button
        type="button"
        className={`${className} ${disabledClassName}`.trim()}
        disabled
        aria-label="Нельзя добавить свой проект в избранное"
        title="Нельзя добавить свой проект в избранное"
        onClick={(e) => e.stopPropagation()}
      >
        ☆
      </button>
    );
  }

  const label = isFavorite
    ? "Убрать из избранного"
    : "Добавить в избранное";

  return (
    <button
      type="button"
      className={`${className} ${isFavorite ? activeClassName : ""}`.trim()}
      aria-label={label}
      title={label}
      disabled={!canFavorite || isBusy}
      onClick={handleClick}
    >
      {isFavorite ? "★" : "☆"}
    </button>
  );
}
