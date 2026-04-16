import { memo } from "react";
import type { ProfileCareerEntry } from "@/types/types";
import { formatCareerDateRange, getCareerTypeMeta } from "./career.utils";
import styles from "./CareerTimelinePreview.module.scss";

type CareerTimelinePreviewProps = {
  entries: ProfileCareerEntry[];
};

function CareerTimelinePreviewComponent({
  entries,
}: CareerTimelinePreviewProps) {
  return (
    <div className={styles["career-timeline-preview"]}>
      {entries.map((entry) => {
        const meta = getCareerTypeMeta(entry.type);

        return (
          <div key={entry.id} className={styles["career-timeline-preview__item"]}>
            <span className={styles["career-timeline-preview__icon"]}>
              {meta.icon}
            </span>
            <div className={styles["career-timeline-preview__content"]}>
              <p className={styles["career-timeline-preview__meta"]}>
                {formatCareerDateRange(entry)}
              </p>
              <p className={styles["career-timeline-preview__title"]}>
                {entry.title}
              </p>
              <p className={styles["career-timeline-preview__place"]}>
                {entry.organization}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const CareerTimelinePreview = memo(CareerTimelinePreviewComponent);
