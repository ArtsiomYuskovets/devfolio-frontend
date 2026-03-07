import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.scss";

export type InputVariant =
  | "primary-dark"
  | "primary-light"
  | "primary-transparent"
  | "primary-gray"
  | "outline-dark"
  | "outline-light"
  | "outline-transparent"
  | "outline-gray";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  rightAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "primary-dark",
      label,
      error,
      className,
      id,
      rightAdornment,
      ...props
    },
    ref
  ) => {
    const inputId = useId();

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputRow}>
          <input
            ref={ref}
            id={inputId}
            className={[
              styles.input,
              styles[`input--${variant}`],
              error ? styles["input--error"] : "",
              rightAdornment ? styles["input--hasAdornment"] : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightAdornment && (
            <div className={styles.adornment}>{rightAdornment}</div>
          )}
        </div>
        {error && (
          <span id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
