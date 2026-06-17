import type { TextareaHTMLAttributes } from "react";
import { FieldLabel } from "@/components/ui/field-label/FieldLabel";
import styles from "./TextareaField.module.scss";

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  variant?: "default" | "darkSurface";
  error?: string;
  requiredMark?: boolean;
};

export function TextareaField({
  label,
  className,
  value,
  placeholder,
  variant = "default",
  error,
  requiredMark = false,
  ...props
}: TextareaFieldProps) {
  const onDark = variant === "darkSurface";

  return (
    <div
      className={[
        styles.field,
        onDark ? styles["field--darkSurface"] : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <FieldLabel required={requiredMark}>{label}</FieldLabel>
      <textarea
        className={[
          styles.textarea,
          onDark ? styles["textarea--darkSurface"] : "",
          error ? styles["textarea--error"] : "",
        ]
          .filter(Boolean)
          .join(" ")}
        value={value}
        placeholder={placeholder}
        aria-invalid={!!error}
        {...props}
      />
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}