import type { TextareaHTMLAttributes } from "react";
import styles from "./TextareaField.module.scss";

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function TextareaField({
  label,
  className,
  value,
  placeholder,
  ...props
}: TextareaFieldProps) {
  return (
    <label className={[styles.field, className].filter(Boolean).join(" ")}>
      <span className={styles.label}>{label}</span>
      <textarea
        className={styles.textarea}
        value={value}
        placeholder={placeholder}
        readOnly
        {...props}
      />
    </label>
  );
}