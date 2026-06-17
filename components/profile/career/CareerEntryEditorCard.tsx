import { memo, useMemo } from "react";
import { Input } from "@/components/ui/input/Input";
import type { ProfileCareerEntry, ProfileCareerEntryType } from "@/types/types";
import {
  CAREER_MONTH_OPTIONS,
  CAREER_TYPE_OPTIONS,
  CAREER_YEAR_OPTIONS,
} from "./career.constants";
import { getCareerTypeMeta } from "./career.utils";
import styles from "./CareerEntryEditorCard.module.scss";

type CareerEntryEditorCardProps = {
  entry: ProfileCareerEntry;
  onChange: (entryId: string, nextEntry: ProfileCareerEntry) => void;
  onRemove: (entryId: string) => void;
};

function CareerEntryEditorCardComponent({
  entry,
  onChange,
  onRemove,
}: CareerEntryEditorCardProps) {
  const meta = getCareerTypeMeta(entry.type);
  const availableEndMonths = useMemo(() => {
    if (!entry.endDate || entry.startDate.year !== entry.endDate.year) {
      return CAREER_MONTH_OPTIONS;
    }

    return CAREER_MONTH_OPTIONS.filter(
      (monthOption) => monthOption.value >= entry.startDate.month
    );
  }, [entry.endDate, entry.startDate.month, entry.startDate.year]);

  const availableEndYears = useMemo(
    () =>
      CAREER_YEAR_OPTIONS.filter((yearOption) => yearOption >= entry.startDate.year),
    [entry.startDate.year]
  );

  return (
    <article className={styles["career-entry-editor-card"]}>
      <div className={styles["career-entry-editor-card__top"]}>
        <span className={styles["career-entry-editor-card__badge"]}>
          {meta.icon} {meta.label}
        </span>

        <div className={styles["career-entry-editor-card__top-actions"]}>
          <select
            className={styles["career-entry-editor-card__select"]}
            value={entry.type}
            onChange={(e) =>
              onChange(entry.id, {
                ...entry,
                type: e.target.value as ProfileCareerEntryType,
              })
            }
          >
            {CAREER_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={styles["career-entry-editor-card__remove"]}
            onClick={() => onRemove(entry.id)}
            aria-label="Удалить запись"
          >
            ×
          </button>
        </div>
      </div>

      <div className={styles["career-entry-editor-card__grid"]}>
        <Input
          variant="primary-light"
          className={styles["career-entry-editor-card__input"]}
          label="Название"
          requiredMark
          placeholder="Название"
          value={entry.title}
          onChange={(e) =>
            onChange(entry.id, { ...entry, title: e.target.value })
          }
        />
        <Input
          variant="primary-light"
          className={styles["career-entry-editor-card__input"]}
          label="Компания / курс / университет"
          requiredMark
          placeholder="Компания / курс / университет"
          value={entry.organization}
          onChange={(e) =>
            onChange(entry.id, { ...entry, organization: e.target.value })
          }
        />
      </div>

      <div className={styles["career-entry-editor-card__dates"]}>
        <div className={styles["career-entry-editor-card__date-group"]}>
          <span className={styles["career-entry-editor-card__date-label"]}>
            Начало
          </span>
          <div className={styles["career-entry-editor-card__date-row"]}>
            <select
              className={styles["career-entry-editor-card__select"]}
              value={entry.startDate.month}
              onChange={(e) =>
                onChange(entry.id, {
                  ...entry,
                  startDate: {
                    ...entry.startDate,
                    month: Number(e.target.value),
                  },
                })
              }
            >
              {CAREER_MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              className={styles["career-entry-editor-card__select"]}
              value={entry.startDate.year}
              onChange={(e) =>
                onChange(entry.id, {
                  ...entry,
                  startDate: {
                    ...entry.startDate,
                    year: Number(e.target.value),
                  },
                })
              }
            >
              {CAREER_YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles["career-entry-editor-card__date-group"]}>
          <div className={styles["career-entry-editor-card__date-head"]}>
            <span className={styles["career-entry-editor-card__date-label"]}>
              Окончание
            </span>
            <label className={styles["career-entry-editor-card__checkbox"]}>
              <input
                type="checkbox"
                checked={entry.endDate === null}
                onChange={(e) =>
                  onChange(entry.id, {
                    ...entry,
                    endDate: e.target.checked ? null : { ...entry.startDate },
                  })
                }
              />
              <span>По настоящее время</span>
            </label>
          </div>

          {entry.endDate ? (
            <div className={styles["career-entry-editor-card__date-row"]}>
              <select
                className={styles["career-entry-editor-card__select"]}
                value={entry.endDate.month}
                onChange={(e) =>
                  onChange(entry.id, {
                    ...entry,
                    endDate: {
                      ...entry.endDate!,
                      month: Number(e.target.value),
                    },
                  })
                }
              >
                {availableEndMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>

              <select
                className={styles["career-entry-editor-card__select"]}
                value={entry.endDate.year}
                onChange={(e) =>
                  onChange(entry.id, {
                    ...entry,
                    endDate: {
                      ...entry.endDate!,
                      year: Number(e.target.value),
                    },
                  })
                }
              >
                {availableEndYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className={styles["career-entry-editor-card__current"]}>
              Настоящее время
            </div>
          )}
        </div>
      </div>

      <textarea
        className={styles["career-entry-editor-card__textarea"]}
        placeholder="Краткое описание этапа"
        value={entry.description}
        onChange={(e) =>
          onChange(entry.id, { ...entry, description: e.target.value })
        }
      />
    </article>
  );
}

export const CareerEntryEditorCard = memo(CareerEntryEditorCardComponent);
