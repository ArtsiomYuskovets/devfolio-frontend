import styles from "./FieldLabel.module.scss";

type FieldLabelProps = {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

export function FieldLabel({
  htmlFor,
  children,
  required = false,
  className,
}: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={[styles.label, className].filter(Boolean).join(" ")}
    >
      {children}
      {required ? (
        <span className={styles.required} aria-hidden="true">
          {" "}
          *
        </span>
      ) : null}
    </label>
  );
}
