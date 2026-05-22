"use client";

import { useCallback } from "react";
import { useProjectLike } from "./useProjectLike";

type ProjectLikeButtonProps = {
  projectId: string;
  likesCount?: number;
  className?: string;
  activeClassName?: string;
  size?: "compact" | "action";
};

export function ProjectLikeButton({
  projectId,
  likesCount,
  className = "",
  activeClassName = "",
  size = "compact",
}: ProjectLikeButtonProps) {
  const { isLiked, isBusy, isStatusLoading, toggle, canLike } =
    useProjectLike(projectId);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      void toggle();
    },
    [toggle]
  );

  const label = isLiked ? "Убрать лайк" : "Поставить лайк";
  const countLabel =
    typeof likesCount === "number" ? ` ${likesCount}` : "";

  return (
    <button
      type="button"
      className={`${className} ${isLiked ? activeClassName : ""}`.trim()}
      data-size={size}
      aria-label={label}
      title={label}
      disabled={!canLike || isBusy || isStatusLoading}
      onClick={handleClick}
    >
      <span aria-hidden="true">{isLiked ? "♥" : "♡"}</span>
      {size === "action" ? (
        <span>
          {isLiked ? "Лайк поставлен" : "Лайк"}
          {countLabel}
        </span>
      ) : (
        <span>{countLabel.trim() || null}</span>
      )}
    </button>
  );
}
