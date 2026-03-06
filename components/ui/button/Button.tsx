import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import styles from "./Button.module.scss";

type ButtonVariant = 
  |"primary-dark" 
  | "primary-light" 
  | "primary-transparent" 
  | "primary-gray" 
  | "outline-dark" 
  | "outline-light"
  | "outline-transparent"
  | "outline-gray";
type ButtonSize = "small" | "normal" | "large" | "wide";

interface ButtonProps
  extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant,
  size,
  className,
  children,
  ...props
}: ButtonProps) {
  const sizeKey = size ?? "normal";
  const classes = [
    styles.button,
    variant && styles[`button--${variant}`],
    styles[`button--size-${sizeKey}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

