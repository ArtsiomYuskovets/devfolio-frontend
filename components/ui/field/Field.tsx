import type { ReactNode } from "react";
import { Input } from "@/components/ui/input/Input";
import styles from "./Field.module.scss";

type FieldProps = {
  label: string;
  placeholder: string;
  value?: string;
  className?: string;
  rightAdornment?: ReactNode;
};

export function Field({
  label,
  placeholder,
  value,
  className,
  rightAdornment,
}: FieldProps) {
  return (
    <label className={[styles.field, className].filter(Boolean).join(" ")}>
      <span className={styles.label}>{label}</span>
      <Input
        className={styles.input}
        variant="primary-light"
        placeholder={placeholder}
        value={value ?? ""}
        readOnly
        rightAdornment={rightAdornment}
      />
    </label>
  );
}