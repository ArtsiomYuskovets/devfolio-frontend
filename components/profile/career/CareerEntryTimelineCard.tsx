import { memo } from "react";
import type { ProfileCareerEntry } from "@/types/types";
import { formatCareerDateRange, getCareerTypeMeta } from "./career.utils";
import styles from "./CareerEntryTimelineCard.module.scss";

type CareerEntryTimelineCardProps = {
  entry: ProfileCareerEntry;
};

function CareerEntryTimelineCardComponent({
  entry,
}: CareerEntryTimelineCardProps) {
  const meta = getCareerTypeMeta(entry.type);

  return (
    <article className={styles["career-entry-timeline-card"]}>
      <div className={styles["career-entry-timeline-card__icon"]}>
        {meta.icon}
      </div>
      <div className={styles["career-entry-timeline-card__content"]}>
        <div className={styles["career-entry-timeline-card__meta"]}>
          {formatCareerDateRange(entry)}
        </div>
        <h3 className={styles["career-entry-timeline-card__title"]}>
          {entry.title}
        </h3>
        <p className={styles["career-entry-timeline-card__place"]}>
          {entry.organization}
        </p>
        <p className={styles["career-entry-timeline-card__text"]}>
          {entry.description}
        </p>
      </div>
    </article>
  );
}

export const CareerEntryTimelineCard = memo(CareerEntryTimelineCardComponent);
