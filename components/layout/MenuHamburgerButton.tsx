"use client";

import styles from "./MenuHamburgerButton.module.scss";

type MenuHamburgerButtonProps = {
  onOpen: () => void;
  label?: string;
  /** Состояние открытого выезжающего меню (для aria) */
  menuOpen?: boolean;
};

export function MenuHamburgerButton({
  onOpen,
  label = "Открыть меню",
  menuOpen = false,
}: MenuHamburgerButtonProps) {
  return (
    <button
      type="button"
      className={styles.trigger}
      onClick={onOpen}
      aria-label={label}
      aria-expanded={menuOpen}
    >
      <span />
      <span />
      <span />
    </button>
  );
}
