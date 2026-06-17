import type { ReactNode } from "react";
import styles from "./SectionTitle.module.scss";

type SectionTitleProps = {
  children: ReactNode;
};

export function SectionTitle({ children }: SectionTitleProps) {
  return <div className={styles["section-title"]}>{children}</div>;
}