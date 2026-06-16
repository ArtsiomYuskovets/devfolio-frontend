import type { TextareaHTMLAttributes } from "react";
import styles from "./TextareaField.module.scss";

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  variant?: "default" | "darkSurface";
};

export function TextareaField({
  label,
  className,
  value,
  placeholder,
  variant = "default",
  ...props
}: TextareaFieldProps) {
  const onDark = variant === "darkSurface";

  return (
    <label
      className={[
        styles.field,
        onDark ? styles["field--darkSurface"] : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.label}>{label}</span>
      <textarea
        className={[styles.textarea, onDark ? styles["textarea--darkSurface"] : ""]
          .filter(Boolean)
          .join(" ")}
        value={value}
        placeholder={placeholder}
        {...props}
      />
    </label>
  );
}