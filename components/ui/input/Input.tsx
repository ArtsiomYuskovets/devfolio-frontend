import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { FieldLabel } from "@/components/ui/field-label/FieldLabel";
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
  requiredMark?: boolean;
  rightAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const {
      variant = "primary-dark",
      label,
      error,
      requiredMark = false,
      className,
      id,
      rightAdornment,
      value,
      ...rest
    } = props;
    const inputId = useId();
    const isControlled = Object.prototype.hasOwnProperty.call(props, "value");

    return (
      <div className={styles.wrapper}>
        {label && (
          <FieldLabel htmlFor={inputId} required={requiredMark}>
            {label}
          </FieldLabel>
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
            {...(isControlled ? { value: value ?? "" } : {})}
            {...rest}
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
